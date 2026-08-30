/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d5da',
          300: '#f0b4be',
          400: '#e68798',
          500: '#d85871',
          600: '#c33b58',
          700: '#a32b45',
          800: '#88263d',
          900: '#732437',
          950: '#400e1b',
        },
      },
    },
  },
  plugins: [],
}
