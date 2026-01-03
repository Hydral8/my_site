import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel serverless function configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
