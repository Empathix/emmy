/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'select-light-30': '#E6D5F5',
        'select-dark-30': '#9D6FCC',
        'select-dark': '#7B4FA1',
      },
    },
  },
  plugins: [],
}
