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
        dark: '#0f172a',
        darker: '#1e293b',
        'accent-blue': '#60a5fa',
        'accent-purple': '#a78bfa',
        'accent-green': '#34d399',
        'accent-red': '#ef4444',
        'accent-orange': '#fb923c',
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
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
