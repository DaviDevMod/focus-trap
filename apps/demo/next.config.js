/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { esmExternals: true, externalDir: true },
  typescript: {
    // The demo has "exactOptionalPropertyTypes" and "noUncheckedIndexedAccess" enabled.
    // https://github.com/microsoft/TypeScript/issues/41883
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
