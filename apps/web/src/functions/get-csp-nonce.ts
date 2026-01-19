import {
  createIsomorphicFn,
  getGlobalStartContext,
} from "@tanstack/react-start";

export const getCspNonce = createIsomorphicFn()
  .server(() => {
    /**
     * @see https://github.com/TanStack/router/discussions/3028#discussioncomment-14844427
     * For reference
     */
    const ctx = getGlobalStartContext();
    if (!ctx) {
      throw new Error("Server context is not available");
    }
    return ctx.nonce;
  })
  .client(() => {
    const el = document.querySelector(
      "meta[property=csp-nonce]",
    ) as HTMLMetaElement;

    return el.content;
  });
