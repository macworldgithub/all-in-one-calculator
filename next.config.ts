import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:slug.html',
        destination: '/:slug',
      },
    ];
  },
};

export default nextConfig;
