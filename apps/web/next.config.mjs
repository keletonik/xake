/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@xake/ui"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
