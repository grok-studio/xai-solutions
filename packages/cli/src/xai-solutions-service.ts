import { Command, type CommandExecutor, FileSystem, Path } from "@effect/platform"
import { Context, Effect, Layer, Schema } from "effect"

const REFERENCE_DIR = ".reference"
const XAI_REPO = "https://github.com/adamferguson/xai-solutions.git"

export class SetupError extends Schema.TaggedError<SetupError>()("SetupError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}

export type SetupResult = {
  readonly xaiDir: string
  readonly created: boolean
  readonly gitignoreUpdated: boolean
}

// Git operations abstraction for testability
export class GitService extends Context.Tag("@cli/GitService")<
  GitService,
  {
    readonly clone: (
      repo: string,
      destination: string,
    ) => Effect.Effect<void, SetupError, CommandExecutor.CommandExecutor>
    readonly pull: (directory: string) => Effect.Effect<void, SetupError, CommandExecutor.CommandExecutor>
  }
>() {
  static readonly layer = Layer.effect(
    GitService,
    Effect.gen(function* () {
      const clone = (repo: string, destination: string) =>
        Effect.gen(function* () {
          const cloneCmd = Command.make("git", "clone", "--depth", "1", repo, destination)
          yield* Command.exitCode(cloneCmd)
        }).pipe(
          Effect.mapError(
            (error) =>
              new SetupError({
                message: `Git clone failed: ${error}`,
                cause: error,
              }),
          ),
        )

      const pull = (directory: string) =>
        Effect.gen(function* () {
          const pullCmd = Command.make("git", "-C", directory, "pull", "--depth", "1")
          yield* Command.exitCode(pullCmd)
        }).pipe(
          Effect.mapError(
            (error) =>
              new SetupError({
                message: `Git pull failed: ${error}`,
                cause: error,
              }),
          ),
        )

      return GitService.of({ clone, pull })
    }),
  )

  // Test layer that simulates git without network calls
  static readonly testLayer = Layer.effect(
    GitService,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      return GitService.of({
        clone: (_repo, destination) =>
          fs.makeDirectory(destination, { recursive: true }).pipe(
            Effect.mapError(
              (error) =>
                new SetupError({
                  message: `Test clone failed: ${error}`,
                  cause: error,
                }),
            ),
          ),
        pull: (_directory) => Effect.void,
      })
    }),
  )
}

export class XAISolutionsService extends Context.Tag("@cli/XAISolutionsService")<
  XAISolutionsService,
  {
    readonly setup: (cwd: string) => Effect.Effect<SetupResult, SetupError, CommandExecutor.CommandExecutor>
  }
>() {
  static readonly layer = Layer.effect(
    XAISolutionsService,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const git = yield* GitService

      const setup = Effect.fn("XAISolutionsService.setup")((cwd: string) =>
        Effect.gen(function* () {
          const referenceDir = path.join(cwd, REFERENCE_DIR)
          const xaiDir = path.join(referenceDir, "xai")
          const gitignorePath = path.join(cwd, ".gitignore")

          let created = false
          let gitignoreUpdated = false

          // Check if .reference/xai already exists
          const xaiExists = yield* fs.exists(xaiDir)
          if (xaiExists) {
            yield* git.pull(xaiDir)
          } else {
            // Create .reference directory if needed
            yield* fs.makeDirectory(referenceDir, { recursive: true })
            yield* git.clone(XAI_REPO, xaiDir)
            created = true
          }

          // Add .reference/ to .gitignore if not already there
          const gitignoreExists = yield* fs.exists(gitignorePath)
          if (gitignoreExists) {
            const content = yield* fs.readFileString(gitignorePath)
            if (!content.includes(REFERENCE_DIR)) {
              yield* fs.writeFileString(
                gitignorePath,
                `${content.trimEnd()}\n\n# xAI source reference for AI agents\n${REFERENCE_DIR}/\n`,
              )
              gitignoreUpdated = true
            }
          } else {
            yield* fs.writeFileString(gitignorePath, `# xAI source reference for AI agents\n${REFERENCE_DIR}/\n`)
            gitignoreUpdated = true
          }

          return { xaiDir, created, gitignoreUpdated }
        }).pipe(
          Effect.mapError(
            (error) =>
              new SetupError({
                message: `Setup failed: ${error}`,
                cause: error,
              }),
          ),
        ),
      )

      return XAISolutionsService.of({ setup })
    }),
  )
}
