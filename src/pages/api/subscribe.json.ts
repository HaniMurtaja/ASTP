
import type { APIRoute } from 'astro';
export const partial = true;

export const post: APIRoute = async ({ request }) => {
  try {
    console.log('[subscribe] payload:', await request.clone().json());
    const { email, token } = await request.json();
    if (!email || !token) {
      return new Response(JSON.stringify({ error: 'Missing email or token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Verify Cloudflare Turnstile token to prevent spam
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: import.meta.env.CF_TURNSTILE_SECRET || '',
        response: token,
      }),
    });
    const turnstileData = await turnstileRes.json();
    console.log('[subscribe] turnstile verification:', turnstileData);
    if (!turnstileData.success) {
      return new Response(JSON.stringify({ error: 'Turnstile verification failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Forward subscription to your origin backend securely
    const backendRes = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/contactuses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.ORIGIN_BACKEND_API_KEY}`,
      },
      body: JSON.stringify({ email, body: { slug: 'news-letter' } }),
    });
    console.log('[subscribe] backend status:', backendRes.status);
    const backendBody = await backendRes.clone().text();
    console.log('[subscribe] backend body:', backendBody);
    if (!backendRes.ok) {
      const err = await backendRes.text();
      return new Response(JSON.stringify({ error: 'Backend error', details: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[subscribe endpoint]', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

