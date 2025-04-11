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
				'oatnet-background': 'rgb(35, 90, 56)',
				'oatnet-foreground': 'rgb(49, 125, 82)',
				'oatnet-text': 'rgb(255, 255, 255)',
				'oatnet-button-text': 'rgb(0, 0, 0)',	
			},
			fontFamily: {
				'rubik': ['Rubik Mono One Regular', 'sans-serif'],
			}
		},
	},
	plugins: [],
}
