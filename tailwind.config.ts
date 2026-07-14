import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        creme: { DEFAULT: '#FFFBF6', 2: '#FBF2EA' },
        rosa: {
          suave: '#F6DCE3',
          'suave-2': '#F0C9D4',
          profundo: '#C24A6B',
          'profundo-escuro': '#A63A58',
        },
        preto: { DEFAULT: '#211A17', suave: '#3A302B' },
        dourado: { DEFAULT: '#B8933C', claro: '#EADFB8' },
        surface: { dark: '#15100E' },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #C24A6B 0%, #A63A58 100%)',
        'gold-gradient': 'linear-gradient(135deg, #EADFB8 0%, #B8933C 100%)',
        'radial-glow': 'radial-gradient(circle at 85% 0%, #F6DCE3 0%, transparent 55%), radial-gradient(circle at 0% 100%, #EADFB8 0%, transparent 45%)',
      },
      boxShadow: {
        soft: '0 12px 30px -12px rgba(33,26,23,0.18)',
        strong: '0 20px 45px -15px rgba(33,26,23,0.28)',
        glass: '0 8px 32px 0 rgba(33,26,23,0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(24px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-16px, 16px) scale(0.94)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 22s linear infinite',
        blob: 'blob 12s infinite ease-in-out',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
