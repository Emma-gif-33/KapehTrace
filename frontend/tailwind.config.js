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
          50: '#fbf7f4',
          100: '#f6ece4',
          200: '#ebd8c8',
          300: '#dcbe9f',
          400: '#caa074',
          500: '#b88651',
          600: '#a36f42',
          700: '#855637',
          800: '#6d4732',
          900: '#5a3b2b',
          950: '#321f17',
        },
        forest: {
          50: '#f2f9f5',
          100: '#e1f2e8',
          200: '#c5e4d2',
          300: '#9bcfb3',
          400: '#6bb38e',
          500: '#469670',
          600: '#347a59',
          700: '#2a6248',
          800: '#244e3b',
          900: '#1f4132',
          950: '#0e241c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

