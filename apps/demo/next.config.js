// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { esmExternals: true, externalDir: true, appDir: true },
  typescript: {
    // The demo has "exactOptionalPropertyTypes" and "noUncheckedIndexedAccess" enabled.
    // https://github.com/microsoft/TypeScript/issues/41883
    ignoreBuildErrors: true,
  },
  // To resolve paths in packages using `"moduleResolution": "NodeNext"`.
  // https://github.com/vercel/next.js/discussions/41189
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        extensionAlias: {
          '.js': ['.js', '.ts'],
        },
      },
    };
  },
};

module.exports = nextConfig;
