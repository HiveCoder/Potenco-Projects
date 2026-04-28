/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0B0F1A',
        surface: '#0F172A'
      },
      boxShadow: {
        neon: '0 0 20px rgba(99,102,241,0.3)',
        panel: '0 24px 80px rgba(2,6,23,0.55)',
        card: '0 18px 48px rgba(15,23,42,0.42)'
      },
      backdropBlur: {
        xs: '2px'
      },
      backgroundImage: {
        'dashboard-grid': 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.14) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};