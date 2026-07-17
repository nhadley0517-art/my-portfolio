import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      { source: "/real", destination: "/real/index.html" },
      { source: "/real/", destination: "/real/index.html" },
    ];
  },
};

export default nextConfig;
