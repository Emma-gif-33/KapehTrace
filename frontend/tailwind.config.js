/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          dark: '#1C130E',
          espresso: '#2B1B13',
          roast: '#3B261C',
          mocha: '#6F4E37',
          terracotta: '#C07850',
          tan: '#D4A373',
          cream: '#FCF9F5',
          sand: '#F7F3ED',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
