// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,        // Enables React Strict Mode for better error handling
    swcMinify: true,              // Uses SWC for faster, more efficient minification
    experimental: {
      // Optional: Enable if you want server actions instrumentation (useful for debugging)
      // instrumentationHook: true,
    },
    images: {
      // Optional: Add domains if you plan to use external images
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**", // Allow all HTTPS images (adjust for security in production)
        },
      ],
    },
    // Add any other custom config you need
  };
  
  export default nextConfig;