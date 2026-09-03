import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Chat photos travel to the server action as base64, which is ~33% larger
    // than the file. The default 1MB ceiling would reject an ordinary phone
    // photo even after the client downscales it.
    serverActions: { bodySizeLimit: '5mb' },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
