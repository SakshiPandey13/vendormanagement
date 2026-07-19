/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Keep legacy aliases so old class references still resolve
        primary: {
          50:  '#DEF3F4',
          100: '#c5ecef',
          200: '#9ddde2',
          300: '#64ccd3',
          400: '#2cb8c4',
          500: '#049DB0',
          600: '#049DB0',
          700: '#037685',
          800: '#025c69',
          900: '#024450',
        },
        secondary: {
          DEFAULT: '#17140F',
          50:  '#FBF7EE',
          100: '#F4EDDD',
          200: '#EFE6D6',
          300: '#DED0B3',
          400: '#8A8471',
          500: '#5B5646',
          600: '#3D392E',
          700: '#2D2A22',
          800: '#24211A',
          900: '#17140F',
        },
        surface: '#EFE6D6',
      },
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        space: ["'Space Grotesk'", 'sans-serif'],
        mono:  ["'IBM Plex Mono'", 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '0.875rem',
        '3xl': '1rem',
      },
      boxShadow: {
        'soft':     '0 2px 15px -3px rgba(23,20,15,0.06), 0 10px 20px -2px rgba(23,20,15,0.04)',
        'card':     '0 1px 2px rgba(23,20,15,0.04), 0 8px 24px -12px rgba(23,20,15,0.12)',
        'elevated': '0 4px 20px -8px rgba(4,157,176,0.2), 0 8px 24px -12px rgba(23,20,15,0.12)',
        'glow':     '0 0 20px rgba(4,157,176,0.25)',
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-in-out',
        'slide-up':  'slideUp 0.25s ease-out',
        'slide-down':'slideDown 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-ring':'vl-pulse 1.8s ease-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },                        '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
