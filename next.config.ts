import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: '/Users/sbae703/dev/my_site',
  // Vercel serverless function configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
