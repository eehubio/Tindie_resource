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
    ];
  },
};
export default nextConfig;
