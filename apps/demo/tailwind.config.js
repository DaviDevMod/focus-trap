const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    // screens: { xs: '525px', ...defaultTheme.screens },
    extend: {},
  },
  plugins: [require('tailwindcss-debug-screens'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
};
