import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { NotFound } from "@/components/not-found";
import { getCspNonce } from "./functions/get-csp-nonce";

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    ssr: { nonce: getCspNonce() },
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });
}
