import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Restrict remote images to known hosts only (no wildcards)
  // Add school-specific CDNs / object-storage hosts via env if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
      },
      // Example: add production image hosts explicitly
      // { protocol: "https", hostname: "cdn.example.com" },
      // { protocol: "https", hostname: "*.s3.amazonaws.com" },
    ],
  },

  // Dev only - remove or gate in production builds
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? ["192.168.2.2", "localhost", "127.0.0.1"]
      : [],

  async rewrites() {
    return [];
  },

  // Do NOT set Access-Control-Allow-Origin: * for authenticated APIs.
  // CORS is handled per-route where public webhooks need it (e.g. M-Pesa).
  async headers() {
    return [
      {
        source: "/api/webhooks/:path*",
        headers: [
          // Webhooks are server-to-server; origin restriction is less relevant
          // but we still avoid a blanket * on the whole /api tree
          { key: "Access-Control-Allow-Methods", value: "POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
