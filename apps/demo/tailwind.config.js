const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // screens: { xs: '525px', ...defaultTheme.screens },
    extend: {},
  },
  plugins: [require('tailwindcss-debug-screens'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
};
