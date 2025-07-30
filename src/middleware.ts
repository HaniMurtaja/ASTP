// src/middleware.ts
import type { MiddlewareHandler } from 'astro';
import { fetchLocales } from './api';

const defaultLocale = 'en'; // Add this constant

export const onRequest: MiddlewareHandler = async ({ request, cookies, currentLocale }, next) => {
  const defaultLocale = 'ar';
  const fallbackLocales = ['ar', 'en', 'fr', 'tr', 'ur', 'ms', 'fa', 'de', 'es', 'pt', 'it', 'ru', 'zh', 'ja','hi'];
  
  let supportedLocales: string[] = fallbackLocales; // Start with fallback
  
  try {
    const locales = await fetchLocales(undefined);
    if (locales.data?.length) {
      supportedLocales = locales.data.map((locale) => locale.lang_code);
      console.log('fetched locales', supportedLocales);
    } else {
      console.log('failed to fetch locales, using fallback', locales);
    }
  } catch (error) {
    console.log('error fetching locales, using fallback', error);
  }

  // Ensure default locale is always included
  if (!supportedLocales.includes(defaultLocale)) {
    supportedLocales.push(defaultLocale);
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (pathname.includes('appspecific/com.chrome.devtools.json')) {
    return new Response(
      '{"name":"astro","version":"1.0.0","description":"astro","devtools_port":9222,"webview_port":9223,"webview_debugger_port":9224,"webview_devtools_port":9225,"webview_remote_debugging_port":9226,"webview_remote_debugging_url":"ws://localhost:9226/devtools/browser/","webview_remote_debugging_url_v2":"ws://localhost:9226/devtools/page/"}',
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  // Skip middleware for assets, static files, and Astro internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_image') ||
    pathname.startsWith('/.netlify') ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/assets/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    // any request for a file with an extension (images, CSS, JS, etc.)
    /\.[^\/]+$/.test(pathname)
  ) {
    return next();
  }
  
  const segments = pathname.split('/').filter(Boolean);

  // Debug logging
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Processing:', pathname);
  console.log('segments:', segments);
  console.log('segments[0]:', segments[0]);
  console.log('supportedLocales:', supportedLocales);
  console.log('supportedLocales.includes(segments[0]):', supportedLocales.includes(segments[0]));
  console.log('========================');

  // 1. Read or derive the locale
  let locale = cookies.get('locale')?.value || '';
  if (!locale) {
    const header = request.headers.get('accept-language') || '';
    const derived = header.split(',')[0]?.split('-')[0];
    locale = supportedLocales.includes(derived) ? derived : defaultLocale;
    cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  console.log('Current locale:', locale);

  // 2. Check if path starts with any locale (supported or not)
  const firstSegmentIsLocale = segments[0] && fallbackLocales.includes(segments[0]);
  const hasValidLocalePrefix = segments[0] && supportedLocales.includes(segments[0]);
  
  console.log('firstSegmentIsLocale:', firstSegmentIsLocale);
  console.log('hasValidLocalePrefix:', hasValidLocalePrefix);
  
  if (firstSegmentIsLocale) {
    if (hasValidLocalePrefix) {
      console.log('Path has valid locale prefix, continuing...');
      // Update cookie if different
      if (segments[0] !== locale) {
        cookies.set('locale', segments[0], { path: '/', maxAge: 60 * 60 * 24 * 365 });
      }
      return next();
    } else {
      console.log('Path has unsupported locale prefix, letting it 404...');
      // Let unsupported locales go to 404 instead of redirecting
      return next();
    }
  }

  console.log('No locale prefix found, redirecting...');
  
  // 3. Otherwise (no locale prefix) → issue a real 302 redirect
  // For root path, redirect to locale root (without trailing slash)
  if (pathname === '/') {
    const target = `/${locale}${url.search}${url.hash}`;
    return new Response(null, {
      status: 302,
      headers: { location: target },
    });
  }
  
  // For other paths, prefix with locale
  const target = `/${locale}${pathname}${url.search}${url.hash}`;
  return new Response(null, {
    status: 302,
    headers: { location: target },
  });
};