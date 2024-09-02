/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'oatnet-background': 'rgb(38, 35, 90)',
        'oatnet-light': 'rgb(60, 55, 143)',
        'oatnet-dark': 'rgb(26, 24, 64)',
      },
      fontFamily: {
        'rubik': ['Rubik Mono One Regular', 'sans-serif'],
      }
    },
  },
  plugins: [],
}