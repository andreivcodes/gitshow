/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@gitshow/gitshow-lib"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
      },
    ],
  },
  webpack: (config) => {
    config.devtool = "source-map";
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      "libsql",
      "@libsql/client",
      "@libsql/linux-arm64-gnu",
      "@libsql/linux-arm64-musl",
    ],
    esmExternals: false,
  },
};

module.exports = nextConfig;
