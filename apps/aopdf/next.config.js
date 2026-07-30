/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/aopdf',
  output: 'export',
  trailingSlash: true,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
