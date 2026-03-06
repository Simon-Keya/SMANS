/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // FIX: Allow local network access (your phone/laptop at 192.168.100.232)
  experimental: {
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://192.168.100.232:3000",   // ← your local network IP
      // Add more IPs if needed, e.g. "http://192.168.1.x:3000"
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS images (secure in production)
      },
    ],
  },
};

export default nextConfig;