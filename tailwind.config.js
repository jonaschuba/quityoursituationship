/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#E8341A',
        'accent-dark': '#C02810',
        'accent-light': '#FFF0ED',
        dark: '#0C0C0B',
        muted: '#6B6B66',
        light: '#A0A09A',
        card: '#F4F4F0',
        border: '#E8E8E3',
      },
    },
  },
  plugins: [],
}
