/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@gitshow/svg-gen"],
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
};

module.exports = nextConfig;
