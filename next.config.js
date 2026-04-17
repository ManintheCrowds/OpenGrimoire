/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingRoot: undefined,
    serverComponentsExternalPackages: ['better-sqlite3', 'bcryptjs'],
  },
  async rewrites() {
    return [{ source: '/api/openapi.json', destination: '/api/openapi' }];
  },
  async redirects() {
    return [
      { source: '/survey', destination: '/operator-intake', permanent: true },
      { source: '/test-supabase', destination: '/test-sqlite', permanent: false },
      { source: '/test-supabase/:path*', destination: '/test-sqlite/:path*', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 