import { createMiddleware } from "@tanstack/react-start";
import {
  getResponseHeaders,
  setResponseHeaders,
} from "@tanstack/react-start/server";

/**
 * Get the app URL from environment variables
 * Server-side: reads from process.env
 * Falls back to localhost for development
 */
function _getAppUrl(): string {
  const appUrl = process.env.VITE_APP_URL;
  if (appUrl) {
    return appUrl;
  }
  // Fallback for development
  return "http://localhost:3001";
}

/**
 * Check if running in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Security middleware for TanStack Start
 * Sets comprehensive security headers including CSP with nonce-based script protection
 *
 * Headers based on:
 * - https://developers.cloudflare.com/workers/examples/security-headers/
 * - OWASP security headers best practices
 */
export const securityMiddleware = createMiddleware().server(({ next }) => {
  // Generate a unique nonce for this request (used for CSP script-src)
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isProd = isProduction();

  // Content Security Policy directives
  const cspDirectives = [
    // Default fallback - restrict to same origin
    "default-src 'self'",

    // Scripts: Allow self, nonce-based inline, and specific trusted CDNs
    // 'strict-dynamic' allows scripts loaded by nonce-trusted scripts
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cdn.jsdelivr.net https://analytics.bytefolio.app https://*.cloudflare.com`,

    // Web Workers: Allow self and blob URLs (needed for monaco editor, etc.)
    "worker-src 'self' blob: https://cdn.jsdelivr.net",

    // Styles: Allow self, inline (needed for dynamic styling), and font services
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",

    // Images: Allow self, data URIs, HTTPS, blobs
    "img-src 'self' data: https: blob:",

    // Media (video/audio): Allow self and GIPHY CDN for MP4 playback
    "media-src 'self' https://*.giphy.com",

    // Fonts: Allow self, data URIs, and font services
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",

    // Connections: Allow self and all required API/websocket endpoints
    [
      "connect-src 'self'",
      "http://localhost:*", // Local dev APIs (Electric SQL proxy, etc.)
      "ws://localhost:*", // Local development websockets
      "https://*.sanity.io",
      "wss://*.sanity.io",
      "https://analytics.bytefolio.app",
      "https://electric.bytefolio.app",
      "wss://electric.bytefolio.app",
      "https://uploads.bytefolio.app",
      "https://region1.google-analytics.com",
      "https://cdn.jsdelivr.net",
      "https://*.posthog.com", // PostHog analytics
      "https://*.i.posthog.com", // PostHog EU infrastructure
      "https://api.axiom.co", // Axiom logging
      "https://i.imgflip.com", // Meme images (for clipboard copy)
    ].join(" "),

    // Frame ancestors: Prevent clickjacking - no embedding allowed
    "frame-ancestors 'none'",

    // Base URI: Restrict base element to same origin
    "base-uri 'self'",

    // Form actions: Restrict form submissions to same origin
    "form-action 'self'",

    // Upgrade HTTP to HTTPS in production
    isProd && "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  // Clean up any extra whitespace in CSP
  const contentSecurityPolicy = cspDirectives.replace(/\s{2,}/g, " ").trim();

  const headers = getResponseHeaders();

  // === Content Security Policy ===
  headers.set("Content-Security-Policy", contentSecurityPolicy);

  // === Transport Security ===
  // HSTS: Force HTTPS for 1 year, include subdomains, enable preload
  // Note: preload requires submission to hstspreload.org
  if (isProd) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  // === Content Type Protection ===
  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // === Frame Protection ===
  // X-Frame-Options: Legacy fallback for older browsers (CSP frame-ancestors is primary)
  headers.set("X-Frame-Options", "DENY");

  // === XSS Protection ===
  // Disabled (0) per modern security guidance - browser XSS auditors are deprecated
  // and could introduce vulnerabilities. CSP is the modern replacement.
  headers.set("X-XSS-Protection", "0");

  // === Referrer Policy ===
  // Send full URL for same-origin, only origin for cross-origin
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // === Cross-Origin Policies ===
  // Protect against Spectre-like side-channel attacks
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-site");

  // === Permissions Policy ===
  // Disable sensitive browser features not used by the app
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  );

  setResponseHeaders(headers);

  return next({
    context: {
      nonce,
    },
  });
});
