import { createFileRoute, notFound } from "@tanstack/react-router"
import { source } from "@/lib/source"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const Route = createFileRoute("/llms.mdx/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = params._splat?.split("/") ?? []
        const page = source.getPage(slugs)
        if (!page) throw notFound()

        // Construct the file path from slugs
        // The content files are at content/docs/{slug}.mdx or content/docs/{slug}/index.mdx
        const basePath = process.cwd()
        const slugPath = slugs.join("/")

        // Try the direct path first, then index path
        let content: string
        try {
          const filePath = join(basePath, "content/docs", `${slugPath}.mdx`)
          content = await readFile(filePath, "utf-8")
        } catch {
          try {
            const indexPath = join(basePath, "content/docs", slugPath, "index.mdx")
            content = await readFile(indexPath, "utf-8")
          } catch {
            throw notFound()
          }
        }

        return new Response(content, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
          },
        })
      },
    },
  },
})
