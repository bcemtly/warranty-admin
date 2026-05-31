/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        delphi: {
          50: '#E8F4FC',
          100: '#C5E1F5',
          200: '#8DC4EA',
          300: '#55A7DF',
          400: '#1D8AD4',
          500: '#0072BC',
          600: '#005A96',
          700: '#004370',
          800: '#002C4A',
          900: '#001524',
        },
      },
    },
  },
  plugins: [],
}
