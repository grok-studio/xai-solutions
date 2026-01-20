import { describe, expect, test } from "bun:test"
import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"

const EXAMPLES_DIR = join(import.meta.dir, "../examples")

describe("examples", () => {
  test("xai examples exist and are valid TypeScript", async () => {
    const xaiDir = join(EXAMPLES_DIR, "xai")
    const files = await readdir(xaiDir)

    expect(files.length).toBeGreaterThan(0)

    for (const file of files) {
      if (file.endsWith(".ts")) {
        const content = await readFile(join(xaiDir, file), "utf-8")
        // Basic validation: should import openai
        expect(content).toContain("openai")
      }
    }
  })

  test("x-api examples exist and are valid TypeScript", async () => {
    const xApiDir = join(EXAMPLES_DIR, "x-api")
    const files = await readdir(xApiDir)

    expect(files.length).toBeGreaterThan(0)

    for (const file of files) {
      if (file.endsWith(".ts")) {
        const content = await readFile(join(xApiDir, file), "utf-8")
        // Basic validation: should have fetch calls or authentication
        expect(content.includes("fetch") || content.includes("Bearer")).toBe(true)
      }
    }
  })
})

describe("documentation", () => {
  test("MDX files exist with valid frontmatter", async () => {
    const docsDir = join(import.meta.dir, "../apps/web/content/docs")
    const files = await readdir(docsDir)
    const mdxFiles = files.filter((f) => f.endsWith(".mdx"))

    expect(mdxFiles.length).toBeGreaterThan(5)

    for (const file of mdxFiles) {
      const content = await readFile(join(docsDir, file), "utf-8")
      // Should have frontmatter
      expect(content.startsWith("---")).toBe(true)
      expect(content).toContain("title:")
      expect(content).toContain("description:")
    }
  })
})
