import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
        heading: ['var(--font-heading)', 'serif'],
        code: ['monospace'],
      },
      spacing: {
        'arl-xs': 'var(--sp-xs)',
        'arl-sm': 'var(--sp-sm)',
        'arl-md': 'var(--sp-md)',
        'arl-lg': 'var(--sp-lg)',
        'arl-xl': 'var(--sp-xl)',
        'arl-2xl': 'var(--sp-2xl)',
      },
      borderRadius: {
        'arl-sm': 'var(--r-sm)',
        'arl-md': 'var(--r-md)',
        'arl-lg': 'var(--r-lg)',
        'arl-xl': 'var(--r-xl)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'arl-void': 'var(--arl-void)',
        'arl-deep': 'var(--arl-deep)',
        'arl-surface': 'var(--arl-surface)',
        'arl-elevated': 'var(--arl-elevated)',
        'arl-panel': 'var(--arl-panel)',
        'arl-border': 'var(--arl-border)',
        'arl-border-glow': 'var(--arl-border-glow)',
        'arl-gold': 'var(--arl-gold)',
        'arl-gold-dim': 'var(--arl-gold-dim)',
        'arl-gold-glow': 'var(--arl-gold-glow)',
        'arl-amber': 'var(--arl-amber)',
        'arl-amber-glow': 'var(--arl-amber-glow)',
        'arl-arcane': 'var(--arl-arcane)',
        'arl-arcane-mid': 'var(--arl-arcane-mid)',
        'arl-arcane-glow': 'var(--arl-arcane-glow)',
        'arl-teal': 'var(--arl-teal)',
        'arl-teal-dim': 'var(--arl-teal-dim)',
        'arl-teal-glow': 'var(--arl-teal-glow)',
        'arl-blood': 'var(--arl-blood)',
        'arl-blood-dim': 'var(--arl-blood-dim)',
        'arl-sage': 'var(--arl-sage)',
        'arl-sage-bright': 'var(--arl-sage-bright)',
        'arl-text-primary': 'var(--arl-text-primary)',
        'arl-text-secondary': 'var(--arl-text-secondary)',
        'arl-text-muted': 'var(--arl-text-muted)',
        'arl-text-code': 'var(--arl-text-code)',
        'arl-ok': 'var(--arl-ok)',
        'arl-warn': 'var(--arl-warn)',
        'arl-danger': 'var(--arl-danger)',
        'arl-ghost': 'var(--arl-ghost)',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        'arl-arcane-glow': '0 0 12px var(--arl-arcane-glow)',
        'arl-arcane-glow-lg': '0 0 20px var(--arl-arcane-glow)',
      },
      transitionDuration: {
        'fast': 'var(--t-fast)',
        'mid': 'var(--t-mid)',
        'slow': 'var(--t-slow)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;