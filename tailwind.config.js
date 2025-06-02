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
				'oatnet-background': '#235a38',
				'oatnet-foreground': '#317d52',
				'oatnet-text-light': '#FFFFFF',
				'oatnet-placeholder-light': '#757575',
				'oatnet-text-dark': '#000000',
				'oatnet-placeholder-dark': '#666666',
				'oatnet-invalid': '#ff6161',
			},
			fontFamily: {
				'youngserif': ['Young Serif', 'sans-serif'],
				'intervariabletext': ['Inter Variable Text', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
