/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
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
