#!/usr/bin/env bun

import { readdirSync } from "node:fs"
import { join } from "node:path"

const DOCS_DIR = join(import.meta.dir, "../../../apps/web/content/docs")
const OUTPUT_FILE = join(import.meta.dir, "../src/docs-manifest.ts")

// Find all .mdx files in docs directory
const docFiles = readdirSync(DOCS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .sort()

// Generate import statements
const imports = docFiles.map((filename, i) => {
  const varName = `DOC__${i.toString().padStart(2, "0")}`
  return `import ${varName} from "../../../apps/web/content/docs/${filename}" with { type: "text" };`
})

// Generate RAW_DOCS array
const rawDocsEntries = docFiles.map((filename, i) => {
  const varName = `DOC__${i.toString().padStart(2, "0")}`
  return `  { filename: "${filename}", source: ${varName} },`
})

const manifest = `// @ts-nocheck
import matter from "gray-matter";

// Auto-generated manifest - DO NOT EDIT MANUALLY
// Run: bun run generate:manifest

${imports.join("\n")}

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
${rawDocsEntries.join("\n")}
];

const filenameToSlug = (filename: string): string => {
  // Strip .mdx extension and numeric prefix (e.g., "01-project-setup.mdx" -> "project-setup")
  return filename.replace(/\\.mdx$/, "").replace(/^\\d+-/, "");
};

const stripFirstH1 = (content: string): string => {
  // Strip first H1 to match website behavior
  return content.replace(/^#\\s+.*\\n?/, "").trimStart();
};

const rewriteInternalLinks = (content: string): string => {
  // Rewrite internal links: /01-project-setup -> project-setup
  return content.replace(
    /\\[([^\\]]+)\\]\\(\\/(\\d+-)?([^)]+)\\)/g,
    (_match, text, _prefix, slug) => {
      return \`[\${text}](\${slug})\`;
    },
  );
};

const stripMdxComponents = (content: string): string => {
  // Remove MDX components like <Cards>, <Card>, <Callout> etc.
  return content
    .replace(/<Cards[^>]*>[\\s\\S]*?<\\/Cards>/g, "")
    .replace(/<Card[^>]*\\/>/g, "")
    .replace(/<Callout[^>]*>([\\s\\S]*?)<\\/Callout>/g, "**Note:** $1")
    .replace(/<[A-Z][^>]*>[\\s\\S]*?<\\/[A-Z][^>]*>/g, "")
    .replace(/<[A-Z][^>]*\\/>/g, "");
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
      throw new Error(\`Doc \${filename} missing title\`);
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
`

await Bun.write(OUTPUT_FILE, manifest)
console.log(`✓ Generated manifest with ${docFiles.length} docs`)
console.log(`  → ${OUTPUT_FILE}`)
