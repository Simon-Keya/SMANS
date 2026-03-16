/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // SWC minification is enabled by default in Next.js 14+ → no need to set it
  // experimental.allowedDevOrigins → does NOT exist; remove it

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

  // Optional: if you need to allow large images or other tweaks
  // experimental: {
  //   serverActions: true, // usually already enabled
  // },
};

export default nextConfig;