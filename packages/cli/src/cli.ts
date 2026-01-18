#!/usr/bin/env bun

import { Args, Command as CliCommand, Options } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect, Layer, Option, pipe } from "effect"
import pc from "picocolors"
import pkg from "../package.json" with { type: "json" }
import { DOC_LOOKUP, DOCS } from "./docs-manifest"
import { GitService, XAISolutionsService } from "./xai-solutions-service"
import { BrowserService, IssueService, type OpenIssueCategory } from "./open-issue-service"

const CLI_NAME = "xai-solutions"
const CLI_VERSION = pkg.version

const isDocSlug = (value: string): value is keyof typeof DOC_LOOKUP => value in DOC_LOOKUP

const colorizeCodeReferences = (text: string): string => {
  return (
    text
      // Commands in bold green
      .replace(/`bunx [^`]+`/g, (match) => pc.bold(pc.green(match)))
      .replace(/`bun run [^`]+`/g, (match) => pc.bold(pc.green(match)))
      // File references in cyan
      .replace(/`[^`]+\.(ts|json|toml|md)`/g, (match) => pc.cyan(match))
      // Other code in dim
      .replace(/`[^`]+`/g, (match) => pc.dim(match))
  )
}

const MIN_TERMINAL_WIDTH = 40
const FALLBACK_TERMINAL_WIDTH = 80
const MIN_DESCRIPTION_WIDTH = 20

const getTerminalWidth = () => {
  const width = typeof process.stdout?.columns === "number" ? process.stdout.columns : FALLBACK_TERMINAL_WIDTH
  return Math.max(MIN_TERMINAL_WIDTH, width)
}

const wrapText = (text: string, maxWidth: number) => {
  if (text.trim() === "" || maxWidth <= 0) {
    return [text]
  }

  const words = text.split(/\s+/)
  const lines: Array<string> = []
  let current = ""

  for (const word of words) {
    if (current.length === 0) {
      current = word
      continue
    }

    if (current.length + 1 + word.length <= maxWidth) {
      current = `${current} ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current.length > 0) {
    lines.push(current)
  }

  return lines
}

export const renderDocList = () => {
  const indent = "  "
  const width = getTerminalWidth()
  const descriptionWidth = Math.max(MIN_DESCRIPTION_WIDTH, width - indent.length)

  const cards = DOCS.map((doc) => {
    const titleLine = `${pc.green(doc.slug)}  ${pc.bold(pc.cyan(doc.title))}`
    const wrappedDescription = wrapText(doc.description, descriptionWidth).map((line) => `${indent}${pc.dim(line)}`)

    return [titleLine, ...wrappedDescription].join("\n")
  })

  return `${cards.join("\n\n")}\n`
}

export const renderDocs = (requested: ReadonlyArray<string>) => {
  const slugs = requested.map((slug) => slug.trim()).filter(Boolean)

  if (slugs.length === 0) {
    throw new Error("Please provide at least one doc slug.")
  }

  const unknown = slugs.filter((slug) => !isDocSlug(slug))
  if (unknown.length > 0) {
    throw new Error(`Unknown doc slug(s): ${unknown.join(", ")}`)
  }

  const uniqueSlugs = Array.from(new Set(slugs)) as Array<keyof typeof DOC_LOOKUP>
  const blocks = uniqueSlugs.map((slug) => {
    const doc = DOC_LOOKUP[slug]
    if (!doc) {
      throw new Error(`Internal error: doc ${slug} not found in lookup`)
    }
    const title = `${pc.bold(pc.cyan(`## ${doc.title}`))} ${pc.dim(`(${doc.slug})`)}`
    const body = colorizeCodeReferences(doc.body.trim())
    return [title, "", body].filter(Boolean).join("\n")
  })

  return `${blocks.join(`\n\n${pc.dim("---")}\n\n`)}\n`
}

const listDocs = Console.log(renderDocList())

const showDocs = (slugs: ReadonlyArray<string>) =>
  Effect.try(() => renderDocs(slugs)).pipe(Effect.flatMap((output) => Console.log(output)))

const listCommand = CliCommand.make("list").pipe(
  CliCommand.withDescription("List xAI Solutions documentation"),
  CliCommand.withHandler(() => listDocs),
)

const showCommand = CliCommand.make("show", {
  slugs: Args.text({ name: "slug" }).pipe(
    Args.withDescription("Doc slug(s) to display (e.g., text-generation, x-api-basics)"),
    Args.atLeast(1),
  ),
}).pipe(
  CliCommand.withDescription("Show one or more xAI Solutions docs"),
  CliCommand.withHandler(({ slugs }) => showDocs(slugs)),
)

const openIssueCommand = CliCommand.make("open-issue", {
  category: Options.text("category").pipe(
    Options.withDescription("Issue category: 'Topic Request', 'Fix', or 'Improvement'"),
    Options.optional,
  ),
  title: Options.text("title").pipe(Options.withDescription("Brief issue title"), Options.optional),
  description: Options.text("description").pipe(
    Options.withDescription("Detailed issue description"),
    Options.optional,
  ),
}).pipe(
  CliCommand.withDescription("Open a pre-filled GitHub issue in the xai-solutions repo"),
  CliCommand.withHandler(({ category, title, description }) =>
    Effect.gen(function* () {
      const issueService = yield* IssueService

      const input = {
        ...(Option.isSome(category) && {
          category: category.value as OpenIssueCategory,
        }),
        ...(Option.isSome(title) && { title: title.value }),
        ...(Option.isSome(description) && { description: description.value }),
      }

      const result = yield* issueService.open(input).pipe(
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* Console.error(pc.red(`Failed to open issue: ${error.message}`))
            return { issueUrl: error.url }
          }),
        ),
      )

      yield* Console.log(
        [pc.bold("xAI Solutions issue"), `URL: ${pc.cyan(result.issueUrl)}`].filter(Boolean).join("\n"),
      )
    }),
  ),
)

const setupCommand = CliCommand.make("setup").pipe(
  CliCommand.withDescription("Set up local xAI source reference for AI agents (.reference/xai/)"),
  CliCommand.withHandler(() =>
    Effect.gen(function* () {
      const service = yield* XAISolutionsService
      const cwd = process.cwd()

      yield* Console.log(pc.cyan("Setting up xAI source reference..."))

      const result = yield* service.setup(cwd)

      if (result.created) {
        yield* Console.log(pc.green("Created .reference/xai/ with xAI examples."))
      } else {
        yield* Console.log(pc.green("Updated xAI source reference."))
      }

      if (result.gitignoreUpdated) {
        yield* Console.log(pc.green("Added .reference/ to .gitignore"))
      }

      yield* Console.log(
        `\n${pc.bold("Done!")} AI agents can now search ${pc.cyan("./.reference/xai/")} for xAI implementations.`,
      )
    }),
  ),
)

export const cli = CliCommand.make(CLI_NAME).pipe(
  CliCommand.withDescription(
    "xAI Solutions CLI - Browse xAI Grok API and X API best practices documentation. " +
      "Built for both humans and AI agents to quickly access patterns, setup guides, and code examples.",
  ),
  CliCommand.withSubcommands([listCommand, showCommand, openIssueCommand, setupCommand]),
)

export const runCli = (argv: ReadonlyArray<string>) =>
  CliCommand.run(cli, {
    name: CLI_NAME,
    version: CLI_VERSION,
  })(argv)

const MainLayer = Layer.mergeAll(
  IssueService.layer.pipe(Layer.provide(BrowserService.layer)),
  XAISolutionsService.layer.pipe(Layer.provide(GitService.layer)),
).pipe(Layer.provideMerge(BunContext.layer))

if (import.meta.main) {
  pipe(
    runCli(process.argv),
    Effect.provide(MainLayer),
    Effect.tapErrorCause((cause) => Console.error(pc.red(`Error: ${cause}`))),
    Effect.catchAll(() => Effect.sync(() => process.exit(1))),
    BunRuntime.runMain,
  )
}
