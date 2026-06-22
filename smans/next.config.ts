import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // SWC minification is enabled by default in Next.js 14+ → no need to set it
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // ✅ Add this to allow dev origins
  allowedDevOrigins: ["192.168.2.2"],

  // ✅ Ensure API routes work
  async rewrites() {
    return [];
  },

  // ✅ Add headers to prevent CORS issues (optional)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;