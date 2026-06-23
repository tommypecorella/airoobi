# Glassatore — prototipo motore try-on occhiali multi-angolo

> AIROOBI Lab · prototipo · `alfa-2026.06.24-1.3.0`
> Live: `https://www.airoobi.app/glassatore` · **noindex** (sperimentale)

Configuratore che ti fa **indossare un paio di occhiali prima di averli**, da 3 angoli.
Da un lato carichi **3 foto della montatura** (fronte, lato SX, lato DX); dall'altro scatti
**3 foto del viso** agli stessi angoli. Il motore allinea lenti e **aste** sul volto e produce
i 3 render del try-on.

Il focus del prototipo è **il motore**, non la UI.

---

## Perché esiste (sintesi competition)

Il mercato del virtual try-on occhiali è maturo ma si divide in due famiglie:

| Famiglia | Come funziona | Esempi | Limite |
|---|---|---|---|
| **Live AR** | camera realtime + **modello 3D** della montatura | Fittingbox, Banuba, Jeeliz, Lenskart, Warby Parker | serve un 3D per ogni montatura → friction altissima per un marketplace UGC |
| **Generativo** | foto montatura + foto viso → composito | Photta, Zenni "upload", BasedLabs | quasi tutti fanno **un solo frontale** |

**Spazio bianco presidiato qui:** flusso **foto→foto** (niente 3D da modellare) **+ multi-angolo**
(fronte/SX/DX) su input *e* output. È il modo in cui valuti davvero come ti stanno gli occhiali,
ed è perfetto per un "Zalando degli occhiali" alimentato dagli utenti.

---

## Architettura del motore (ibrido)

### 1. Motore geometrico — default, 100% client-side, gratis
Nessuna immagine lascia il dispositivo.

```
foto montatura ──► segmentazione CV ──► ancore montatura ─┐
                   (scontorno + lenti)                     ├─► allineamento ──► render
foto viso ────────► Face Landmarker ──► ancore volto ──────┘   (similarità 2pt)
                    (MediaPipe) + misure "ASA"
```

**a) Rilevamento volto** — [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe)
(Tasks Vision, WASM+GPU, caricato da CDN). 478 landmark con iris → pupille, ponte naso,
contorni guancia. Da qui le **misure ("le ASA")**: distanza interpupillare (IPD), inclinazione
(roll), imbardata (yaw), larghezza volto.
Se il modello non carica (offline) o non rileva → **fallback manuale**: ancore di default
trascinabili a mano.

**b) Segmentazione montatura** (`segmentFrame`, computer vision pura su canvas):
1. un pixel è "vuoto" se ha colore≈sfondo (scontorno attivo) o alpha≈0 (PNG trasparente);
2. **flood-fill dai bordi** sui vuoti = sfondo vero → reso trasparente;
3. i **vuoti racchiusi** dalla montatura = **lenti** → resi trasparenti (see-through) e i 2
   più grandi danno i **centri-lente** (ancore fronte).
   Occhiali da sole (lenti opache) → niente buchi → fallback bbox.
   Sui profili distinguo **lente** (banda più alta) da **terminale asta** per orientare l'asta.

**c) Allineamento a similarità (2 punti)** — `similarity(s0,s1,d0,d1)` calcola
rotazione+scala+traslazione che mappa **esatti**:
- **Fronte:** centri-lente → pupille (scala = IPD / calibro montatura);
- **Profili SX/DX:** (cardine → terminale asta) → (occhio → orecchio) = **determinazione delle aste**,
  la parte difficile del multi-angolo.

Il render aggiunge ombra di contatto e supporta **rifinitura drag** (trascini le 2 maniglie =
ancore volto) e **wipe prima/dopo**.

### 2. Motore generativo "HD" — opzionale, gated
Toggle **HD realistico** → `POST /api/glassatore-hd` con foto viso + montatura.
Provider: **Google Gemini 2.5 Flash Image ("nano-banana")** — editing multi-reference:
prende gli occhiali dalla 2ª immagine e li indossa sul viso della 1ª, mantenendo posa/luce/identità.
Fotorealistico ma richiede una **chiave modello-immagine** lato server.
Se la chiave manca → `501` pulito e il front-end **resta sul geometrico** senza errori.

**Protezione budget (password):** l'endpoint è pubblico, quindi è protetto da password lato server.
Richiede l'header `x-glassatore-pass` uguale a env `GLASSATORE_HD_PASSWORD`. Se la password non è
configurata → `401` (HD bloccato, fail-safe: nessuno può consumare credito). Nel front-end la password
si inserisce nel pannello HD (memorizzata solo nella sessione del browser).

**Ambito (per risparmiare):** opzione "Solo fronte" (default) o "Tutti e 3 gli angoli" — di default genera
una sola immagine HD (fronte) per non spendere su 3 angoli durante i test.

Env: `GLASSATORE_IMAGE_API_KEY` (chiave Google AI Studio) · opzionali `GEMINI_API_KEY`/`GOOGLE_API_KEY`,
`GLASSATORE_IMAGE_MODEL` (modello), `GLASSATORE_HD_PASSWORD` (password HD, **obbligatoria** per usare l'HD).

---

## File

| File | Ruolo |
|---|---|
| `index.html` | UI stepper (Occhiali → Viso → Motore → Risultato) |
| `style.css` | design system AIROOBI (black/gold/white, dark) |
| `app.js` | **il motore** (segmentazione, landmark, allineamento, render, drag, HD) |
| `../api/glassatore-hd.js` | path generativo HD (gated) |

## Limiti noti (è un prototipo)
- I **profili** richiedono ~30° di rotazione (non profilo pieno): MediaPipe è tarato su volti quasi
  frontali. Auto-init best-effort + **drag** per rifinire.
- Auto-detect lenti ottimale su **foto pulite** (sfondo chiaro uniforme, frame ben visibile).
- Il motore geometrico è un **overlay accurato**, non una re-illuminazione: per il fotorealismo serve l'HD.

## Verifica
Smoke-test headless (Chromium) della pipeline geometrica end-to-end: segmentazione → auto-detect
lenti → compositing su volto sintetico. Verifica matematica della trasformata di similarità
(le ancore mappano al pixel).
