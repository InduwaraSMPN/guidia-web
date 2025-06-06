/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			montserrat: [
  				'Montserrat',
  				'sans-serif'
  			],
  			opensans: [
  				'Open Sans',
  				'sans-serif'
  			],
  			grillmaster: [
  				'Grillmaster Extended',
  				'sans-serif'
  			]
  		},
  		colors: {
  			/* System Colors (Shadcn compatibility) */
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				light: 'hsl(var(--secondary-light))',
  				lighter: 'hsl(var(--secondary-lighter))',
  				dark: 'hsl(var(--secondary-dark))',
  				darker: 'hsl(var(--secondary-darker))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},

  			/* Brand Color Palette */
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				light: 'hsl(var(--brand-light))',
  				lighter: 'hsl(var(--brand-lighter))',
  				dark: 'hsl(var(--brand-dark))',
  				darker: 'hsl(var(--brand-darker))'
  			},

  			/* Secondary Color Palette (Neutral Grays) */
  			gray: {
  				DEFAULT: 'hsl(var(--secondary))',
  				light: 'hsl(var(--secondary-light))',
  				lighter: 'hsl(var(--secondary-lighter))',
  				dark: 'hsl(var(--secondary-dark))',
  				darker: 'hsl(var(--secondary-darker))'
  			},

  			/* Neutral Colors */
  			neutral: {
  				50: 'hsl(var(--neutral-50))',
  				100: 'hsl(var(--neutral-100))',
  				200: 'hsl(var(--neutral-200))',
  				300: 'hsl(var(--neutral-300))',
  				400: 'hsl(var(--neutral-400))',
  				500: 'hsl(var(--neutral-500))',
  				600: 'hsl(var(--neutral-600))',
  				700: 'hsl(var(--neutral-700))',
  				800: 'hsl(var(--neutral-800))',
  				900: 'hsl(var(--neutral-900))'
  			},

  			/* Accent Colors */
  			gold: 'hsl(var(--accent-gold))',
  			indigo: 'hsl(var(--accent-indigo))',
  			purple: 'hsl(var(--accent-purple))',

  			/* Functional Colors */
  			success: 'hsl(var(--success))',
  			warning: 'hsl(var(--warning))',
  			error: 'hsl(var(--error))',
  			info: 'hsl(var(--info))',

  			/* Chart Colors */
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
