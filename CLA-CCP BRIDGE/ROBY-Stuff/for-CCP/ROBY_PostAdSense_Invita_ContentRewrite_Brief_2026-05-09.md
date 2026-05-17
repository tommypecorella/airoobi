---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Round 8 · /invita content rewrite · hook + value prop + Alpha Brave urgency + preset share message · Skeezu directive "iniziare a invitare gente" · ETA calibrato 30-45 min CCP
date: 2026-05-09
ref: web_fetch ROBY su airoobi.app/invita (loggato, mirror) + Skeezu directive "revisiona e aggiusta i testi così invito un po di gente"
status: BRIEF READY · CCP impl Round 8 atteso · scope content rewrite chirurgico · v4.10.0
---

# Round 8 · /invita Content Rewrite · "Iniziare a invitare gente"

## TL;DR

Skeezu vuole iniziare share del referral link. Content attuale `/invita` è BASIC (link box + counter 0/0 + 4-step "come funziona") — **non motiva a condividere**. Brief rewrite content per:
1. **Hook iniziale** + value prop prominent quantificato (€)
2. **Alpha Brave urgency** (1000 posti, scarcity hook)
3. **Preset share message** WhatsApp/Telegram/X/Email (riduce friction share da 5 click a 1)
4. **Gamification counter** (current "0 Invitati / 0 Confermati" → tier system)
5. **Social proof** ("X Alpha Brave già attivi")

ETA calibrato 30-45 min CCP atomic.

---

## Diagnosis content attuale (web_fetch)

```
### Il tuo link per invitare amici / Your invite link
airoobi.app/signup?ref=...
COPIA / COPY
WhatsApp · Telegram · X · Twitter · Email
0 Invitati / Invited
0 Confermati / Confirmed

### Come funziona / How it works
1. Condividi il tuo link con amici
2. Si registrano su AIROOBI
3. Al primo login l'invito si conferma automaticamente
4. Tu ricevi +5 ROBI e anche il tuo amico riceve +5 ROBI

### Chi hai invitato / People you invited
Email · Status · ROBI guadagnati · Date

### Sei stato invitato da / You were invited by
```

**Cosa NON funziona:**
- ❌ No hook header (h3 "Il tuo link per invitare amici" è descrittivo, non motivazionale)
- ❌ No value prop in € (5+5 ROBI = €11.16 quantificato? Non scritto)
- ❌ No Alpha Brave urgency mention (chi inviti Alpha Brave riceve benefit permanenti unique)
- ❌ Share button senza message preset (utente deve scrivere il proprio = friction high)
- ❌ Counter generic 0/0 senza gamification (no tier, no milestone)
- ❌ No social proof ("X Alpha Brave attivi · 7 spots restanti per amici tuoi")

---

## Content rewrite paste-friendly per CCP

### A · Hero header section (NEW, sopra link box)

```html
<section class="invita-hero">
  <div class="invita-hero-eyebrow">
    <span class="it" lang="it">Alpha Brave Referral</span>
    <span class="en" lang="en">Alpha Brave Referral</span>
  </div>

  <h2 class="invita-hero-title">
    <span class="it" lang="it">Invita un amico, <em>guadagnate insieme</em>.</span>
    <span class="en" lang="en">Invite a friend, <em>earn together</em>.</span>
  </h2>

  <p class="invita-hero-subtitle">
    <span class="it" lang="it">Per ogni amico che si registra e fa il primo login: <strong>tu ricevi +5 ROBI</strong>, lui riceve <strong>+5 ROBI</strong>. È l'unico modo per aumentare i ROBI senza partecipare agli airdrop.</span>
    <span class="en" lang="en">For each friend who signs up and completes first login: <strong>you get +5 ROBI</strong>, they get <strong>+5 ROBI</strong>. It's the only way to grow ROBI without joining airdrops.</span>
  </p>

  <div class="invita-hero-value-pill">
    <span class="invita-hero-value-amount">≈ €11,16</span>
    <span class="invita-hero-value-label">
      <span class="it" lang="it">valore generato per ogni invito confermato</span>
      <span class="en" lang="en">value generated per confirmed invite</span>
    </span>
  </div>
</section>
```

**Note value pill:** 5 ROBI × 2 (tu+amico) = 10 ROBI. ROBI ≈ €1,116 cad (ref valore portafoglio screenshot Skeezu W2 Day 5: 10 ROBI = €22,33 → 1 ROBI ≈ €2,233 → 5 ROBI = €11,16 OPPURE wallet stima diversa). **Verifica valore ROBI corrente prima del deploy** — se valore diverso, aggiorna `≈ €11,16` con valore reale. Default conservativo: "≈ €10".

### B · Alpha Brave scarcity hook (NEW, sotto hero)

```html
<section class="invita-scarcity">
  <div class="invita-scarcity-icon">⚡</div>
  <div class="invita-scarcity-content">
    <strong class="invita-scarcity-title">
      <span class="it" lang="it">Adesso vale doppio.</span>
      <span class="en" lang="en">Right now it's worth double.</span>
    </strong>
    <p class="invita-scarcity-text">
      <span class="it" lang="it">Siamo in fase Alpha Brave — solo 1.000 posti totali. Chi invita ora porta amici nella community fondante con benefit permanenti (Badge Fondatore, NFT Alpha Tier 0, anzianità scoring). Quando i 1.000 posti finiscono, le condizioni cambiano.</span>
      <span class="en" lang="en">We're in Alpha Brave phase — only 1,000 spots total. Who invites now brings friends into the founding community with permanent perks (Founder Badge, NFT Alpha Tier 0, scoring seniority). When the 1,000 spots fill up, conditions change.</span>
    </p>
    <div class="invita-scarcity-counter">
      <span id="alpha-counter-invita">993</span>/1000
      <span class="it" lang="it">Alpha Brave attivi</span>
      <span class="en" lang="en">Alpha Brave active</span>
    </div>
  </div>
</section>
```

**Note counter `#alpha-counter-invita`:** wire RPC `get_user_count_public()` esistente (Round 1 Fase 1 M2/M4). Se non ancora wired su /invita, CCP estende il fetch.

### C · Link box con CTA primaria gold (REPLACE existing)

```html
<section class="invita-link-box">
  <h3 class="invita-link-title">
    <span class="it" lang="it">Il tuo link personale</span>
    <span class="en" lang="en">Your personal link</span>
  </h3>
  <div class="invita-link-row">
    <code class="invita-link-url" id="referral-link-display">airoobi.app/signup?ref=...</code>
    <button class="invita-link-copy-btn" onclick="copyReferralLink(this)">
      <span class="it" lang="it">📋 COPIA</span>
      <span class="en" lang="en">📋 COPY</span>
    </button>
  </div>
</section>
```

### D · Share buttons con preset message (REPLACE existing 4 button)

```html
<section class="invita-share-buttons">
  <h3 class="invita-share-title">
    <span class="it" lang="it">Condividi in 1 click</span>
    <span class="en" lang="en">Share in 1 click</span>
  </h3>
  <div class="invita-share-grid">

    <a href="#" class="invita-share-btn invita-share-whatsapp" onclick="shareReferral('whatsapp', event)">
      <span class="invita-share-icon">💬</span>
      <span class="invita-share-label">WhatsApp</span>
    </a>

    <a href="#" class="invita-share-btn invita-share-telegram" onclick="shareReferral('telegram', event)">
      <span class="invita-share-icon">✈️</span>
      <span class="invita-share-label">Telegram</span>
    </a>

    <a href="#" class="invita-share-btn invita-share-twitter" onclick="shareReferral('twitter', event)">
      <span class="invita-share-icon">𝕏</span>
      <span class="invita-share-label">X / Twitter</span>
    </a>

    <a href="#" class="invita-share-btn invita-share-email" onclick="shareReferral('email', event)">
      <span class="invita-share-icon">✉️</span>
      <span class="invita-share-label">Email</span>
    </a>

  </div>
  <p class="invita-share-hint">
    <span class="it" lang="it">💡 Click apre l'app con messaggio già pronto. Personalizza se vuoi prima di inviare.</span>
    <span class="en" lang="en">💡 Click opens the app with a ready message. Customize if you want before sending.</span>
  </p>
</section>
```

**JS helper for preset share:**

```javascript
async function shareReferral(platform, event) {
  event.preventDefault();
  const link = document.getElementById('referral-link-display').textContent.trim();
  const lang = document.documentElement.dataset.lang || 'it';

  const messages = {
    it: {
      whatsapp: `Ehi, ti consiglio AIROOBI: nuovo marketplace dove ricevi oggetti reali partecipando agli airdrop. Siamo in Alpha Brave (solo 1.000 posti, anche tu prendi 5 ROBI bonus se ti registri). Entra qui: ${link}`,
      telegram: `Su AIROOBI ricevi oggetti reali partecipando agli airdrop su blockchain Kaspa. Adesso siamo in Alpha Brave (1.000 posti, +5 ROBI bonus se ti registri tramite questo link): ${link}`,
      twitter: `Su @airoobi_com ricevi oggetti reali partecipando agli airdrop. Marketplace skill-based su Kaspa. Alpha Brave aperto (1.000 posti). +5 ROBI bonus se ti registri qui: ${link}`,
      email: { subject: 'Ti voglio in AIROOBI · Alpha Brave', body: `Ciao,\n\nti scrivo per consigliarti AIROOBI: il nuovo marketplace su blockchain Kaspa dove ricevi oggetti reali partecipando agli airdrop.\n\nAdesso siamo in fase Alpha Brave — solo 1.000 posti totali. Se ti registri tramite il mio link, prendi +5 ROBI di bonus benvenuto e diventi Alpha Brave (benefit permanenti che chi entra dopo non avrà mai).\n\nLink: ${link}\n\nDammi un colpo se vuoi che ti spiego come funziona.\n\nGrazie!` }
    },
    en: {
      whatsapp: `Hey, I recommend AIROOBI: new marketplace where you get real items by joining airdrops. We're in Alpha Brave (only 1,000 spots, you also get 5 ROBI bonus if you sign up). Join here: ${link}`,
      telegram: `On AIROOBI you get real items by joining airdrops on Kaspa blockchain. We're in Alpha Brave now (1,000 spots, +5 ROBI bonus if you sign up via this link): ${link}`,
      twitter: `On @airoobi_com you get real items by joining airdrops. Skill-based marketplace on Kaspa. Alpha Brave open (1,000 spots). +5 ROBI bonus if you sign up here: ${link}`,
      email: { subject: 'I want you on AIROOBI · Alpha Brave', body: `Hi,\n\nI'm writing to recommend AIROOBI: the new marketplace on Kaspa blockchain where you get real items by joining airdrops.\n\nWe're now in Alpha Brave phase — only 1,000 spots total. If you sign up via my link, you get +5 ROBI welcome bonus and become Alpha Brave (permanent perks that later joiners won't ever have).\n\nLink: ${link}\n\nLet me know if you want me to explain how it works.\n\nThanks!` }
    }
  };

  const msg = messages[lang][platform];

  if (platform === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  } else if (platform === 'telegram') {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(msg)}`, '_blank');
  } else if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`, '_blank');
  } else if (platform === 'email') {
    window.location.href = `mailto:?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
  }
}
```

### E · Counter gamificato (REPLACE existing 0/0)

```html
<section class="invita-stats">
  <h3 class="invita-stats-title">
    <span class="it" lang="it">Il tuo impatto Alpha Brave</span>
    <span class="en" lang="en">Your Alpha Brave impact</span>
  </h3>

  <div class="invita-stats-grid">
    <div class="invita-stat-card">
      <div class="invita-stat-value" id="invitati-count">0</div>
      <div class="invita-stat-label">
        <span class="it" lang="it">Invitati</span>
        <span class="en" lang="en">Invited</span>
      </div>
    </div>

    <div class="invita-stat-card">
      <div class="invita-stat-value" id="confermati-count">0</div>
      <div class="invita-stat-label">
        <span class="it" lang="it">Confermati</span>
        <span class="en" lang="en">Confirmed</span>
      </div>
    </div>

    <div class="invita-stat-card invita-stat-card-tier">
      <div class="invita-stat-tier" id="referral-tier">🥉 Bronze</div>
      <div class="invita-stat-label">
        <span class="it" lang="it">Tier referral</span>
        <span class="en" lang="en">Referral tier</span>
      </div>
    </div>
  </div>

  <!-- Tier ladder -->
  <div class="invita-tier-ladder">
    <div class="invita-tier-step" data-tier="bronze">🥉 Bronze · 1+ confermati</div>
    <div class="invita-tier-step" data-tier="silver">🥈 Silver · 5+ confermati</div>
    <div class="invita-tier-step" data-tier="gold">🥇 Gold · 10+ confermati</div>
    <div class="invita-tier-step" data-tier="platinum">💎 Platinum · 25+ confermati</div>
  </div>
</section>
```

**JS helper tier calculation:**

```javascript
function calculateReferralTier(confirmedCount) {
  if (confirmedCount >= 25) return { tier: 'platinum', label: '💎 Platinum', next: null };
  if (confirmedCount >= 10) return { tier: 'gold', label: '🥇 Gold', next: 25 };
  if (confirmedCount >= 5) return { tier: 'silver', label: '🥈 Silver', next: 10 };
  if (confirmedCount >= 1) return { tier: 'bronze', label: '🥉 Bronze', next: 5 };
  return { tier: 'none', label: '⚪ Nessun tier', next: 1 };
}

function renderReferralTier(confirmedCount) {
  const tierData = calculateReferralTier(confirmedCount);
  document.getElementById('referral-tier').textContent = tierData.label;

  // Highlight active tier in ladder
  document.querySelectorAll('.invita-tier-step').forEach(el => {
    el.classList.toggle('active', el.dataset.tier === tierData.tier);
  });
}
```

**Note tier system:** è gamification soft, no benefit funzionale aggiunto al sistema (no DB schema change). Solo visual + motivazione. Future Round 9+ potrebbe wire benefit reale (es. Bronze = +1 ROBI bonus mensile, Silver = +3 ROBI, etc.) — Skeezu decide se vuole quel layer dopo.

### F · "Come funziona" expanded con Alpha Brave context (REPLACE existing 4-step generic)

```html
<section class="invita-howitworks">
  <h3 class="invita-howitworks-title">
    <span class="it" lang="it">Come funziona</span>
    <span class="en" lang="en">How it works</span>
  </h3>

  <ol class="invita-howitworks-steps">
    <li>
      <strong class="it" lang="it">Condividi il tuo link</strong>
      <strong class="en" lang="en">Share your link</strong>
      <span class="it" lang="it"> · click sui pulsanti share o copia il link e mandalo dove vuoi</span>
      <span class="en" lang="en"> · click the share buttons or copy the link and send it anywhere</span>
    </li>
    <li>
      <strong class="it" lang="it">Il tuo amico si registra</strong>
      <strong class="en" lang="en">Your friend signs up</strong>
      <span class="it" lang="it"> · prima di chiudere i 1.000 posti Alpha Brave</span>
      <span class="en" lang="en"> · before the 1,000 Alpha Brave spots close</span>
    </li>
    <li>
      <strong class="it" lang="it">Al primo login l'invito si conferma</strong>
      <strong class="en" lang="en">Invite confirms at first login</strong>
      <span class="it" lang="it"> · automatico, nessuna azione manuale</span>
      <span class="en" lang="en"> · automatic, no manual action</span>
    </li>
    <li>
      <strong class="it" lang="it">Ricevete entrambi +5 ROBI</strong>
      <strong class="en" lang="en">You both get +5 ROBI</strong>
      <span class="it" lang="it"> · ≈ €11 di valore generato in totale, spalmato tra te e il tuo amico</span>
      <span class="en" lang="en"> · ≈ €11 of value generated total, split between you and your friend</span>
    </li>
  </ol>
</section>
```

---

## CSS spec (extension dapp-v2-g3.css Round 8 section)

```css
/* ROUND 8 · /invita Content Rewrite */

.invita-hero {
  text-align: center;
  padding: 32px 24px 24px;
  background: var(--airoobi-bg-soft, #FAFAF7);
  border-radius: 8px;
  margin-bottom: 24px;
}
.invita-hero-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--airoobi-gold, #B8893D);
  margin-bottom: 12px;
}
.invita-hero-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  color: var(--airoobi-ink, #1B1814);
  margin: 0 0 16px;
  line-height: 1.2;
}
.invita-hero-title em {
  font-style: italic;
  color: var(--airoobi-gold);
  font-weight: 400;
}
.invita-hero-subtitle {
  font-size: 0.95rem;
  color: var(--airoobi-ink-muted, #5A544E);
  max-width: 540px;
  margin: 0 auto 20px;
  line-height: 1.6;
}
.invita-hero-value-pill {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  background: var(--airoobi-gold);
  color: #FFF;
  padding: 12px 24px;
  border-radius: 100px;
  font-family: 'JetBrains Mono', monospace;
}
.invita-hero-value-amount { font-size: 1.25rem; font-weight: 600; }
.invita-hero-value-label { font-size: 0.75rem; opacity: 0.95; }

/* Scarcity hook */
.invita-scarcity {
  display: flex;
  gap: 16px;
  background: rgba(247,54,89,0.06);
  border-left: 4px solid var(--airoobi-coral, #F73659);
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 24px;
}
.invita-scarcity-icon { font-size: 1.5rem; }
.invita-scarcity-title { display: block; color: var(--airoobi-ink); margin-bottom: 4px; }
.invita-scarcity-text { font-size: 0.85rem; color: var(--airoobi-ink-muted); margin: 0 0 8px; line-height: 1.5; }
.invita-scarcity-counter { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--airoobi-coral); font-weight: 600; }

/* Link box */
.invita-link-box {
  background: var(--airoobi-bg, #FFF);
  border: 1px solid var(--airoobi-border, rgba(15,20,23,0.08));
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}
.invita-link-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--airoobi-ink-muted); margin: 0 0 12px; }
.invita-link-row { display: flex; gap: 12px; align-items: center; }
.invita-link-url { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; padding: 10px 12px; background: var(--airoobi-bg-soft); border-radius: 4px; color: var(--airoobi-ink); overflow: hidden; text-overflow: ellipsis; }
.invita-link-copy-btn { background: var(--airoobi-gold); color: #FFF; border: none; padding: 10px 20px; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 4px; cursor: pointer; }
.invita-link-copy-btn:hover { background: #A07930; }

/* Share buttons */
.invita-share-buttons { margin-bottom: 24px; }
.invita-share-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--airoobi-ink-muted); margin: 0 0 12px; }
.invita-share-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
@media (max-width: 480px) { .invita-share-grid { grid-template-columns: repeat(2, 1fr); } }
.invita-share-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px; background: var(--airoobi-bg);
  border: 1px solid var(--airoobi-border); border-radius: 6px;
  text-decoration: none; color: var(--airoobi-ink);
  cursor: pointer; transition: border-color 0.2s, background 0.2s;
}
.invita-share-btn:hover {
  border-color: var(--airoobi-gold);
  background: rgba(184,137,61,0.04);
}
.invita-share-icon { font-size: 1.5rem; }
.invita-share-label { font-size: 0.75rem; font-weight: 500; }
.invita-share-hint { font-size: 0.8rem; color: var(--airoobi-ink-muted); margin-top: 12px; font-style: italic; }

/* Stats gamificato */
.invita-stats { margin-bottom: 24px; }
.invita-stats-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--airoobi-ink-muted); margin: 0 0 12px; }
.invita-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
@media (max-width: 480px) { .invita-stats-grid { grid-template-columns: 1fr; } }
.invita-stat-card { background: var(--airoobi-bg); border: 1px solid var(--airoobi-border); padding: 16px; text-align: center; border-radius: 6px; }
.invita-stat-value { font-family: 'Inter', sans-serif; font-size: 2rem; font-weight: 300; color: var(--airoobi-gold); }
.invita-stat-tier { font-family: 'Inter', sans-serif; font-size: 1.1rem; font-weight: 500; color: var(--airoobi-ink); margin-bottom: 4px; }
.invita-stat-label { font-size: 0.75rem; color: var(--airoobi-ink-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.invita-stat-card-tier .invita-stat-tier { color: var(--airoobi-gold); }

.invita-tier-ladder { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: var(--airoobi-bg-soft); border-radius: 6px; font-size: 0.8rem; }
.invita-tier-step { color: var(--airoobi-ink-muted); padding: 4px 8px; }
.invita-tier-step.active { color: var(--airoobi-ink); font-weight: 600; background: rgba(184,137,61,0.1); border-radius: 4px; }

/* How it works */
.invita-howitworks { margin-bottom: 24px; }
.invita-howitworks-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--airoobi-ink-muted); margin: 0 0 12px; }
.invita-howitworks-steps { padding-left: 24px; }
.invita-howitworks-steps li { margin-bottom: 12px; font-size: 0.9rem; color: var(--airoobi-ink); line-height: 1.5; }
.invita-howitworks-steps strong { color: var(--airoobi-ink); display: block; }
```

---

## Acceptance criteria post-impl

Smoke verify post-deploy v4.10.0:

1. ✅ Hero header "Invita un amico, guadagnate insieme" + value pill "≈ €11,16 valore generato"
2. ✅ Scarcity hook Alpha Brave 993/1000 + coral border-left
3. ✅ Link box con CTA copy gold prominent
4. ✅ 4 share buttons con preset message (WhatsApp/Telegram/X/Email) — click apre app/window con messaggio già composto
5. ✅ Counter gamificato 3 cards (Invitati / Confermati / Tier) + tier ladder visualizzata
6. ✅ Tier rendering corretto in base a confirmedCount (Bronze 1+ / Silver 5+ / Gold 10+ / Platinum 25+)
7. ✅ "Come funziona" 4-step rifrasato con Alpha Brave context + value €11
8. ✅ Bilingue inline IT+EN preservato
9. ✅ Brand v2.2 coerent (Inter + Renaissance gold + ink + bg light)
10. ✅ Mobile responsive <480px (share grid 2-col, stats grid 1-col)

---

## Decisioni residue minor (defaults applicati)

1. **Valore ROBI in € pill** — default `≈ €11,16` (basato su screenshot Skeezu portafoglio W2 Day 5: 10 ROBI = €22,33). Se valore reale corrente diverso, CCP aggiorna in pill + step 4 "Come funziona" prima di deploy. Conservative fallback: `≈ €10`.

2. **Counter Alpha Brave** — CCP riusa `get_user_count_public()` RPC esistente (Round 1 wire). Se non ancora wired su /invita section, extend fetch.

3. **Tier system** — implementato come gamification soft (visual-only, no DB schema change, no benefit funzionale). Future Round 9+ può wire benefit reale se Skeezu vuole.

4. **Preset share message tone** — IT+EN paste-friendly nel JS. Skeezu può modificare il tone (più informale/formale/divertente) post-deploy se preferisce. Default mio: balanced peer-to-peer, mention Alpha Brave urgency + +5 ROBI value.

---

## ETA stima calibrata

| Phase | ETA |
|---|---|
| CCP recon /invita section in dapp.html template | 5 min |
| HTML structure replace (hero + scarcity + link + share + stats + howitworks) | 10-15 min |
| CSS extension Round 8 section (~80 lines) | 5-10 min |
| JS helpers (shareReferral + calculateReferralTier + renderReferralTier) | 10 min |
| Counter Alpha Brave wire (riuso RPC) | 5 min |
| Version bump 4.9.0 → 4.10.0 + commit + push | 3 min |
| Smoke local + audit-trail | 5 min |
| **TOTAL nominale** | **~45 min** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~20-30 min CCP**.

---

## Pattern operativi

- NO sed cascade · Edit chirurgici + grep verify
- Bilingue inline IT+EN preservato 100%
- Brand v2.2 + Voice Principle 04 STRICT (no gambling lex)
- Audit-trail immediate post-commit
- Mobile responsive
- Counter Alpha Brave riuso RPC esistente

---

## Closing

Brief Round 8 paste-friendly per content rewrite /invita. Skeezu directive "iniziare a invitare gente" → content motivazionale + Alpha Brave urgency hook + preset share message friction-low + gamification tier soft.

Trasforma /invita da "link box generico" a "referral page conversion-driven".

Daje Round 8.

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (Round 8 brief content rewrite /invita · hook + value prop quantificato + Alpha Brave urgency + preset share message + gamification tier · ETA calibrato 20-30 min CCP · Skeezu directive "iniziare a invitare gente")*
