import type { Config } from 'tailwindcss';

/**
 * Configuration is now primarily handled in src/app/globals.css via Tailwind CSS v4.
 * This file is maintained for compatibility with tooling that requires a config file.
 */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
} satisfies Config;
