// ===================================================================
// GLASSATORE · path generativo "HD realistico"  (opzionale, GATED)
// Route: POST /api/glassatore-hd   body: { view, face<dataURL>, glasses<dataURL> }
// -------------------------------------------------------------------
// Il motore geometrico (client-side) è il default sempre attivo.
// Questo endpoint è un upgrade fotorealistico: prova a "indossare" la
// montatura sul volto con un modello immagine. È DISATTIVO finché non
// è configurata una chiave (env GLASSATORE_IMAGE_API_KEY oppure
// OPENAI_API_KEY). Senza chiave → 501 con messaggio chiaro, così il
// front-end resta sul geometrico senza errori.
// ===================================================================

export const config = { runtime: 'nodejs', maxDuration: 60 };

const PROMPT =
  "Place the eyeglasses from the second image naturally onto the face in the first image. " +
  "Match the head pose, perspective and lighting, keep the frame size realistic for the face, " +
  "render the temple arms along the side of the head toward the ear. Photorealistic, keep the " +
  "person and background unchanged, output only the edited photo.";

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

const dataUrlToBuffer = (u) => Buffer.from(String(u || '').split(',')[1] || '', 'base64');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const KEY = process.env.GLASSATORE_IMAGE_API_KEY || process.env.OPENAI_API_KEY;
  if (!KEY) {
    res.status(501).json({
      ok: false,
      message: 'HD generativo non configurato (nessuna chiave modello-immagine lato server).',
      hint: 'Imposta GLASSATORE_IMAGE_API_KEY (o OPENAI_API_KEY) tra le env del progetto Vercel per attivarlo.',
    });
    return;
  }

  try {
    const { view, face, glasses } = await readBody(req);
    if (!face || !glasses) { res.status(400).json({ error: 'missing_images' }); return; }

    // Implementazione di riferimento: OpenAI Images Edit (gpt-image-1),
    // che accetta più immagini di riferimento e un prompt.
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', PROMPT);
    form.append('size', '1024x1024');
    form.append('image[]', new Blob([dataUrlToBuffer(face)], { type: 'image/png' }), 'face.png');
    form.append('image[]', new Blob([dataUrlToBuffer(glasses)], { type: 'image/png' }), 'glasses.png');

    const r = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}` },
      body: form,
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      res.status(502).json({ error: 'upstream_error', status: r.status, detail: txt.slice(0, 300), view });
      return;
    }
    const j = await r.json();
    const b64 = j?.data?.[0]?.b64_json;
    if (!b64) { res.status(502).json({ error: 'empty_result', view }); return; }
    res.status(200).json({ ok: true, view, image: `data:image/png;base64,${b64}` });
  } catch (e) {
    res.status(500).json({ error: 'exception', message: String(e && e.message || e) });
  }
}
