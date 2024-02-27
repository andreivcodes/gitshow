/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
      },
    ],
  },
  webpack: (config, options) => {
    if (!options.dev) {
      config.devtool = "source-map";
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "@libsql/linux-x64-gnu", "libsql"],
  },
};

export default nextConfig;
