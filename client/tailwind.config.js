/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
      },
      colors: {
        maroon: {
          50: '#fbf4f5',
          100: '#f6e8ea',
          200: '#ebd3d7',
          300: '#dbb1b8',
          400: '#c58491',
          500: '#ab5c6d',
          600: '#8f4253',
          700: '#753241',
          800: '#58111a',
          900: '#420b13',
          950: '#2b060b',
        },
        burgundy: {
          DEFAULT: '#800020',
          500: '#800020',
          600: '#6b1124',
          700: '#580d1d',
          800: '#420914',
          900: '#30050e',
        },
        gold: {
          50: '#fbf8eb',
          100: '#f6eecb',
          200: '#edda99',
          300: '#e3c263',
          400: '#dfc264',
          500: '#d4af37',
          600: '#c59b27',
          700: '#9e751d',
          800: '#7e5a1b',
          900: '#684a1a',
          950: '#3d280a',
        },
        ivory: {
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f5eee1',
          300: '#eee3cf',
          400: '#dec7a9',
          500: '#caa781',
        },
        terracotta: {
          DEFAULT: '#c86446',
          400: '#d67a5f',
          500: '#c86446',
          600: '#b25034',
          700: '#943f27',
        },
        forest: {
          DEFAULT: '#1b4332',
          500: '#1b4332',
          600: '#163a2b',
          700: '#112d22',
          800: '#0c2219',
          900: '#071610',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        }
      }
    },
  },
  plugins: [],
}
