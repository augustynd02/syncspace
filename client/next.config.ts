import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['syncspace-images.s3.eu-central-1.amazonaws.com'],
  },
};

export default nextConfig;
