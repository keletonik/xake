/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@xake/ui", "@xake/charts", "@xake/data-core", "@xake/trading-core", "@xake/ai-core"],
  experimental: {
    typedRoutes: false
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/:path*`
      }
    ];
  }
};

export default nextConfig;
