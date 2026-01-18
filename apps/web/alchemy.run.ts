import alchemy from "alchemy"
import { TanStackStart } from "alchemy/cloudflare"
import { CloudflareStateStore } from "alchemy/state"
import { config } from "dotenv"

config({ path: "./.env" })

const app = await alchemy("xai-solutions", {
  password: process.env.ALCHEMY_PASSWORD,
  stateStore:
    process.env.CI || process.env.GITHUB_ACTIONS
      ? (scope) => new CloudflareStateStore(scope)
      : undefined,
})

export const web = await TanStackStart("web", {
  name: "xai-solutions-docs",
  adopt: true,
  bindings: {
    NODE_ENV: process.env.NODE_ENV || "development",
  },
  dev: {
    command: "bun run dev",
  },
  domains: ["xai.solutions"],
})

console.log({ url: web.url })

await app.finalize()
