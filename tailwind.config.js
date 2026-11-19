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
        cyber: {
          bg: '#05070D',
          bgSecondary: '#0B1220',
          card: '#101A2E',
          elevated: '#16233D',
          border: '#1E2D4A',
          borderHover: '#2E436D',
          primary: '#2F6BFF',
          primaryHover: '#4A7FFF',
          cyan: '#22E3FF',
          violet: '#8B5CF6',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#FF4D6D',
          text: '#E8EEF9',
          muted: '#8FA0BF',
          faint: '#475569'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      boxShadow: {
        'cyber-sm': '0 2px 8px -2px rgba(11, 18, 32, 0.7), 0 0 0 1px rgba(34, 227, 255, 0.08)',
        'cyber': '0 8px 24px -4px rgba(5, 7, 13, 0.8), 0 0 0 1px rgba(47, 107, 255, 0.15)',
        'cyber-glow': '0 0 25px -5px rgba(34, 227, 255, 0.25), 0 0 10px rgba(47, 107, 255, 0.2)',
        'cyber-violet': '0 0 25px -5px rgba(139, 92, 246, 0.25)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
