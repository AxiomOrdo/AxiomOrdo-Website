/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/ao-pdf',
  output: 'export',
  trailingSlash: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  generateBuildId: async () => 'aopdf-governed-2026-07-31',
};

module.exports = nextConfig;
