import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // All pages are dynamic (require live Supabase connection)
  experimental: {},
}

export default nextConfig
