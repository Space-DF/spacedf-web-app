import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  rules: [
    {
      test: /\bmapbox-gl-csp-worker.js\b/i,
      use: { loader: 'worker-loader' },
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-alpha-sig.figma.com',
      },
      {
        protocol: 'https',
        hostname: 'my-bucketprofile.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'my-bucketprofile.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname:
          'spacedf-s3-1f841081-c8e98ef7bb21.s3.ap-southeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'spacedf-s3-1f841081-c8e98ef7bb21.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'd3f53s68dquwpy.cloudfront.net',
      },
    ],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
