import { NotFound } from "@/components/not-found"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { getCspNonce } from "./functions/get-csp-nonce"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    ssr: { nonce: getCspNonce() },
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  })
}
