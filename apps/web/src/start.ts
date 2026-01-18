import { createStart, createMiddleware } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"

/**
 * Rewrites /docs/{path}.mdx → /llms.mdx/docs/{path}
 * This allows users to access raw MDX content by appending .mdx to any docs URL
 */
function rewriteMdxPath(pathname: string): string | null {
  const match = pathname.match(/^\/docs\/(.+)\.mdx$/)
  if (match) {
    return `/llms.mdx/docs/${match[1]}`
  }
  return null
}

const llmMiddleware = createMiddleware().server(({ next, request }) => {
  const url = new URL(request.url)
  const rewrittenPath = rewriteMdxPath(url.pathname)

  if (rewrittenPath) {
    throw redirect({ href: rewrittenPath })
  }

  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [llmMiddleware],
}))
