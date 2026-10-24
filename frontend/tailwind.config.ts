import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'off-white':    '#F8F7F4',
        'sage-green':   '#7C9A7E',
        'forest-green': '#2D5016',
        'muted-coral':  '#D4826A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
