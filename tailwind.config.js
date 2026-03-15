/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{ts,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e17',
        surface: '#141c2e',
        surface2: '#111827',
        gold: {
          DEFAULT: '#d4af37',
          dark: '#c5a028',
        },
        'text-base': '#e8e6e1',
        'text-muted': '#8a9bb5',
        'text-dim': '#6b7a91',
      },
      fontFamily: {
        sans: ['DM Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderColor: {
        gold: 'rgba(212, 175, 55, 0.15)',
      },
    },
  },
  plugins: [],
}
