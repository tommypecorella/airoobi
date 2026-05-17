// AIROOBI dynamic OG image generator · Atto 6 winner stories
// Vercel Edge Function via @vercel/og (Satori) · 1200x630 PNG per /storie-vincitori/:id
// Route: /api/og-story?id={airdrop_id}
// W4 Day 12.5 · closes LOW Day 13 buffer · brand pollution viral layer dynamic

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vuvlmlpuhovipfwtquux.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NjM0MjEsImV4cCI6MjA4ODIzOTQyMX0.5iEqns2F7N6h1VVxLJjqu3Rm4doOVDs5hpD8sNaL6co';
const FALLBACK = 'https://www.airoobi.com/og-image.png?v=4.24.0';

function fallbackRedirect() {
  return Response.redirect(FALLBACK, 302);
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return fallbackRedirect();

    // Fetch story via Supabase RPC
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_winner_story_public`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ p_airdrop_id: id }),
    });
    if (!r.ok) return fallbackRedirect();
    const data = await r.json();
    const d = Array.isArray(data) ? data[0] : data;
    if (!d || !d.airdrop_id) return fallbackRedirect();

    const title = String(d.title || 'AIROOBI').slice(0, 80);
    const category = String(d.category || '').toUpperCase();
    const valueEur = d.object_value_eur ? `€${d.object_value_eur}` : '';
    const participants = d.total_participants ? `${d.total_participants} partecipanti` : '';

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
          },
          children: [
            // Top row · brand + category
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '28px', fontWeight: 700, letterSpacing: '6px', color: '#B8960C' },
                      children: 'AIROOBI',
                    },
                  },
                  category
                    ? {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '14px',
                            letterSpacing: '3px',
                            color: '#888',
                            padding: '8px 16px',
                            border: '1px solid #333',
                            borderRadius: '4px',
                          },
                          children: category,
                        },
                      }
                    : null,
                ].filter(Boolean),
              },
            },
            // Middle · title + value
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: '16px' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '12px', letterSpacing: '4px', color: '#B8960C', fontWeight: 700 },
                      children: 'STORIA VINCITORE',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '60px', fontWeight: 500, lineHeight: 1.05, color: '#ffffff', maxWidth: '1060px' },
                      children: title,
                    },
                  },
                  valueEur
                    ? {
                        type: 'div',
                        props: {
                          style: { fontSize: '40px', fontWeight: 500, color: '#B8960C' },
                          children: valueEur,
                        },
                      }
                    : null,
                ].filter(Boolean),
              },
            },
            // Bottom · participants + brand promise
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #1f1f1f',
                  paddingTop: '24px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '20px', color: '#aaaaaa' },
                      children: participants || 'airoobi.com',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: '16px', color: '#666', fontStyle: 'italic' },
                      children: 'Un blocco alla volta',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
          'Content-Type': 'image/png',
        },
      }
    );
  } catch (err) {
    console.error('og-story error', err);
    return fallbackRedirect();
  }
}
