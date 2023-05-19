const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  // Always resolve paths relative to tailwind.config.js
  // This will likely become the default behavior in the next major version of Tailwind.
  // https://tailwindcss.com/docs/content-configuration#using-relative-paths
  content: { relative: true, files: ['./src/**/*.{js,ts,jsx,tsx,mdx}'] },
  theme: {
    // screens: { xs: '525px', ...defaultTheme.screens },
    extend: {},
  },
  plugins: [require('tailwindcss-debug-screens'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
};
