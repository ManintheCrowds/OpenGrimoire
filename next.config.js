/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  output: 'standalone',
  images: {
    // Keep optimization off. GHSA-2464-fhr4-w9xw is in the image optimizer; do not add sharp.
    unoptimized: true,
  },
  // Next 15 renamed this off `experimental`. Native modules must stay external.
  serverExternalPackages: ['better-sqlite3', 'bcryptjs'],
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