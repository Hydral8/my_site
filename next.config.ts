import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Vercel serverless function configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  outputFileTracingRoot: path.join(__dirname),
}

export default nextConfig
