/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep the Node 'postgres' driver out of the webpack bundle so it doesn't
    // try to resolve its cloudflare:/node: variants. Loaded at runtime instead.
    serverComponentsExternalPackages: ["postgres", "bcryptjs"],
  },
};
export default nextConfig;
