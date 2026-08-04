import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  devIndicators: false,
  // .mdx is content-only here — posts are imported into the writing section
  // rather than becoming routes, so pageExtensions stays untouched.
  async rewrites() {
    return [
      { source: "/real", destination: "/real/index.html" },
      { source: "/real/", destination: "/real/index.html" },
    ];
  },
};

export default createMDX()(nextConfig);
