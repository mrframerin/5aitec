import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      { source: "/giving", destination: "/work/giving" },
      {
        source: "/app-pages-internals.js",
        destination: "/_next/static/chunks/app-pages-internals.js",
      },
      {
        source: "/static/chunks/app-pages-internals.js",
        destination: "/_next/static/chunks/app-pages-internals.js",
      },
    ];
  },
};

export default nextConfig;
