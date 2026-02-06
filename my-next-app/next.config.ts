import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.almostcrackd.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'presigned-url-uploads.almostcrackd.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
