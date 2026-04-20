/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        pink: {
          DEFAULT: '#D4537E',
          light: '#FBEAF0',
          dark: '#993556',
          pale: '#F4C0D1',
        },
      },
    },
  },
  plugins: [],
}
