import { baseOptions } from "@/lib/layout.shared"
import { Link, createFileRoute } from "@tanstack/react-router"
import { HomeLayout } from "fumadocs-ui/layouts/home"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex flex-col flex-1 justify-center px-4 py-16 text-center">
        <h1 className="font-bold text-4xl mb-4">Build With X</h1>
        <p className="text-lg text-fd-muted-foreground mb-8 max-w-2xl mx-auto">
          Best practices and patterns for xAI's Grok API and X (Twitter) API. Built for humans and AI agents.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/docs/$"
            params={{ _splat: "" }}
            className="px-6 py-3 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm"
          >
            Read Documentation
          </Link>
          <a
            href="https://www.npmjs.com/package/build-with-x"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-fd-border font-medium text-sm hover:bg-fd-accent"
          >
            Install CLI
          </a>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          <div className="p-6 rounded-lg border border-fd-border">
            <h3 className="font-semibold mb-2">Grok API</h3>
            <p className="text-sm text-fd-muted-foreground">
              Chat completions, streaming, image generation, and function calling with Grok models.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-fd-border">
            <h3 className="font-semibold mb-2">X API</h3>
            <p className="text-sm text-fd-muted-foreground">
              Timeline fetching, posting tweets, OAuth 2.0 PKCE, and real-time search.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-fd-border">
            <h3 className="font-semibold mb-2">CLI Tool</h3>
            <p className="text-sm text-fd-muted-foreground">
              Quick access to docs via terminal. Perfect for AI agents and developers.
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  )
}
