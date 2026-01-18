import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "xAI Solutions",
    },
    links: [
      { text: "CLI", url: "https://www.npmjs.com/package/xai-solutions" },
      { text: "GitHub", url: "https://github.com/adamferguson/xai-solutions" },
    ],
  }
}
