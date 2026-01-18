// @ts-nocheck
import matter from "gray-matter";

// Auto-generated manifest - DO NOT EDIT MANUALLY
// Run: bun run generate:manifest

import DOC__00 from "../../../apps/web/content/docs/authentication.mdx" with { type: "text" };
import DOC__01 from "../../../apps/web/content/docs/best-practices.mdx" with { type: "text" };
import DOC__02 from "../../../apps/web/content/docs/image-generation.mdx" with { type: "text" };
import DOC__03 from "../../../apps/web/content/docs/index.mdx" with { type: "text" };
import DOC__04 from "../../../apps/web/content/docs/text-generation.mdx" with { type: "text" };
import DOC__05 from "../../../apps/web/content/docs/voice-agent.mdx" with { type: "text" };
import DOC__06 from "../../../apps/web/content/docs/x-api-basics.mdx" with { type: "text" };
import DOC__07 from "../../../apps/web/content/docs/x-api-oauth.mdx" with { type: "text" };
import DOC__08 from "../../../apps/web/content/docs/x-search-tool.mdx" with { type: "text" };

type DocMeta = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly body: string;
};

type RawDoc = {
  readonly filename: string;
  readonly source: string;
};

const RAW_DOCS: ReadonlyArray<RawDoc> = [
  { filename: "authentication.mdx", source: DOC__00 },
  { filename: "best-practices.mdx", source: DOC__01 },
  { filename: "image-generation.mdx", source: DOC__02 },
  { filename: "index.mdx", source: DOC__03 },
  { filename: "text-generation.mdx", source: DOC__04 },
  { filename: "voice-agent.mdx", source: DOC__05 },
  { filename: "x-api-basics.mdx", source: DOC__06 },
  { filename: "x-api-oauth.mdx", source: DOC__07 },
  { filename: "x-search-tool.mdx", source: DOC__08 },
];

const filenameToSlug = (filename: string): string => {
  // Strip .mdx extension and numeric prefix (e.g., "01-project-setup.mdx" -> "project-setup")
  return filename.replace(/\.mdx$/, "").replace(/^\d+-/, "");
};

const stripFirstH1 = (content: string): string => {
  // Strip first H1 to match website behavior
  return content.replace(/^#\s+.*\n?/, "").trimStart();
};

const rewriteInternalLinks = (content: string): string => {
  // Rewrite internal links: /01-project-setup -> project-setup
  return content.replace(
    /\[([^\]]+)\]\(\/(\d+-)?([^)]+)\)/g,
    (_match, text, _prefix, slug) => {
      return `[${text}](${slug})`;
    },
  );
};

const stripMdxComponents = (content: string): string => {
  // Remove MDX components like <Cards>, <Card>, <Callout> etc.
  return content
    .replace(/<Cards[^>]*>[\s\S]*?<\/Cards>/g, "")
    .replace(/<Card[^>]*\/>/g, "")
    .replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/g, "**Note:** $1")
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "")
    .replace(/<[A-Z][^>]*\/>/g, "");
};

const parseDocs = (): ReadonlyArray<DocMeta> => {
  const docs = RAW_DOCS.map(({ filename, source }) => {
    const { data, content } = matter(source);
    const slug = filenameToSlug(filename);

    // Skip drafts
    if (data.draft === true) {
      return null;
    }

    // Skip index page (it's just navigation)
    if (slug === "index") {
      return null;
    }

    const title = data.title as string;
    const description = (data.description as string) || "";
    const order = (data.order as number) ?? 999;

    if (!title) {
      throw new Error(`Doc ${filename} missing title`);
    }

    return {
      slug,
      title,
      description,
      order,
      body: stripMdxComponents(rewriteInternalLinks(stripFirstH1(content))).trimEnd(),
    } as const;
  }).filter((doc): doc is DocMeta => doc !== null);

  // Sort by order field
  return docs.sort((a, b) => a.order - b.order);
};

export const DOCS = parseDocs();

export const DOC_LOOKUP: Record<string, DocMeta> = DOCS.reduce(
  (acc, doc) => {
    acc[doc.slug] = doc;
    return acc;
  },
  {} as Record<string, DocMeta>,
);
