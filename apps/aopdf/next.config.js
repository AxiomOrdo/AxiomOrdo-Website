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
  webpack(config) {
    config.module.rules.push({
      test: /pdf(?:\.worker)?\.mjs$/,
      resourceQuery: /aopdf-static-module/,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[name].[contenthash][ext]',
      },
    });
    return config;
  },
  generateBuildId: async () => 'aopdf-governed-2026-07-31',
};

module.exports = nextConfig;
