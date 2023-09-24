import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const safeColors = [
  'yellow',
  'pink',
  'purple',
  'red',
  'orange',
  'green',
  'cyan',
  'primary',
  'secondary',
  'background'
];

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  safelist: [
    ...safeColors.flatMap(color => [
      `bg-${color}`,
      `from-${color}`,
      `to-${color}`,
      `selection:bg-${color}`
    ])
  ],
  theme: {
    extend: {
      colors: {
        yellow: '#ffff80',
        pink: '#ff80bf',
        purple: '#9580ff',
        red: '#ff9580',
        orange: '#ffca80',
        green: '#8aff80',
        cyan: '#80ffea',
        primary: '#f2f2f2',
        secondary: '#8f9ba8',
        background: '#08070b',
        hover: '#212024',
        command: 'rgba(255, 255, 255, 0.05)',
        linkedin: '#0077b5',
        instagram: '#e1306c',
        github: '#777777'
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        // sans: 'Biotif, sans-serif',
        mono: ['var(--font-mono)', ...fontFamily.mono],
        // code: 'Fira Code, monospace',
        heading: ['var(--font-heading)', ...fontFamily.mono]
        // heading: 'Neuzeit Grotesk Bold, sans-serif'
      },
      space: {
        navHeightDesktop: '3.75rem',
        navHeightMobile: '6.875rem'
      },
      padding: {
        navHeightDesktop: '3.75rem',
        navHeightMobile: '6.875rem'
      },
      transitionDuration: {
        default: '0.2s'
      },
      borderRadius: {
        default: '0.5rem'
      }
    }
  },
  plugins: []
} satisfies Config;
