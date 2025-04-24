import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['syncspace-images.s3.eu-central-1.amazonaws.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
