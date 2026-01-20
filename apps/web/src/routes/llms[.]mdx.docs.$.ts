import { getLLMText } from "@/lib/get-llm-text"
import { source } from "@/lib/source"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/llms.mdx/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = params._splat?.split("/") ?? []
        const page = source.getPage(slugs)
        if (!page) throw notFound()

        return new Response(await getLLMText(page), {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
          },
        })
      },
    },
  },
})
