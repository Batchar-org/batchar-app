/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      spacing: {
        4.5: '18px',
      },
      minWidth: {
        4.5: '18px',
      },
    },
  },
  plugins: [],
};
