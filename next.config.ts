import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/_next/static/media/logo.0ctv.ko5~mr~7.svg",
        destination: "/textures/logo.0ctv.ko5~mr~7.svg",
      },
      {
        source: "/_next/static/media/:path*",
        destination: "https://www.shader.se/_next/static/media/:path*",
      },
    ];
  },
};

export default config;
