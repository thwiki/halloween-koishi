const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				blood: {
					500: '#D11818',
				},
				koipurple: {
					700: '#78339d',
					900: '#43194a',
				},
				koigreen: {
					100: '#c7e7c2',
					500: '#4d9974',
					900: '#034114',
				},
			},
			backgroundSize: {
				'1/2': '50%',
				full: '100%',
			},
			keyframes: {
				cut: {
					'0%': { top: '50%', width: '0%', height: '2px' },
					'10%, 50%': { top: '50%', width: '100%', height: '2px' },
					'100%': { top: '0', width: '100%', height: '100%' },
				},
			},
			animation: {
				cut: 'cut 1000ms linear 1 both',
			},
		},
	},

	plugins: [],
};

module.exports = config;
