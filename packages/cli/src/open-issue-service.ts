import { Command, type CommandExecutor } from "@effect/platform"
import { Context, Effect, Layer, Schema } from "effect"

const REPO_URL = "https://github.com/adamferguson/xai-solutions"

export type OpenIssueCategory = "Topic Request" | "Fix" | "Improvement"

export class OpenIssueError extends Schema.TaggedError<OpenIssueError>()("OpenIssueError", {
  message: Schema.String,
  url: Schema.String,
}) {}

export type OpenIssueInput = {
  category?: OpenIssueCategory
  title?: string
  description?: string
}

export type OpenIssueResult = {
  issueUrl: string
}

export class BrowserService extends Context.Tag("@cli/BrowserService")<
  BrowserService,
  {
    readonly open: (url: string) => Effect.Effect<void, OpenIssueError, CommandExecutor.CommandExecutor>
  }
>() {
  static readonly layer = Layer.effect(
    BrowserService,
    Effect.gen(function* () {
      const open = (url: string) =>
        Effect.gen(function* () {
          // Use 'open' on macOS, 'xdg-open' on Linux, 'start' on Windows
          const command =
            process.platform === "darwin"
              ? Command.make("open", url)
              : process.platform === "win32"
                ? Command.make("cmd", "/c", "start", url)
                : Command.make("xdg-open", url)

          yield* Command.exitCode(command)
        }).pipe(
          Effect.mapError(
            (error) =>
              new OpenIssueError({
                message: `Failed to open browser: ${error}`,
                url,
              }),
          ),
        )

      return BrowserService.of({ open })
    }),
  )
}

export class IssueService extends Context.Tag("@cli/IssueService")<
  IssueService,
  {
    readonly open: (input: OpenIssueInput) => Effect.Effect<OpenIssueResult, OpenIssueError, CommandExecutor.CommandExecutor>
  }
>() {
  static readonly layer = Layer.effect(
    IssueService,
    Effect.gen(function* () {
      const browser = yield* BrowserService

      const open = (input: OpenIssueInput) =>
        Effect.gen(function* () {
          const params = new URLSearchParams()

          if (input.category) {
            params.set("labels", input.category.toLowerCase().replace(" ", "-"))
          }

          if (input.title) {
            params.set("title", input.title)
          }

          if (input.description) {
            params.set("body", input.description)
          }

          const issueUrl = `${REPO_URL}/issues/new?${params.toString()}`

          yield* browser.open(issueUrl)

          return { issueUrl }
        })

      return IssueService.of({ open })
    }),
  )
}
