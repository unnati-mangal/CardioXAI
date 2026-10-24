import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand greens – match the design's sage/forest palette
        'brand-bg':      '#F5F7F5',   // page background – very light green-tinted white
        'brand-surface': '#FFFFFF',
        'brand-border':  '#DDE8DD',
        'brand-green':   '#3D7A5A',   // primary CTA, sidebar active
        'brand-green-light': '#EAF2EC', // icon bg, chip bg
        'brand-green-dark':  '#2A5940',
        'brand-text':    '#1C2B22',   // headings
        'brand-muted':   '#6B7D72',   // body text
        // Risk colours
        'risk-low':      '#3D7A5A',
        'risk-mod':      '#D97706',
        'risk-high':     '#DC2626',
        // Legacy aliases kept so existing code compiles
        'off-white':    '#F5F7F5',
        'sage-green':   '#7AAE88',
        'forest-green': '#3D7A5A',
        'muted-coral':  '#D4826A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};

export default config;
