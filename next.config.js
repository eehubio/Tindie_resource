/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep the Node 'postgres' driver out of the webpack bundle so it doesn't
    // try to resolve its cloudflare:/node: variants. Loaded at runtime instead.
    serverComponentsExternalPackages: ["postgres", "bcryptjs"],
  },
  async headers() {
    return [
      {
        // Allow the /embed route to be iframed by tindie.com.
        source: "/embed",
        headers: [
          // Modern browsers use CSP frame-ancestors. Adjust the domains as needed.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://*.tindie.com https://tindie.com" },
        ],
      },
      {
        // Home page is dynamic — never let the CDN cache it, so newly published
        // discoveries and edits show immediately (the /embed copy stays cached).
        source: "/",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        // Same for the archive and directory (always reflect latest data).
        source: "/archive",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        // PWA: the service worker must never be cached long-term, or users
        // won't pick up new versions. Browsers revalidate on every load.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // PWA: short cache for the manifest.
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
    ];
  },
};
export default nextConfig;
