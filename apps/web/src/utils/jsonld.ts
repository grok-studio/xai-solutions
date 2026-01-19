/**
 * JSON-LD Structured Data for SEO
 * Helps search engines and AI systems understand the site's content and structure
 *
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

const SITE_URL = "https://buildwithx.dev";
const SITE_NAME = "Build with X";
const SITE_DESCRIPTION =
  "xAI and X API documentation, LLM-optimized markdown guides, and a CLI for developers building with Grok models and the X platform.";
const TWITTER_HANDLE = "adamthewilliam";

interface JsonLdGraph {
  "@context": string;
  "@graph": JsonLdNode[];
}

interface JsonLdNode {
  "@type": string;
  "@id"?: string;
  [key: string]: unknown;
}

/**
 * Generate the main JSON-LD structured data for the site
 * Includes Organization, WebSite, and SearchAction schemas
 */
export function getJsonLd(): JsonLdGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/og/home.png`,
          width: 1200,
          height: 630,
        },
        sameAs: [`https://twitter.com/${TWITTER_HANDLE}`],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/docs?query={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
