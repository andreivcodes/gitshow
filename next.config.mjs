import pkg from "workflow/next";
const { withWorkflow } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Next.js 16 Cache Components
  cacheComponents: true,
  // Keep the pre-16.3 Cache Components prefetch behavior (unset also means false, but warns)
  partialPrefetching: false,

  // Experimental features
  experimental: {
    // Enable Turbopack filesystem caching for faster dev builds
    turbopackFileSystemCacheForDev: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
      },
    ],
    qualities: [100, 75],
  },

  webpack: (config, options) => {
    if (!options.dev) {
      config.devtool = "source-map";
    }
    return config;
  },
};

export default withWorkflow(nextConfig);
