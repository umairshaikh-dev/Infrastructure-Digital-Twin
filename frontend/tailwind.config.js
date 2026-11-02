/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twin: {
          // Light theme palette
          bg: '#f5f7fb',
          surface: '#ffffff',
          surfaceLight: '#f0f4f8',
          card: '#ffffff',
          border: '#e2e8f0',
          borderHighlight: '#2563eb',
          cyan: '#0891b2',
          blue: '#2563eb',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#dc2626',
          purple: '#7c3aed',
          muted: '#64748b',
          // Navy text shades
          navy: '#1e293b',
          navyLight: '#334155',
          // Accent blue
          accent: '#2563eb',
          accentLight: '#dbeafe',
          accentMuted: '#93c5fd',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'panel': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
