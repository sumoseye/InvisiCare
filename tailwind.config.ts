import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0A0F1E',
        darker: '#111827',
        surface: '#111827',
        border: '#1E2D45',
        text: '#F0F4FF',
        muted: '#6B7FA3',
        'accent-blue': '#00D4FF',
        'accent-purple': '#00D4FF',
        'accent-green': '#00FF9D',
        'accent-red': '#FF4444',
        'accent-orange': '#FFB020',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      backdropBlur: {
        md: '12px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
