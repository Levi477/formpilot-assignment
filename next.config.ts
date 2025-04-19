import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/create',
        destination: '/api/crud/create',
      },
      {
        source: '/api/get',
        destination: '/api/crud/get',
      },
      {
        source: '/api/update',
        destination: '/api/crud/update',
      },
      {
        source: '/api/delete',
        destination: '/api/crud/delete',
      },
    ];
  },
};

export default nextConfig;
