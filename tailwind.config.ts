import type {Config} from 'tailwindcss';

/**
 * Tailwind CSS v4 transition: configuration is primarily handled in globals.css
 * via the @theme block. This file is kept minimal to avoid compiler conflicts
 * with Turbopack while allowing tool-specific extensions if required.
 */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;