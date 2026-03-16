import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

// When using `next dev -H 127.0.0.1`, __NEXT_PRIVATE_ORIGIN is http://127.0.0.1:3000,
// but media URLs may still contain "localhost" (DB, env, fallback). Allow both in dev.
const baseUrl = new URL(NEXT_PUBLIC_SERVER_URL)
const imageRemotePatterns =
  process.env.NODE_ENV === 'development'
    ? [
        { hostname: 'localhost', protocol: 'http' },
        { hostname: '127.0.0.1', protocol: 'http' },
      ]
    : [
        {
          hostname: baseUrl.hostname,
          protocol: baseUrl.protocol.replace(':', ''),
        },
      ]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: imageRemotePatterns,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
