import { createFileRoute, notFound } from "@tanstack/react-router"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { createServerFn } from "@tanstack/react-start"
import { source } from "@/lib/source"
import browserCollections from "fumadocs-mdx:collections/browser"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page"
import defaultMdxComponents from "fumadocs-ui/mdx"
import { baseOptions } from "@/lib/layout.shared"
import { useFumadocsLoader } from "fumadocs-core/source/client"
import { LLMCopyButton } from "@/components/llm-copy-button"
import { ViewOptions } from "@/components/view-options"
import { PageActionsProvider, usePageActions } from "@/lib/page-actions-context"

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? []
    const data = await serverLoader({ data: slugs })
    await clientLoader.preload(data.path)
    return data
  },
})

const serverLoader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs)
    if (!page) throw notFound()

    return {
      path: page.path,
      url: page.url,
      pageTree: await source.serializePageTree(source.getPageTree()),
    }
  })

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }) {
    const { markdownUrl, githubUrl } = usePageActions()

    return (
      <DocsPage toc={toc}>
        {/* Header row with title and action buttons */}
        <div className="flex items-start justify-between gap-4 not-prose">
          <DocsTitle>{frontmatter.title}</DocsTitle>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <LLMCopyButton markdownUrl={markdownUrl} />
            <ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
          </div>
        </div>
        <DocsDescription>{frontmatter.description}</DocsDescription>

        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    )
  },
})

function Page() {
  const data = Route.useLoaderData()
  const { pageTree } = useFumadocsLoader(data)
  const Content = clientLoader.getComponent(data.path)

  // Construct URLs for page actions
  const markdownUrl = `${data.url}.mdx`
  const githubUrl = `https://github.com/adamferguson/xai-solutions/blob/main/apps/web/content${data.url}.mdx`

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <PageActionsProvider value={{ markdownUrl, githubUrl }}>
        <Content />
      </PageActionsProvider>
    </DocsLayout>
  )
}
