/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
      },
      fontFamily: {
        'rubik': ['Rubik Mono One', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
