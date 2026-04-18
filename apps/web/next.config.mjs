/** @type {import('next').NextConfig} */

const useExternalApi = !!process.env.NEXT_PUBLIC_API_URL;

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@xake/ui",
    "@xake/charts",
    "@xake/data-core",
    "@xake/trading-core",
    "@xake/ai-core",
    "@xake/platform",
    "@xake/api",
    "@xake/db"
  ],
  experimental: {
    typedRoutes: false
  },
  async rewrites() {
    // When NEXT_PUBLIC_API_URL is set, front the external Hono server
    // (Replit / self-hosted topology). Otherwise the embedded route
    // handler at app/api/[[...path]]/route.ts serves everything.
    if (!useExternalApi) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
      }
    ];
  }
};

export default nextConfig;
