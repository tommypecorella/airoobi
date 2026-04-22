#!/usr/bin/env node
// Download 2 foto per ciascun airdrop bulk_populate da Loremflickr,
// upload su Supabase Storage (bucket 'airdrops'), aggiorna image_url
// + product_info.extra_photos.
//
// Richiede SUPABASE_SERVICE_KEY in .env.

import 'dotenv/config';

const SB_URL = 'https://vuvlmlpuhovipfwtquux.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SB_KEY) { console.error('Missing SUPABASE_SERVICE_KEY in .env'); process.exit(1); }

// Per i 3 airdrop con foto locale serve la keyword per generare la seconda foto
const LOCAL_KEYWORDS = {
  'iPhone 15 Pro Max 256GB Titanio Naturale': 'iphone,pro,max,titanium',
  'PlayStation 5 Pro Digital Edition':        'playstation,ps5,console',
  'Louis Vuitton Keepall 55 Monogram':        'louis,vuitton,keepall',
};

const headers = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
};

async function fetchLoremflickr(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Fetch ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToStorage(path, buffer) {
  const res = await fetch(`${SB_URL}/storage/v1/object/airdrops/${path}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Upload ${path} → ${res.status} ${await res.text()}`);
  return `${SB_URL}/storage/v1/object/public/airdrops/${path}`;
}

async function listAirdrops() {
  const res = await fetch(
    `${SB_URL}/rest/v1/airdrops?product_info->>bulk_populate=eq.true&select=id,title,image_url,product_info&order=category,title`,
    { headers }
  );
  if (!res.ok) throw new Error(`List ${res.status}`);
  return res.json();
}

async function updateAirdrop(id, imageUrl, extraPhotos, product_info) {
  const newInfo = { ...(product_info || {}), extra_photos: extraPhotos };
  const res = await fetch(`${SB_URL}/rest/v1/airdrops?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ image_url: imageUrl, product_info: newInfo }),
  });
  if (!res.ok) throw new Error(`Update ${id} → ${res.status} ${await res.text()}`);
}

function buildLoremflickrUrl(keywords, lock) {
  return `https://loremflickr.com/800/600/${keywords}/all?lock=${lock}`;
}

function parseExisting(url) {
  // url = https://loremflickr.com/800/600/kw1,kw2,kw3/all?lock=XXXX
  const m = url.match(/loremflickr\.com\/\d+\/\d+\/([^/]+)\/all\?lock=(\d+)/);
  if (!m) return null;
  return { keywords: m[1], lock: parseInt(m[2], 10) };
}

async function main() {
  const airdrops = await listAirdrops();
  console.log(`Found ${airdrops.length} airdrops bulk_populate`);

  const errors = [];
  for (let i = 0; i < airdrops.length; i++) {
    const a = airdrops[i];
    const tag = `[${String(i + 1).padStart(3, '0')}/${airdrops.length}]`;
    const shortTitle = a.title.length > 45 ? a.title.substring(0, 45) + '...' : a.title;

    try {
      const isLocal = a.image_url && a.image_url.startsWith('/public/');
      let keywords, lock1;

      if (isLocal) {
        keywords = LOCAL_KEYWORDS[a.title];
        if (!keywords) { throw new Error(`No keywords mapping for local title "${a.title}"`); }
        lock1 = 10000 + (i + 1); // derivato
      } else {
        const parsed = parseExisting(a.image_url);
        if (!parsed) { throw new Error(`Cannot parse URL: ${a.image_url}`); }
        keywords = parsed.keywords;
        lock1 = parsed.lock;
      }

      // Foto 1
      let photo1Url;
      if (isLocal) {
        // Mantiene la foto locale come image_url principale; non servono download
        photo1Url = a.image_url;
        process.stdout.write(`${tag} ${shortTitle.padEnd(48)} keep-local `);
      } else {
        const url1 = buildLoremflickrUrl(keywords, lock1);
        process.stdout.write(`${tag} ${shortTitle.padEnd(48)} fetch-1 `);
        const buf1 = await fetchLoremflickr(url1);
        photo1Url = await uploadToStorage(`${a.id}/1.jpg`, buf1);
        process.stdout.write(`(${buf1.length}b) `);
      }

      // Foto 2: lock + 20000
      const lock2 = lock1 + 20000;
      const url2 = buildLoremflickrUrl(keywords, lock2);
      process.stdout.write(`fetch-2 `);
      const buf2 = await fetchLoremflickr(url2);
      const photo2Url = await uploadToStorage(`${a.id}/2.jpg`, buf2);
      process.stdout.write(`(${buf2.length}b) `);

      await updateAirdrop(a.id, photo1Url, [photo2Url], a.product_info);
      console.log('OK');
    } catch (e) {
      console.log(`ERR: ${e.message}`);
      errors.push({ id: a.id, title: a.title, error: e.message });
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Completed: ${airdrops.length - errors.length}/${airdrops.length}`);
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e.title}: ${e.error}`));
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
