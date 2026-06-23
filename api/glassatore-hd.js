// ===================================================================
// GLASSATORE · path generativo "HD realistico"  (opzionale, GATED)
// Route: POST /api/glassatore-hd   body: { view, face<dataURL>, glasses<dataURL> }
// Provider: Google Gemini 2.5 Flash Image ("nano-banana") — image editing
//           multi-reference: prende gli occhiali dalla 2ª immagine e li
//           "indossa" sul viso della 1ª, mantenendo posa/luce/identità.
// -------------------------------------------------------------------
// Il motore geometrico (client-side) resta il default sempre attivo.
// Questo endpoint è DISATTIVO finché non è configurata una chiave:
//   GLASSATORE_IMAGE_API_KEY  (consigliata)  | GEMINI_API_KEY | GOOGLE_API_KEY
// Senza chiave → 501 con messaggio chiaro → il front-end resta sul geometrico.
// Per attivarlo: aggiungi la env tra le impostazioni del progetto Vercel.
// ===================================================================

export const config = { runtime: 'nodejs', maxDuration: 60 };

const MODEL = process.env.GLASSATORE_IMAGE_MODEL || 'gemini-2.5-flash-image';

const PROMPT =
  'Take the EXACT eyeglasses shown in the SECOND image and place them naturally on the ' +
  'face of the person in the FIRST image. ' +
  'CRITICAL — reproduce the eyewear faithfully: keep the SAME colors, materials and finish ' +
  'for BOTH the frame front and the temple arms separately (for example, if the frame front ' +
  'is black and the temple arms are red, the result must show a black front with red temples). ' +
  'Do NOT recolor, restyle or simplify the glasses; preserve their exact shape, thickness and color blocking. ' +
  'Match the head pose, perspective and lighting; size the frame realistically for the face; ' +
  'render the temple arms along the side of the head toward the ear. ' +
  'Keep the person, hair, skin, expression, framing, aspect ratio and background EXACTLY as in the first image. ' +
  'Photorealistic result. Output only the edited photograph, no text.';

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

// "data:image/png;base64,XXXX" → { mime, data }
function splitDataUrl(u) {
  const s = String(u || '');
  const m = s.match(/^data:([^;]+);base64,(.*)$/);
  if (m) return { mime: m[1], data: m[2] };
  return { mime: 'image/png', data: s.split(',')[1] || s };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  // --- gate password (protegge il budget: l'endpoint è pubblico) ---
  // Fail-safe: senza GLASSATORE_HD_PASSWORD configurata, l'HD è BLOCCATO.
  const PASS = process.env.GLASSATORE_HD_PASSWORD;
  const given = req.headers['x-glassatore-pass'] || '';
  if (!PASS) {
    res.status(401).json({ ok: false, message: 'HD bloccato: password non configurata sul server.',
      hint: 'Imposta GLASSATORE_HD_PASSWORD tra le env del progetto Vercel per abilitare l’HD.' });
    return;
  }
  if (given !== PASS) {
    res.status(401).json({ ok: false, message: 'password errata o mancante.' });
    return;
  }

  const KEY = process.env.GLASSATORE_IMAGE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!KEY) {
    res.status(501).json({
      ok: false,
      message: 'HD generativo non configurato (nessuna chiave modello-immagine lato server).',
      hint: 'Imposta GLASSATORE_IMAGE_API_KEY (chiave Google AI Studio) tra le env del progetto Vercel per attivarlo.',
    });
    return;
  }

  try {
    const { view, face, glasses } = await readBody(req);
    if (!face || !glasses) { res.status(400).json({ error: 'missing_images' }); return; }
    const f = splitDataUrl(face), g = splitDataUrl(glasses);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    const payload = {
      contents: [{
        role: 'user',
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: f.mime, data: f.data } },     // FIRST = viso
          { inline_data: { mime_type: g.mime, data: g.data } },     // SECOND = occhiali
        ],
      }],
      generationConfig: { responseModalities: ['IMAGE'], temperature: 0.2 },
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      res.status(502).json({ error: 'upstream_error', status: r.status, detail: txt.slice(0, 400), view });
      return;
    }
    const j = await r.json();
    const parts = j?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData || p.inline_data);
    const inl = imgPart && (imgPart.inlineData || imgPart.inline_data);
    if (!inl || !inl.data) {
      const reason = j?.candidates?.[0]?.finishReason || j?.promptFeedback?.blockReason || 'no_image_part';
      res.status(502).json({ error: 'empty_result', reason, view });
      return;
    }
    const mime = inl.mimeType || inl.mime_type || 'image/png';
    res.status(200).json({ ok: true, view, image: `data:${mime};base64,${inl.data}` });
  } catch (e) {
    res.status(500).json({ error: 'exception', message: String((e && e.message) || e) });
  }
}
