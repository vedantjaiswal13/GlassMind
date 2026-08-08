import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: "standalone",

  // React strict mode for catching issues early
  reactStrictMode: true,

  // Enable typed routes
  typedRoutes: true,

  // Image optimization config
  images: {
    remotePatterns: [],
  },

  // Proxy /api/ requests to Python backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
