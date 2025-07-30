import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration, Locales } from 'astro';
import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';
import netlify from '@astrojs/netlify';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];
const defaultLocale = 'ar';
let locales: Locales = [defaultLocale];
const localesObjects = await fetch(`https://api.lp4q.org/api/locales`, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
  .then((res) => res.json())
  .catch(() => null);
if (localesObjects?.data?.length) {
  locales = localesObjects.data?.map((locale) => locale.lang_code) as Array<typeof defaultLocale | string>;
}
if (!locales || !locales.length)
  locales = [defaultLocale, 'en', 'fr', 'tr', 'ur', 'ms', 'fa', 'de', 'es', 'pt', 'it', 'ru', 'zh', 'ja'];

// 2. Make sure it exists (recursive:true allows nested dirs)

export default defineConfig({
  output: 'server',

  adapter: netlify({
    // imageCDN: false,
    cacheOnDemandPages: true,
    // edgeMiddleware: true,
  }),

  i18n: {
    locales,
    defaultLocale,
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        heroicons:['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    domains: ['cdn.pixabay.com', 'lp4q.org', 'api.lp4q.org', 'ip4q.coktilat.com', 'localhost', 'localhost:8000'],
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    ssr: {
      // Treat the server bundle as running on Node
      target: 'node',
      // Don’t bundle these built-in modules
      external: ['stream', 'http', 'https', 'url', 'zlib', 'util', 'crypto'],
    },
  },
});
