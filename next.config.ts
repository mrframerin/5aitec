import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: "/giving", destination: "/work/giving" },
    ];
  },
};

export default nextConfig;
