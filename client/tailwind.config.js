/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0A0F',
          900: '#12121A',
          800: '#1C1C28',
          700: '#252535',
          600: '#363650',
          500: '#4A4A6A',
        },
        gold: {
          300: '#F0C96A',
          400: '#E8B83A',
          500: '#D4A017',
          600: '#B8880E',
        },
        paper: {
          50: '#FDFAF4',
          100: '#F8F2E3',
          200: '#F0E6CC',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
