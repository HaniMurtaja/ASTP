import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import typographyPlugin from '@tailwindcss/typography';
// include some classes to be loaded regardless of being in classes
export default {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  safeList:['w-2/3','xl:w-2/3'],
  theme: {
    extend: {
      colors: {
        primary: 'hsla(var(--aw-color-primary) / <alpha-value>)',
        "primary-light": 'hsla(var(--aw-color-primary-light) / <alpha-value>)',
        "primary-dark": 'hsla(var(--aw-color-primary-dark) / <alpha-value>)',
        secondary: 'hsla(var(--aw-color-secondary) / <alpha-value>)',
        accent: 'hsla(var(--aw-color-accent) / <alpha-value>)',
        default: 'hsla(var(--aw-color-text-default) / <alpha-value>)',
        muted: 'hsla(var(--aw-color-text-muted) / <alpha-value>)',
        cta: 'hsla(var(--aw-color-cta) / <alpha-value>)',
        yellow: 'hsla(var(--aw-color-yellow) / <alpha-value>)',
        green: 'hsla(var(--aw-color-green) / <alpha-value>)',
        mainGray: 'hsla(var(--aw-color-gray) / <alpha-value>)',
        mainWhite: 'hsla(var(--aw-color-white) / <alpha-value>)',
        page: 'hsla(var(--aw-color-bg-page) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
      },

      animation: {
        fade: 'fadeInUp 1s both',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(2rem)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    typographyPlugin,
    plugin(({ addVariant }) => {
      addVariant('intersect', '&:not([no-intersect])');
    }),
  ],
  darkMode: 'class',
};
