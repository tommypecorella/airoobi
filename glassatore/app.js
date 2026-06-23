/* ===================================================================
   GLASSATORE — motore try-on occhiali multi-angolo  ·  AIROOBI Lab
   -------------------------------------------------------------------
   Motore IBRIDO:
   • Geometrico (default, 100% client-side, gratis):
       1. MediaPipe Face Landmarker  → punti del volto + misure ("le ASA")
       2. Scontorno montatura (flood-fill CV) + rilevamento centri-lente
       3. Allineamento a similarità (2 punti): lenti→pupille (fronte),
          asta→ (occhio→orecchio) sui profili SX/DX
   • Generativo "HD" (opzionale, gated): POST /api/glassatore-hd
   Pipeline e immagini restano sul dispositivo in modalità geometrica.
   =================================================================== */

const MAXDIM = 1024;            // lato massimo immagini di lavoro
const VIEWS  = ['front', 'left', 'right'];

/* ---------- stato globale ---------- */
const S = {
  glasses: { front: null, left: null, right: null }, // {cutout, anchors:{...}, bbox}
  face:    { front: null, left: null, right: null }, // {canvas, lm, measures, anchors, ok}
  result:  { front: null, left: null, right: null }, // {face, line, ready, hd}
  landmarker: null,
  landmarkerState: 'idle',
  stream: null,
  armedPose: null,
};

/* ---------- shortcuts DOM ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const engineDot   = $('#engineDot');
const engineState = $('#engineState');
const logBox      = $('#engineLog');

/* =================================================================
   LOG
================================================================= */
function log(msg, cls = '') {
  const line = document.createElement('div');
  if (cls) line.innerHTML = `<span class="${cls}">${msg}</span>`;
  else line.textContent = msg;
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}
function setEngine(state, label) {
  S.landmarkerState = state;
  engineDot.className = 'gl-dot ' + (state === 'loading' ? 'is-loading' : state === 'ready' ? 'is-ready' : state === 'error' ? 'is-error' : '');
  engineState.textContent = label;
}

/* =================================================================
   UTILITY IMMAGINI / GEOMETRIA
================================================================= */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const deg  = r => r * 180 / Math.PI;

function fileToImage(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

/* disegna una sorgente (Image/Canvas/Video) in un canvas con lato max = MAXDIM */
function toCanvas(src, sw, sh) {
  const w0 = sw || src.naturalWidth || src.videoWidth || src.width;
  const h0 = sh || src.naturalHeight || src.videoHeight || src.height;
  const sc = Math.min(1, MAXDIM / Math.max(w0, h0));
  const c = document.createElement('canvas');
  c.width = Math.round(w0 * sc);
  c.height = Math.round(h0 * sc);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/* dataURL ridimensionato (per i payload HD: sotto il limite body di Vercel) */
function cappedDataURL(canvas, max, type, q) {
  const sc = Math.min(1, max / Math.max(canvas.width, canvas.height));
  if (sc === 1) return canvas.toDataURL(type, q);
  const c = document.createElement('canvas');
  c.width = Math.round(canvas.width * sc); c.height = Math.round(canvas.height * sc);
  c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
  return c.toDataURL(type, q);
}

/* matrice di similarità (rotazione+scala+traslazione) che mappa s0→d0, s1→d1.
   Restituisce i 6 parametri per ctx.setTransform(a,b,c,d,e,f). */
function similarity(s0, s1, d0, d1) {
  const sv = { x: s1.x - s0.x, y: s1.y - s0.y };
  const dv = { x: d1.x - d0.x, y: d1.y - d0.y };
  const sl = Math.hypot(sv.x, sv.y) || 1e-6;
  const scale = Math.hypot(dv.x, dv.y) / sl;
  const ang = Math.atan2(dv.y, dv.x) - Math.atan2(sv.y, sv.x);
  const a = scale * Math.cos(ang), b = scale * Math.sin(ang);
  const c = -b, d = a;
  const e = d0.x - (a * s0.x + c * s0.y);
  const f = d0.y - (b * s0.x + d * s0.y);
  return { a, b, c, d, e, f };
}

/* =================================================================
   MEDIAPIPE  —  init lazy
================================================================= */
const MP_VER = '0.10.35';   // versione MediaPipe tasks-vision (verificata su jsdelivr)
async function getLandmarker() {
  if (S.landmarker) return S.landmarker;
  if (S.landmarkerState === 'error') return null;
  setEngine('loading', 'viso: carico…');
  log('Inizializzo MediaPipe Face Landmarker…', 'dim');
  try {
    const vision = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}`);
    const fileset = await vision.FilesetResolver.forVisionTasks(
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}/wasm`
    );
    const make = (delegate) => vision.FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate,
      },
      runningMode: 'IMAGE', numFaces: 1,
      minFaceDetectionConfidence: 0.25, minFacePresenceConfidence: 0.25,
    });
    try { S.landmarker = await make('GPU'); }
    catch (gpuErr) { console.warn('GPU delegate ko, provo CPU', gpuErr); S.landmarker = await make('CPU'); }
    setEngine('ready', 'viso: auto ✓');
    log('Rilevamento volto pronto ✓', 'ok');
    return S.landmarker;
  } catch (err) {
    console.error(err);
    setEngine('error', 'viso: manuale');
    log('Rilevamento automatico non disponibile — usa i pallini per allineare a mano.', 'warn');
    return null;
  }
}

/* indici landmark FaceMesh */
const IDX = { irisL: [468,469,470,471,472], irisR: [473,474,475,476,477],
  eyeLc: 33, eyeLi: 133, eyeRi: 362, eyeRc: 263, nose: 1, bridge: 168,
  cheekL: 234, cheekR: 454, chin: 152, foreTop: 10 };

function avgPts(lm, idxs, w, h) {
  let x = 0, y = 0, n = 0;
  for (const i of idxs) { if (lm[i]) { x += lm[i].x; y += lm[i].y; n++; } }
  return { x: (x / n) * w, y: (y / n) * h };
}
const P = (lm, i, w, h) => ({ x: lm[i].x * w, y: lm[i].y * h });

/* rileva il volto in un canvas → landmark + misure + ancore di default */
async function detectFace(canvas) {
  const lmk = await getLandmarker();
  const w = canvas.width, h = canvas.height;
  if (!lmk) return null;
  let out;
  try { out = lmk.detect(canvas); } catch (e) { console.error(e); return null; }
  if (!out || !out.faceLandmarks || !out.faceLandmarks.length) return null;
  const lm = out.faceLandmarks[0];

  // pupille: iris se disponibili, altrimenti centro degli angoli occhio
  const hasIris = lm.length >= 478;
  const pa = hasIris ? avgPts(lm, IDX.irisL, w, h)
                     : { x: (lm[IDX.eyeLc].x + lm[IDX.eyeLi].x) / 2 * w, y: (lm[IDX.eyeLc].y + lm[IDX.eyeLi].y) / 2 * h };
  const pb = hasIris ? avgPts(lm, IDX.irisR, w, h)
                     : { x: (lm[IDX.eyeRc].x + lm[IDX.eyeRi].x) / 2 * w, y: (lm[IDX.eyeRc].y + lm[IDX.eyeRi].y) / 2 * h };
  const pupilL = pa.x <= pb.x ? pa : pb;      // sinistra nell'immagine
  const pupilR = pa.x <= pb.x ? pb : pa;

  const nose   = P(lm, IDX.nose, w, h);
  const bridge = P(lm, IDX.bridge, w, h);
  const cheekL = P(lm, IDX.cheekL, w, h);
  const cheekR = P(lm, IDX.cheekR, w, h);

  const ipd = dist(pupilL, pupilR);
  const roll = deg(Math.atan2(pupilR.y - pupilL.y, pupilR.x - pupilL.x));
  const faceW = dist(cheekL, cheekR);
  const mid = { x: (cheekL.x + cheekR.x) / 2, y: (cheekL.y + cheekR.y) / 2 };
  const yaw = Math.max(-60, Math.min(60, ((nose.x - mid.x) / (faceW || 1)) * 140));

  return { lm, w, h, hasIris, pupilL, pupilR, nose, bridge, cheekL, cheekR,
           measures: { ipd, roll, faceW, yaw } };
}

/* ancore volto di default per ogni vista (rifinibili a mano col drag) */
function defaultFaceAnchors(view, det, w, h) {
  if (det) {
    if (view === 'front') return [ { ...det.pupilL }, { ...det.pupilR } ];
    // profili: ancora 1 = zona occhio (vicino camera), ancora 2 = orecchio stimato
    const eye = { x: (det.pupilL.x + det.pupilR.x) / 2, y: (det.pupilL.y + det.pupilR.y) / 2 };
    const fw  = det.measures.faceW || w * 0.4;
    const towardRight = view === 'right';          // orecchio dalla parte verso cui gira la testa
    const earX = eye.x + (towardRight ? 1 : -1) * fw * 0.92;
    const earY = eye.y + fw * 0.10;
    return [ eye, { x: Math.max(8, Math.min(w - 8, earX)), y: earY } ];
  }
  // nessun rilevamento → posizioni indicative al centro
  if (view === 'front') return [ { x: w * 0.40, y: h * 0.42 }, { x: w * 0.60, y: h * 0.42 } ];
  const towardRight = view === 'right';
  return [ { x: w * 0.5, y: h * 0.42 }, { x: w * (towardRight ? 0.82 : 0.18), y: h * 0.46 } ];
}

/* =================================================================
   SCONTORNO MONTATURA + RILEVAMENTO CENTRI-LENTE  (computer vision)
================================================================= */
/* Segmentazione montatura in un'unica passata.
   - "vuoto" = pixel colore-sfondo (se scontorno attivo) oppure alpha~0 (se PNG).
   - flood dai bordi sui vuoti = SFONDO vero  → reso trasparente.
   - vuoti RACCHIUSI dalla montatura = LENTI    → resi trasparenti (see-through)
     e i 2 più grandi danno i centri-lente (ancore fronte).
   Gli occhiali da sole (lenti opache) non risultano "vuoti": restano pieni e
   il rilevamento lenti va in fallback (bbox), gestito dal chiamante.
   Ritorna { canvas, lens } con lens = {lensL,lensR,auto} | null. */
function segmentFrame(srcCanvas, tol, useAlpha) {
  const w = srcCanvas.width, h = srcCanvas.height, N = w * h;
  const id = srcCanvas.getContext('2d').getImageData(0, 0, w, h);
  const px = id.data;
  const corners = [0, (w - 1), (h - 1) * w, (h - 1) * w + (w - 1)];
  let cr = 0, cg = 0, cb = 0;
  for (const c of corners) { cr += px[c*4]; cg += px[c*4+1]; cb += px[c*4+2]; }
  cr /= 4; cg /= 4; cb /= 4;
  const tol2 = (tol * tol) * 3;
  const empty = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (useAlpha) empty[i] = px[i*4+3] < 24 ? 1 : 0;
    else { const dr = px[i*4]-cr, dg = px[i*4+1]-cg, db = px[i*4+2]-cb;
           empty[i] = (dr*dr + dg*dg + db*db) <= tol2 ? 1 : 0; }
  }
  // flood dai bordi → sfondo connesso
  const bgc = new Uint8Array(N); const st = [];
  for (let x = 0; x < w; x++){ st.push(x, x + (h-1)*w); }
  for (let y = 0; y < h; y++){ st.push(y*w, y*w + (w-1)); }
  while (st.length){ const i = st.pop(); if (bgc[i] || !empty[i]) continue; bgc[i] = 1;
    const x = i % w, y = (i / w) | 0;
    if (x>0)st.push(i-1); if(x<w-1)st.push(i+1); if(y>0)st.push(i-w); if(y<h-1)st.push(i+w); }
  // vuoti racchiusi (non collegati al bordo) = lenti → componenti
  const lab = new Int32Array(N).fill(-1); const comps = [];
  for (let i = 0; i < N; i++) {
    if (lab[i] !== -1 || bgc[i] || !empty[i]) continue;
    let sx = 0, sy = 0, n = 0; const q = [i]; lab[i] = comps.length;
    while (q.length) { const j = q.pop(); const x = j%w, y = (j/w)|0; sx+=x; sy+=y; n++;
      if (x>0   && lab[j-1]===-1 && !bgc[j-1] && empty[j-1]) { lab[j-1]=comps.length; q.push(j-1); }
      if (x<w-1 && lab[j+1]===-1 && !bgc[j+1] && empty[j+1]) { lab[j+1]=comps.length; q.push(j+1); }
      if (y>0   && lab[j-w]===-1 && !bgc[j-w] && empty[j-w]) { lab[j-w]=comps.length; q.push(j-w); }
      if (y<h-1 && lab[j+w]===-1 && !bgc[j+w] && empty[j+w]) { lab[j+w]=comps.length; q.push(j+w); }
    }
    comps.push({ n, cx: sx/n, cy: sy/n });
  }
  // rendi trasparenti sfondo + lenti (così le lenti sono see-through)
  for (let i = 0; i < N; i++) if (empty[i]) px[i*4+3] = 0;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  out.getContext('2d').putImageData(id, 0, 0);
  comps.sort((a, b) => b.n - a.n);
  const big = comps.filter(c => c.n > N * 0.0012).slice(0, 2);
  let lens = null;
  if (big.length === 2) {
    const A = big[0], B = big[1];
    const L = A.cx <= B.cx ? A : B, R = A.cx <= B.cx ? B : A;
    lens = { lensL: { x: L.cx, y: L.cy }, lensR: { x: R.cx, y: R.cy }, auto: true };
  }
  return { canvas: out, lens };
}

/* bounding-box dei pixel opachi */
function opaqueBBox(cutout) {
  const w = cutout.width, h = cutout.height;
  const a = cutout.getContext('2d').getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = 0, y1 = 0, any = false;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (a[(y*w + x)*4 + 3] > 40) { any = true; if (x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  }
  if (!any) return { x:0, y:0, w, h };
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/* altezza opaca media in una banda verticale [x0..x1] → distingue lente da terminale asta */
function bandHeight(cutout, x0, x1) {
  const w = cutout.width, h = cutout.height;
  const a = cutout.getContext('2d').getImageData(0, 0, w, h).data;
  let top = h, bot = 0;
  for (let y = 0; y < h; y++) for (let x = x0|0; x < (x1|0); x++) {
    if (a[(y*w + x)*4 + 3] > 40) { if (y<top)top=y; if(y>bot)bot=y; }
  }
  return Math.max(0, bot - top);
}

/* elabora una foto montatura → cutout + ancore (per la vista) */
async function processGlasses(view, src) {
  const base = toCanvas(src);                 // accetta Image (upload) o Canvas (cattura)
  const slot = $(`#glassesSlots .gl-slot[data-key="${view}"]`);
  if (slot) { slot.classList.add('is-filled'); $('.gl-slot-img', slot).src = base.toDataURL('image/jpeg', 0.9); }
  const enable = !$('#bgTransparent').checked;   // PNG già trasparente → niente scontorno
  const tol = +$('#bgTol').value;
  // scontorno attivo → segmenta per colore; disattivo → fidati dell'alpha del PNG
  const { canvas: cutout, lens } = segmentFrame(base, tol, !enable);

  const bbox = opaqueBBox(cutout);
  let anchors;
  if (view === 'front') {
    anchors = lens || {
      lensL: { x: bbox.x + bbox.w * 0.27, y: bbox.y + bbox.h * 0.46 },
      lensR: { x: bbox.x + bbox.w * 0.73, y: bbox.y + bbox.h * 0.46 }, auto: false,
    };
  } else {
    // profilo: distingui lente (banda più alta) da terminale asta
    const lh = bandHeight(cutout, bbox.x, bbox.x + bbox.w * 0.25);
    const rh = bandHeight(cutout, bbox.x + bbox.w * 0.75, bbox.x + bbox.w);
    const lensLeft = lh >= rh;                 // la lente sta a sinistra del crop?
    const hinge  = { x: lensLeft ? bbox.x + bbox.w * 0.16 : bbox.x + bbox.w * 0.84, y: bbox.y + bbox.h * 0.45 };
    const temple = { x: lensLeft ? bbox.x + bbox.w * 0.97 : bbox.x + bbox.w * 0.03, y: bbox.y + bbox.h * 0.40 };
    anchors = { hinge, temple, auto: true };
  }
  S.glasses[view] = { cutout, anchors, bbox, original: base };   // original = riferimento colore/texture per l'HD
  log(`Montatura ${view}: ${anchors.auto ? 'ancore auto ✓' : 'ancore stimate'} (${cutout.width}×${cutout.height})`, anchors.auto ? 'ok' : 'warn');
  refreshGenerate();
}

/* =================================================================
   COMPOSITING (motore geometrico)
================================================================= */
function glassesAnchorPair(view) {
  const g = S.glasses[view].anchors;
  return view === 'front' ? [g.lensL, g.lensR] : [g.hinge, g.temple];
}

/* disegna la montatura sul contesto, allineata alle ancore volto */
function drawGlasses(ctx, view) {
  const g = S.glasses[view];
  if (!g) return;
  const [s0, s1] = glassesAnchorPair(view);
  const [d0, d1] = S.result[view].anchors;
  const m = similarity(s0, s1, d0, d1);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.38)';
  ctx.shadowBlur = Math.max(2, ctx.canvas.width * 0.012);
  ctx.shadowOffsetY = ctx.canvas.height * 0.006;
  ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
  ctx.drawImage(g.cutout, 0, 0);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/* render del risultato con wipe prima/dopo (line = frazione 0..1) */
function renderResult(view) {
  const r = S.result[view]; if (!r) return;
  const cv = $(`.gl-res[data-key="${view}"] .gl-res-canvas`);
  const ctx = cv.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.drawImage(r.face, 0, 0);                 // "prima"
  if (r.hd) { ctx.drawImage(r.hd, 0, 0); drawHandles(view); return; }
  const lineX = r.line * cv.width;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, lineX, cv.height); ctx.clip();
  drawGlasses(ctx, view);                       // "dopo" (solo a sinistra della linea)
  ctx.restore();
  drawHandles(view);
}

/* maniglie di rifinitura (ancore volto) sull'overlay */
function drawHandles(view) {
  const r = S.result[view]; if (!r) return;
  const ov = $(`.gl-res[data-key="${view}"] .gl-res-overlay`);
  const ctx = ov.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0, 0, ov.width, ov.height);
  if (r.hd) return;
  for (const p of r.anchors) {
    ctx.beginPath(); ctx.arc(p.x, p.y, ov.width * 0.018, 0, 7);
    ctx.fillStyle = 'rgba(184,150,12,.9)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke();
  }
}

function compositeView(view) {
  const gl = S.glasses[view], fa = S.face[view];
  const card = $(`.gl-res[data-key="${view}"]`);
  if (!gl || !fa) { card.classList.remove('is-ready'); $('.gl-res-ph', card).textContent = 'manca una foto'; return false; }
  const w = fa.canvas.width, h = fa.canvas.height;
  for (const sel of ['.gl-res-canvas', '.gl-res-overlay']) { const c = $(sel, card); c.width = w; c.height = h; }
  S.result[view] = { face: fa.canvas, anchors: fa.anchors.map(p => ({ ...p })), line: 1, ready: true, hd: null };
  card.classList.add('is-ready');
  $('.gl-res-slider', card).value = 100;
  const badge = $('.gl-res-badge', card); badge.hidden = false; badge.textContent = 'geometrico'; badge.classList.remove('is-hd');
  $('.gl-btn-dl', card).disabled = false;
  renderResult(view);
  return true;
}

/* =================================================================
   MISURE  ("le ASA")
================================================================= */
function renderMeasures() {
  const ul = $('#measureList'); ul.innerHTML = '';
  const row = (k, v) => { const li = document.createElement('li'); li.innerHTML = `<span>${k}</span><span>${v}</span>`; ul.appendChild(li); };
  const grp = t => { const li = document.createElement('li'); li.className = 'gl-grp'; li.textContent = t; ul.appendChild(li); };
  let any = false;
  const f = S.face.front;
  if (f && f.measures) {
    any = true; grp('Volto · fronte');
    row('Distanza interpupillare', `${f.measures.ipd.toFixed(0)} px`);
    row('Inclinazione (roll)', `${f.measures.roll.toFixed(1)}°`);
    row('Imbardata (yaw) ~', `${f.measures.yaw.toFixed(0)}°`);
    row('Larghezza volto', `${f.measures.faceW.toFixed(0)} px`);
    const g = S.glasses.front;
    if (g) { const gd = dist(g.anchors.lensL, g.anchors.lensR);
      row('Calibro montatura (lenti)', `${gd.toFixed(0)} px`);
      row('Scala applicata', `${(f.measures.ipd / (gd || 1)).toFixed(2)}×`); }
  }
  for (const v of ['left', 'right']) {
    const r = S.result[v];
    if (r && r.anchors) { any = true; grp(`Asta · ${v === 'left' ? 'lato SX' : 'lato DX'}`);
      const len = dist(r.anchors[0], r.anchors[1]);
      const ang = deg(Math.atan2(r.anchors[1].y - r.anchors[0].y, r.anchors[1].x - r.anchors[0].x));
      row('Lunghezza asta (occhio→orecchio)', `${len.toFixed(0)} px`);
      row('Angolo asta', `${ang.toFixed(1)}°`); }
  }
  if (!any) { const li = document.createElement('li'); li.className = 'gl-empty'; li.textContent = '— in attesa del volto —'; ul.appendChild(li); }
}

/* =================================================================
   FOTOCAMERA GUIDATA (modale riusabile: montatura + viso, stile KYC)
================================================================= */
const CAM_POSES = {
  glasses: [
    { key: 'front', label: 'FRONTE — montatura dritta, di faccia' },
    { key: 'left',  label: 'LATO SX — ruota per mostrare l’asta sinistra' },
    { key: 'right', label: 'LATO DX — ruota per mostrare l’asta destra' },
  ],
  face: [
    { key: 'front', label: 'FRONTE — guarda dritto nell’obiettivo' },
    { key: 'left',  label: 'LATO SX — gira la testa ~30° a sinistra' },
    { key: 'right', label: 'LATO DX — gira la testa ~30° a destra' },
  ],
};
const CAM_TIPS = {
  glasses: ['Sfondo chiaro e uniforme (un foglio bianco è perfetto)',
            'Riempi il riquadro con la montatura, ben centrata',
            'Evita riflessi e ombre sulle lenti',
            'Inquadra dritto, a fuoco, da circa 20–30 cm'],
  face:    ['Buona luce sul viso, niente controluce dietro di te',
            'Tieni il viso dentro l’ovale tratteggiato',
            'Allinea gli occhi alla linea tratteggiata',
            'Niente capelli, cappello o occhiali sugli occhi'],
};
const POSE_SHORT = { front: 'Fronte', left: 'Lato SX', right: 'Lato DX' };
const CAM = { mode: null, pose: 0, stream: null, captured: null };

/* sagome guida (SVG tratteggiato oro) per modalità + posa */
function camGuideSVG(mode, key) {
  const o = 'stroke="#B8960C" fill="none" stroke-width="2.2" stroke-dasharray="7 6" opacity=".9"';
  const sld = 'stroke="#B8960C" fill="none" stroke-width="2.6" opacity=".95"';
  const cap = (y, t) => `<text x="150" y="${y}" text-anchor="middle" fill="#B8960C" font-size="13" font-family="monospace" opacity=".9">${t}</text>`;
  const tag = (x, y, t, a = 'start') => `<text x="${x}" y="${y}" text-anchor="${a}" fill="#B8960C" font-size="11" font-family="monospace" opacity=".85">${t}</text>`;
  let body = '';
  if (mode === 'face') {
    if (key === 'front') {
      body = `<ellipse cx="150" cy="205" rx="92" ry="118" ${o}/>
        <line x1="70" y1="180" x2="230" y2="180" ${o}/>
        <circle cx="120" cy="180" r="6" ${o}/><circle cx="180" cy="180" r="6" ${o}/>
        ${tag(236, 184, '← occhi')}${cap(350, 'centra il viso · occhi sulla linea')}`;
    } else { const s = key === 'left' ? -1 : 1;       // freccia di rotazione curva sopra la testa
      body = `<ellipse cx="${150 + s*16}" cy="205" rx="78" ry="118" ${o}/>
        <line x1="${86 + s*16}" y1="180" x2="${214 + s*16}" y2="180" ${o}/>
        <circle cx="${150 + s*16}" cy="180" r="6" ${o}/>
        <path d="M${150 - s*48} 66 q${s*52} -22 ${s*92} 8" ${sld}/>
        <path d="M${150 + s*44} 74 l${s*16} -3 l${-s*7} 14" ${sld}/>
        ${tag(236, 184, '← linea occhi')}
        ${cap(330, `ruota la testa ${s < 0 ? 'a SINISTRA ⟲' : '⟳ a DESTRA'}`)}
        ${cap(350, 'tieni gli occhi sulla linea tratteggiata')}`;
    }
  } else {
    if (key === 'front') {
      body = `<circle cx="108" cy="205" r="40" ${o}/><circle cx="192" cy="205" r="40" ${o}/>
        <path d="M148 205 q2 -9 4 0" ${o}/>
        <line x1="68" y1="201" x2="40" y2="193" ${o}/><line x1="232" y1="201" x2="260" y2="193" ${o}/>
        ${cap(350, 'montatura dritta, ben centrata')}`;
    } else { const s = key === 'left' ? -1 : 1; const lx = 150 - s*58;
      body = `<ellipse cx="${lx}" cy="205" rx="34" ry="42" ${o}/>
        <line x1="${lx + s*32}" y1="201" x2="${lx + s*150}" y2="184" ${o}/>
        <path d="M${lx + s*150} 184 l${-s*16} -4 m${s*16} 4 l${-s*16} 10" ${sld}/>
        ${tag(lx - 26, 152, 'lente')}
        ${cap(330, `mostra l’asta ${s < 0 ? 'SINISTRA' : 'DESTRA'}`)}
        ${cap(350, 'lente nel cerchio, asta distesa')}`;
    }
  }
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}

async function openCam(mode) {
  CAM.mode = mode; CAM.captured = null;
  CAM.pose = firstMissingPose(mode);
  $('#camModalTitle').textContent = mode === 'glasses' ? 'Fotocamera — montatura' : 'Fotocamera — viso';
  $('#camTips').innerHTML = CAM_TIPS[mode].map(t => `<li>${t}</li>`).join('');
  $('#camModal').hidden = false;
  camRetake(); renderCamPose(); renderCamDots();
  await startCamStream(mode);
}
function firstMissingPose(mode) {
  const store = mode === 'glasses' ? S.glasses : S.face;
  const i = CAM_POSES[mode].findIndex(p => !store[p.key]);
  return i < 0 ? 0 : i;
}
async function startCamStream(mode) {
  stopCamStream();
  const want = { video: { facingMode: mode === 'glasses' ? { ideal: 'environment' } : 'user',
                          width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false };
  try { CAM.stream = await navigator.mediaDevices.getUserMedia(want); }
  catch (e) { try { CAM.stream = await navigator.mediaDevices.getUserMedia({ video: true }); }
              catch (e2) { camError(); return; } }
  const v = $('#camVideo'); v.srcObject = CAM.stream;
  try { await v.play(); } catch (e) {}
  $('#camShoot').disabled = false;
}
function stopCamStream() {
  if (CAM.stream) { CAM.stream.getTracks().forEach(t => t.stop()); CAM.stream = null; }
}
function camError() {
  $('#camPoseLabel').textContent = 'Fotocamera non disponibile — chiudi e carica i file dagli slot.';
  $('#camShoot').disabled = true;
}
function renderCamPose() {
  const p = CAM_POSES[CAM.mode][CAM.pose];
  $('#camPoseLabel').textContent = p.label;
  $('#camFrameGuide').innerHTML = camGuideSVG(CAM.mode, p.key);
  $('#camShoot').textContent = 'Scatta ' + POSE_SHORT[p.key];
}
function renderCamDots() {
  const store = CAM.mode === 'glasses' ? S.glasses : S.face;
  $('#camDots').innerHTML = CAM_POSES[CAM.mode].map((p, i) =>
    `<button class="gl-cam-dot${store[p.key] ? ' is-done' : ''}${i === CAM.pose ? ' is-cur' : ''}" data-i="${i}">${POSE_SHORT[p.key]}</button>`).join('');
}
function camShoot() {
  const v = $('#camVideo'); if (!v.videoWidth) return;
  CAM.captured = toCanvas(v, v.videoWidth, v.videoHeight);   // cattura raw (no mirror → SX/DX reali)
  $('#camPreviewImg').src = CAM.captured.toDataURL('image/jpeg', 0.9);
  $('#camPreview').hidden = false;
  $('#camShoot').hidden = true; $('#camRetake').hidden = false; $('#camUse').hidden = false;
}
function camRetake() {
  CAM.captured = null;
  $('#camPreview').hidden = true;
  $('#camShoot').hidden = false; $('#camRetake').hidden = true; $('#camUse').hidden = true;
}
async function camUse() {
  if (!CAM.captured) return;
  const pose = CAM_POSES[CAM.mode][CAM.pose].key;
  if (CAM.mode === 'glasses') await processGlasses(pose, CAM.captured);
  else await setFaceImage(pose, CAM.captured);
  const store = CAM.mode === 'glasses' ? S.glasses : S.face;
  const list = CAM_POSES[CAM.mode];
  let next = -1;
  for (let k = 1; k <= list.length; k++) { const i = (CAM.pose + k) % list.length; if (!store[list[i].key]) { next = i; break; } }
  camRetake();
  if (next < 0) { closeCam(); log('Tutte le pose acquisite ✓', 'ok'); }
  else { CAM.pose = next; renderCamPose(); renderCamDots(); }
}
function closeCam() { stopCamStream(); $('#camModal').hidden = true; }

/* =================================================================
   INGRESSO FOTO VOLTO  (camera o upload)  → detect + ancore
================================================================= */
async function setFaceImage(view, canvas) {
  const slot = $(`#faceSlots .gl-slot[data-key="${view}"]`);
  slot.classList.add('is-filled');
  $('.gl-slot-img', slot).src = canvas.toDataURL('image/jpeg', 0.9);
  log(`Volto ${view}: rilevo i punti…`, 'dim');
  const det = await detectFace(canvas);
  const anchors = defaultFaceAnchors(view, det, canvas.width, canvas.height);
  S.face[view] = { canvas, det, measures: det ? det.measures : null, anchors, ok: !!det };
  const badge = $('.gl-slot-detect', slot);
  badge.hidden = false; badge.textContent = det ? 'volto ✓' : 'manuale';
  badge.style.color = det ? '' : 'var(--gold)';
  if (!det && view === 'front' && S.landmarkerState === 'error') {
    log('Calibra a mano le pupille sul fronte.', 'warn');
  }
  renderMeasures();
  refreshGenerate();
}

/* =================================================================
   GENERAZIONE
================================================================= */
function refreshGenerate() {
  const ok = S.glasses.front && S.face.front;
  $('#btnGenerate').disabled = !ok;
}
async function generate() {
  const btn = $('#btnGenerate'); btn.classList.add('is-running'); btn.disabled = true;
  log('— Genero il try-on —', 'ok');
  let done = 0;
  for (const v of VIEWS) {
    if (S.glasses[v] && S.face[v]) { if (compositeView(v)) { done++; log(`✓ ${v} composto`, 'ok'); } }
    else log(`· ${v}: salto (manca foto montatura o volto)`, 'dim');
  }
  renderMeasures();
  $('#btnDownloadAll').disabled = done === 0;

  if ($('#hdToggle').checked) {
    const scope = $('#hdScope').value;                 // 'front' | 'all'
    const pass = $('#hdPass').value.trim();
    const targets = (scope === 'all' ? VIEWS : ['front']).filter(v => S.result[v]);
    if (!pass) log('HD: inserisci la password per usare l’AI — resto sul geometrico.', 'warn');
    else { log(`HD generativo (${scope === 'all' ? '3 angoli' : 'solo fronte'}): chiamo il server…`, 'dim');
      for (const v of targets) await generateHD(v, pass); }
  }
  btn.classList.remove('is-running'); btn.disabled = false;
  document.getElementById('step-result').scrollIntoView({ behavior: 'smooth' });
}

/* path generativo HD — gated + protetto da password lato server */
async function generateHD(view, pass) {
  const card = $(`.gl-res[data-key="${view}"]`);
  try {
    const faceData = cappedDataURL(S.face[view].canvas, 896, 'image/jpeg', 0.9);
    const glassesData = cappedDataURL(S.glasses[view].cutout, 896, 'image/png');
    // foto originale della montatura (con sfondo) = ground-truth per colori e texture
    const glassesRef = S.glasses[view].original ? cappedDataURL(S.glasses[view].original, 896, 'image/jpeg', 0.92) : null;
    const res = await fetch('/api/glassatore-hd', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-glassatore-pass': pass || '' },
      body: JSON.stringify({ view, face: faceData, glasses: glassesData, glassesRef }),
    });
    if (res.status === 401) { const j = await res.json().catch(() => ({}));
      log(`HD bloccato (${view}): ${j.message || 'password errata o mancante'} — resto sul geometrico.`, 'err'); return; }
    if (res.status === 501) { const j = await res.json().catch(() => ({}));
      log(`HD non configurato (${view}): ${j.message || 'manca la chiave modello-immagine'} — resto sul geometrico.`, 'warn'); return; }
    if (!res.ok) { log(`HD errore ${res.status} (${view}) — resto sul geometrico.`, 'err'); return; }
    const j = await res.json();
    if (!j.image) { log(`HD: risposta vuota (${view}).`, 'warn'); return; }
    const img = new Image();
    await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = j.image; });
    const out = document.createElement('canvas'); out.width = S.face[view].canvas.width; out.height = S.face[view].canvas.height;
    const oc = out.getContext('2d');                 // cover-fit (preserva proporzioni)
    const sc = Math.max(out.width / img.width, out.height / img.height);
    const dw = img.width * sc, dh = img.height * sc;
    oc.drawImage(img, (out.width - dw) / 2, (out.height - dh) / 2, dw, dh);
    S.result[view].hd = out;
    const badge = $('.gl-res-badge', card); badge.textContent = 'HD AI'; badge.classList.add('is-hd');
    renderResult(view);
    log(`✓ HD ${view} generato`, 'ok');
  } catch (e) { console.error(e); log(`HD eccezione (${view}) — resto sul geometrico.`, 'err'); }
}

/* =================================================================
   DRAG DELLE MANIGLIE  (rifinitura ancore volto)
================================================================= */
function bindOverlayDrag(view) {
  const ov = $(`.gl-res[data-key="${view}"] .gl-res-overlay`);
  let active = -1;
  const toLocal = ev => {
    const rect = ov.getBoundingClientRect();
    return { x: (ev.clientX - rect.left) / rect.width * ov.width, y: (ev.clientY - rect.top) / rect.height * ov.height };
  };
  ov.addEventListener('pointerdown', ev => {
    const r = S.result[view]; if (!r || r.hd) return;
    const p = toLocal(ev); let best = -1, bd = 1e9;
    r.anchors.forEach((a, i) => { const d = dist(a, p); if (d < bd) { bd = d; best = i; } });
    if (bd < ov.width * 0.08) { active = best; ov.classList.add('is-grab'); ov.setPointerCapture(ev.pointerId); }
  });
  ov.addEventListener('pointermove', ev => {
    if (active < 0) return;
    const r = S.result[view]; r.anchors[active] = toLocal(ev);
    renderResult(view); renderMeasures();
  });
  const end = () => { active = -1; ov.classList.remove('is-grab'); };
  ov.addEventListener('pointerup', end);
  ov.addEventListener('pointercancel', end);
}

/* =================================================================
   DOWNLOAD
================================================================= */
function flatten(view) {
  const r = S.result[view]; const src = r.face;
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const ctx = c.getContext('2d'); ctx.drawImage(src, 0, 0);
  if (r.hd) ctx.drawImage(r.hd, 0, 0); else drawGlasses(ctx, view);
  return c;
}
function downloadView(view) {
  const c = flatten(view);
  const a = document.createElement('a');
  a.download = `glassatore-${view}.png`; a.href = c.toDataURL('image/png'); a.click();
}

/* =================================================================
   WIRING
================================================================= */
function bindGlassesSlots() {
  $$('#glassesSlots .gl-slot').forEach(slot => {
    const key = slot.dataset.key, input = $('input', slot);
    input.addEventListener('change', async () => {
      if (!input.files[0]) return;
      const img = await fileToImage(input.files[0]);
      await processGlasses(key, img);            // imposta lui miniatura + is-filled
    });
    ;['dragover','dragleave','drop'].forEach(t => slot.addEventListener(t, e => {
      e.preventDefault();
      if (t === 'dragover') slot.classList.add('is-drag');
      else slot.classList.remove('is-drag');
      if (t === 'drop' && e.dataTransfer.files[0]) { input.files = e.dataTransfer.files; input.dispatchEvent(new Event('change')); }
    }));
  });
}
function bindFaceUpload() {
  $$('#faceSlots .gl-slot').forEach(slot => {
    const key = slot.dataset.key, input = $('input', slot);
    input.addEventListener('change', async () => {
      if (!input.files[0]) return;
      const img = await fileToImage(input.files[0]);
      await setFaceImage(key, toCanvas(img));
    });
  });
}
function bindResults() {
  VIEWS.forEach(v => {
    bindOverlayDrag(v);
    const card = $(`.gl-res[data-key="${v}"]`);
    $('.gl-res-slider', card).addEventListener('input', e => { S.result[v].line = e.target.value / 100; renderResult(v); });
    $('.gl-btn-dl', card).addEventListener('click', () => downloadView(v));
  });
}
function reprocessGlasses() {                  // su cambio tolleranza/scontorno
  $$('#glassesSlots .gl-slot.is-filled').forEach(async slot => {
    const key = slot.dataset.key, src = $('.gl-slot-img', slot).src;
    if (!src) return;
    const img = new Image(); img.onload = () => processGlasses(key, img); img.src = src;
  });
}

function init() {
  bindGlassesSlots();
  bindFaceUpload();
  bindResults();
  // fotocamera guidata (montatura + viso)
  $$('.gl-opencam').forEach(b => b.addEventListener('click', () => openCam(b.dataset.mode)));
  $('#camShoot').addEventListener('click', camShoot);
  $('#camRetake').addEventListener('click', camRetake);
  $('#camUse').addEventListener('click', camUse);
  $('#camClose').addEventListener('click', closeCam);
  $('#camDots').addEventListener('click', e => {
    const b = e.target.closest('.gl-cam-dot'); if (!b) return;
    CAM.pose = +b.dataset.i; camRetake(); renderCamPose(); renderCamDots();
  });
  $('#camModal').addEventListener('click', e => { if (e.target.id === 'camModal') closeCam(); });
  $('#btnGenerate').addEventListener('click', generate);
  $('#btnDownloadAll').addEventListener('click', () => VIEWS.forEach(v => S.result[v] && downloadView(v)));
  $('#btnReset').addEventListener('click', () => location.reload());
  $('#bgTol').addEventListener('input', e => { $('#bgTolVal').textContent = e.target.value; });
  $('#bgTol').addEventListener('change', reprocessGlasses);
  // toggle "PNG già trasparente": azzera+disabilita lo scontorno
  $('#bgTransparent').addEventListener('change', e => {
    const on = e.target.checked;
    $('#bgTol').disabled = on;
    $('#bgTolRow').classList.toggle('is-disabled', on);
    $('#bgTransparentHint').hidden = !on;
    reprocessGlasses();
  });
  // HD: mostra pannello (scope + password), ricorda la password nella sessione
  const hdPass = $('#hdPass');
  hdPass.value = sessionStorage.getItem('gl-hdpass') || '';
  hdPass.addEventListener('input', () => sessionStorage.setItem('gl-hdpass', hdPass.value));
  $('#hdToggle').addEventListener('change', e => {
    $('#hdPanel').hidden = !e.target.checked;
    if (e.target.checked) { log('HD ON — scegli ambito e inserisci la password.', 'dim'); if (!hdPass.value) hdPass.focus(); }
  });
  // tema chiaro/scuro
  $('#themeBtn').addEventListener('click', toggleTheme);

  // precarico il motore volto in background (non blocca la UI)
  getLandmarker();
  log('Glassatore pronto. Carica la montatura e scatta il viso.', 'dim');
}

/* =================================================================
   TEMA (chiaro/scuro) — persistito
================================================================= */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#FFFFFF' : '#000000');
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = cur === 'light' ? 'dark' : 'light';
  applyTheme(next); localStorage.setItem('gl-theme', next);
}
applyTheme(localStorage.getItem('gl-theme') || 'dark');   // prima del paint

document.addEventListener('DOMContentLoaded', init);
