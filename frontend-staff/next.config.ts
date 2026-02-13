import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  async rewrites() {
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const backendUrl = 'http://192.168.219.42:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
