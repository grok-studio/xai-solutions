import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Build With X",
    },
    links: [
      { text: "CLI", url: "https://www.npmjs.com/package/build-with-x" },
      { text: "GitHub", url: "https://github.com/grok-studio/build-with-x" },
    ],
  };
}
