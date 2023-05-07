const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // screens: { xs: '525px', ...defaultTheme.screens },
    extend: {},
  },
  plugins: [require('tailwindcss-debug-screens'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
};
