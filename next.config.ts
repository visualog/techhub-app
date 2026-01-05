import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['lightningcss'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google User Profile
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all external images for feed items
      },
    ],
  },
};

export default nextConfig;
