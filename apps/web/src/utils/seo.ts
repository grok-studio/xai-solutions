/**
 * SEO utility for generating meta tags
 * Compatible with TanStack Start's head() configuration
 *
 * @see https://ahrefs.com/blog/open-graph-meta-tags/
 * @see https://ahrefs.com/seo/glossary/meta-description
 */

const SITE_URL = "https://buildwithx.dev";
const TWITTER_SITE = "@adamthewilliam";

export interface SeoOptions {
  /** Page title (50-60 chars recommended) */
  title: string;
  /** Page description (150-160 chars recommended) */
  description?: string;
  /** Keywords (optional, not a ranking factor but can help) */
  keywords?: string;
  /** OG/Twitter image URL (1200x630px recommended) */
  image?: string;
  /** Alt text for the image (accessibility) */
  imageAlt?: string;
  /** Canonical URL path (e.g., '/gitmojis' or full URL) */
  url?: string;
  /** Override default Twitter handle */
  twitterSite?: string;
}

export const seo = ({
  title,
  description,
  keywords,
  image,
  imageAlt,
  url,
  twitterSite = TWITTER_SITE,
}: SeoOptions) => {
  const canonicalUrl = url?.startsWith("http")
    ? url
    : url
      ? `${SITE_URL}${url}`
      : undefined;

  const tags: Record<string, string>[] = [
    { title },
    { name: "description", content: description ?? "" },
    // Open Graph tags
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description ?? "" },
    { property: "og:site_name", content: "Build with X" },
    // Twitter Card tags
    {
      name: "twitter:card",
      content: image ? "summary_large_image" : "summary",
    },
    { name: "twitter:site", content: twitterSite },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description ?? "" },
  ];

  if (keywords) {
    tags.push({ name: "keywords", content: keywords });
  }

  if (canonicalUrl) {
    tags.push({ property: "og:url", content: canonicalUrl });
  }

  if (image) {
    tags.push(
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: image },
    );
    if (imageAlt) {
      tags.push(
        { property: "og:image:alt", content: imageAlt },
        { name: "twitter:image:alt", content: imageAlt },
      );
    }
  }

  return tags.filter((tag) => {
    if ("content" in tag && !tag.content) {
      return false;
    }
    return true;
  });
};

/**
 * Generate a canonical link tag for the head
 * Canonical URLs should match og:url to prevent duplicate content issues
 *
 * @param path - URL path (e.g., '/gitmojis') or full URL
 * @returns Link object for TanStack Router head() links array
 */
export const canonicalLink = (path: string) => ({
  rel: "canonical",
  href: path.startsWith("http") ? path : `${SITE_URL}${path}`,
});
