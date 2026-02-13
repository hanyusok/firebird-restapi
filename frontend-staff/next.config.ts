import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  async rewrites() {
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    // 시놀로지에서 firebird server 접근을 위한 backendUrl
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
