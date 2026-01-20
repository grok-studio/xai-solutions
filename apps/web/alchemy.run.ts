import alchemy from "alchemy";
import { TanStackStart } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { config } from "dotenv";

config({ path: "./.env" });

const app = await alchemy("buildwithx-web-app", {
  password: process.env.ALCHEMY_PASSWORD,
  stateStore:
    process.env.CI || process.env.GITHUB_ACTIONS
      ? (scope) =>
          new CloudflareStateStore(scope, {
            scriptName: "buildwithx-web-state",
          })
      : undefined,
});

export const web = await TanStackStart("buildwithx-web-app", {
  name: "buildwithx-web-app",
  adopt: true,
  bindings: {
    NODE_ENV: process.env.NODE_ENV || "development",
  },
  dev: {
    command: "bun run dev",
  },
  domains: ["buildwithx.dev"],
});

console.log({ url: web.url });

await app.finalize();
