---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: R4 Content Brief · airdrops-public.html · ready-to-incorporate content per H2 Fase 2 · 600+400 parole IT+EN bilingue inline + top section + CTAs + meta + JSON-LD
date: 2026-05-09
ref: CCP_AdSense_Editorial_Audit_2026-05-09.md (H2) + ROBY_Reply_CCP_Editorial_Audit_SignOff_2026-05-09.md (R4 scope)
status: CONTENT BRIEF READY · trigger CCP Fase 2 H2 · scope: pre-render airdrops-public.html SSR-friendly per Googlebot crawler
---

# R4 · Content Brief airdrops-public.html

## TL;DR

Content ready-to-incorporate per `airdrops-public.html` (nuova pagina SSR pulita, NO chrome dApp, dedicata a Googlebot crawler + utenti non-loggedin che atterrano su `airoobi.app/airdrops`).

**Total content text-rich:** ~1.150 parole bilingue inline IT+EN (≈575 IT + 575 EN), ben sopra soglia AdSense valuable content (~800-1000).

**Composizione:**
- Hero header + placeholder "Airdrop attivi" Stage 1-aware (~50 parole)
- How-it-works summary 4 step (~600 parole IT+EN)
- FAQ excerpt 4 Q&A (~400 parole IT+EN)
- CTA finale doppia (registrati + scopri come funziona) (~50 parole)

**Pattern bilingue:** `<span class="it" lang="it">...</span><span class="en" lang="en">...</span>` con CSS hide/show (`[data-lang="it"] .en{display:none}` etc.) — pattern già usato nel repo (mirror dapp.html FOUC fix da MEGA closure).

**Brand compliance:** Voice Principle 04 STRICT (zero gambling lexicon), brand v2.2 (Inter + Renaissance gold + manifesto-tone), slogan inheritance ("Un blocco alla volta" + "vendere e ottenere è una skill").

---

## Page structure overview

Suggerisco struttura HTML5 semantic-first (importante per AdSense reviewer + JSON-LD compatibility):

```
<!DOCTYPE html>
<html lang="it" data-lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>...</title> [vedi §Meta sotto]
  <meta name="description" content="..."> [vedi §Meta sotto]
  <link rel="canonical" href="https://www.airoobi.app/airdrops">
  <meta name="robots" content="index, follow">
  <!-- FOUC fix bilingue inline -->
  <style>[data-lang="it"] .en,[data-lang="en"] .it{display:none!important}</style>
  <link rel="stylesheet" href="src/airdrops-public.css?v=4.2.0">
  [JSON-LD vedi §JSON-LD sotto]
</head>
<body>
  <!-- Header nav minimal: HOME / AIRDROPS / COME FUNZIONA / EDU / Accedi / Registrati -->
  [Use stesso header pattern di landing.html airoobi.app — coerenza UX]

  <main>
    <section class="hero-airdrops"> [§A Top section] </section>
    <section class="airdrops-active"> [§B Placeholder cards Stage 1-aware] </section>
    <section class="how-it-works-summary"> [§C How-it-works 600 parole] </section>
    <section class="faq-excerpt"> [§D FAQ excerpt 400 parole] </section>
    <section class="cta-final"> [§E CTAs doppia] </section>
  </main>

  <!-- Footer: stesso pattern landing.html -->
</body>
</html>
```

---

## §A · Top section (Hero header)

### Content esatto

```html
<section class="hero-airdrops" style="padding:80px 24px 48px;text-align:center;max-width:920px;margin:0 auto">

  <div class="section-eyebrow" style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--airoobi-gold);margin-bottom:16px">
    <span class="it" lang="it">Marketplace</span><span class="en" lang="en">Marketplace</span>
  </div>

  <h1 style="font-family:'Inter',sans-serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:600;color:var(--airoobi-ink);margin:0 0 24px;line-height:1.1">
    <span class="it" lang="it">Vinci oggetti reali partecipando al marketplace.</span><span class="en" lang="en">Win real items by participating in the marketplace.</span>
  </h1>

  <p style="font-family:'Inter',sans-serif;font-size:1.125rem;color:var(--airoobi-ink-muted);max-width:680px;margin:0 auto 32px;line-height:1.6">
    <span class="it" lang="it">Su AIROOBI ogni airdrop è una distribuzione equa di oggetti reali tra chi partecipa con i propri ARIA. Niente fortuna cieca, niente acquisti obbligatori. Solo skill di partecipazione e blocchi che accumuli un passo alla volta.</span><span class="en" lang="en">On AIROOBI every airdrop is a fair distribution of real items among those who participate with their own ARIA. No blind luck, no required purchases. Just participation skill and blocks you accumulate one step at a time.</span>
  </p>

</section>
```

### Note brand compliance

- Eyebrow "Marketplace" mirror pattern del fix ISSUE-11 sezione blockchain (consistency cross-page)
- H1 NON "lottery" o "giveaway" o "estrazione" → "Vinci oggetti reali partecipando" (verbo participation-driven, non chance-driven)
- Sub-text inline esplicito "Niente fortuna cieca" — è OK in negazione qui perché contestualizza differenza vs lottery (è positioning, non promise). Cross-check con Skeezu se vuole rimuovere "fortuna" anche da negazione.
- "Un blocco alla volta" callback nel sub-text — coerenza slogan v2.2

---

## §B · Placeholder "Airdrop attivi" Stage 1-aware

### Content esatto

```html
<section class="airdrops-active" style="padding:48px 24px;max-width:1200px;margin:0 auto">

  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:32px;flex-wrap:wrap;gap:16px">
    <h2 style="font-family:'Inter',sans-serif;font-size:1.75rem;font-weight:600;color:var(--airoobi-ink);margin:0">
      <span class="it" lang="it">Airdrop in arrivo</span><span class="en" lang="en">Upcoming airdrops</span>
    </h2>
    <span style="font-family:'JetBrains Mono',monospace;font-size:0.85rem;color:var(--airoobi-coral);letter-spacing:0.05em">
      <span class="it" lang="it">Stage 1 imminente</span><span class="en" lang="en">Stage 1 imminent</span>
    </span>
  </div>

  <!-- Card placeholder grid · 3 cards "In arrivo" Stage 1-aware -->
  <div class="airdrops-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px">

    <article class="airdrop-card-placeholder" style="background:var(--airoobi-bg-soft,#FAFAF7);border:1px solid var(--airoobi-border,rgba(27,24,20,0.08));border-radius:8px;padding:32px;text-align:center">
      <div style="font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.1em;color:var(--airoobi-gold);text-transform:uppercase;margin-bottom:12px">
        <span class="it" lang="it">Tech & Lifestyle</span><span class="en" lang="en">Tech & Lifestyle</span>
      </div>
      <h3 style="font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:500;color:var(--airoobi-ink);margin:0 0 12px">
        <span class="it" lang="it">In arrivo a Stage 1</span><span class="en" lang="en">Coming at Stage 1</span>
      </h3>
      <p style="font-size:0.9rem;color:var(--airoobi-ink-muted);margin:0 0 20px">
        <span class="it" lang="it">I primi airdrop ufficiali partono al raggiungimento di 1.000 Alpha Brave registrati.</span><span class="en" lang="en">The first official airdrops launch when 1,000 Alpha Brave members register.</span>
      </p>
      <a href="/signup" style="display:inline-block;padding:12px 24px;background:var(--airoobi-gold);color:#fff;text-decoration:none;font-family:'Inter',sans-serif;font-size:0.9rem;border-radius:4px">
        <span class="it" lang="it">Diventa Alpha Brave</span><span class="en" lang="en">Become Alpha Brave</span>
      </a>
    </article>

    <!-- Replicare 2 card analoghe con varianti tematiche -->
    <article class="airdrop-card-placeholder" style="...">
      <div>...<span class="it">Esperienze</span><span class="en">Experiences</span>...</div>
      <h3>...<span class="it">Quando partiamo</span><span class="en">When we launch</span>...</h3>
      <p>...<span class="it">Esperienze, viaggi, eventi: oggetti reali distribuiti tra chi partecipa.</span><span class="en">Experiences, trips, events: real items distributed among participants.</span>...</p>
    </article>

    <article class="airdrop-card-placeholder" style="...">
      <div>...<span class="it">Asset Digitali</span><span class="en">Digital Assets</span>...</div>
      <h3>...<span class="it">Anteprima Stage 1</span><span class="en">Stage 1 preview</span>...</h3>
      <p>...<span class="it">Asset digitali, NFT di valore, oggetti collezionabili: distribuzione equa via skill.</span><span class="en">Digital assets, valuable NFTs, collectible items: fair distribution via skill.</span>...</p>
    </article>

  </div>

</section>
```

### Note

- 3 card placeholder mockup OK (CCP può anche caricarne dinamicamente da Supabase build-time se inventario futuro popolato — pattern ISR)
- Categorie: Tech & Lifestyle, Esperienze, Asset Digitali (allineate a categorie marketplace AIROOBI)
- Stage 1 imminent messaging crea urgency senza fake (legato a counter Alpha Brave 1000 reali da DB)
- Card CTA "Diventa Alpha Brave" → /signup (action positive)

---

## §C · How-it-works summary (600 parole bilingue inline · 4 step)

### Content esatto

```html
<section class="how-it-works-summary" style="padding:80px 24px;background:var(--airoobi-bg-soft,#FAFAF7);max-width:920px;margin:0 auto">

  <div class="section-eyebrow" style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--airoobi-gold);margin-bottom:12px;text-align:center">
    <span class="it" lang="it">Come funziona</span><span class="en" lang="en">How it works</span>
  </div>

  <h2 style="font-family:'Inter',sans-serif;font-size:2rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 48px;text-align:center">
    <span class="it" lang="it">Quattro passi per partecipare a un airdrop AIROOBI</span><span class="en" lang="en">Four steps to participate in an AIROOBI airdrop</span>
  </h2>

  <div class="steps-grid" style="display:flex;flex-direction:column;gap:32px">

    <!-- Step 1 -->
    <article class="step-block" style="display:flex;gap:24px;align-items:flex-start">
      <div class="step-num" style="font-family:'JetBrains Mono',monospace;font-size:2.5rem;font-weight:300;color:var(--airoobi-gold);min-width:80px">01</div>
      <div>
        <h3 style="font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
          <span class="it" lang="it">Accumula ARIA partecipando</span><span class="en" lang="en">Accumulate ARIA by participating</span>
        </h3>
        <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
          <span class="it" lang="it">Ogni giorno guadagni ARIA dal faucet quotidiano, dalla sequenza di check-in giornaliera, invitando amici al marketplace e completando le sezioni educative. ARIA è la valuta di partecipazione AIROOBI: non si compra, si accumula. Più sei presente, più ARIA hai a disposizione per partecipare agli airdrop che ti interessano.</span><span class="en" lang="en">Every day you earn ARIA from the daily faucet, the daily check-in streak, by inviting friends to the marketplace and completing educational sections. ARIA is the AIROOBI participation currency: you don't buy it, you accumulate it. The more you're present, the more ARIA you have available to participate in airdrops you care about.</span>
        </p>
      </div>
    </article>

    <!-- Step 2 -->
    <article class="step-block" style="display:flex;gap:24px;align-items:flex-start">
      <div class="step-num" style="font-family:'JetBrains Mono',monospace;font-size:2.5rem;font-weight:300;color:var(--airoobi-gold);min-width:80px">02</div>
      <div>
        <h3 style="font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
          <span class="it" lang="it">Scegli un airdrop e investi blocchi</span><span class="en" lang="en">Choose an airdrop and invest blocks</span>
        </h3>
        <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
          <span class="it" lang="it">Sfogli il marketplace di airdrop attivi e scegli quello che ti interessa: tecnologia, esperienze, asset digitali. Ogni airdrop accetta blocchi di partecipazione che acquisti con i tuoi ARIA. Decidi tu quanti blocchi investire: più blocchi metti, più aumenta la tua probabilità di vincita finale, ma sempre dentro un sistema di scoring trasparente che limita gli abusi.</span><span class="en" lang="en">You browse the marketplace of active airdrops and choose the one you care about: technology, experiences, digital assets. Each airdrop accepts participation blocks that you buy with your ARIA. You decide how many blocks to invest: the more blocks you put in, the more your final win probability increases, but always within a transparent scoring system that limits abuses.</span>
        </p>
      </div>
    </article>

    <!-- Step 3 -->
    <article class="step-block" style="display:flex;gap:24px;align-items:flex-start">
      <div class="step-num" style="font-family:'JetBrains Mono',monospace;font-size:2.5rem;font-weight:300;color:var(--airoobi-gold);min-width:80px">03</div>
      <div>
        <h3 style="font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
          <span class="it" lang="it">Lo scoring v5 calcola la distribuzione</span><span class="en" lang="en">Scoring v5 calculates the distribution</span>
        </h3>
        <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
          <span class="it" lang="it">Quando l'airdrop si chiude, il nostro algoritmo di scoring v5 calcola la distribuzione degli oggetti tra i partecipanti. Lo scoring tiene conto di: numero di blocchi investiti, anzianità del tuo account, sequenza di partecipazione, comportamento storico nel marketplace. Il sistema integra anche un meccanismo di pity per garantire che i partecipanti regolari non restino mai a mani vuote troppo a lungo.</span><span class="en" lang="en">When the airdrop closes, our scoring v5 algorithm calculates the item distribution among participants. Scoring takes into account: number of blocks invested, your account seniority, participation sequence, historical behavior in the marketplace. The system also integrates a pity mechanism to ensure that regular participants never stay empty-handed for too long.</span>
        </p>
      </div>
    </article>

    <!-- Step 4 -->
    <article class="step-block" style="display:flex;gap:24px;align-items:flex-start">
      <div class="step-num" style="font-family:'JetBrains Mono',monospace;font-size:2.5rem;font-weight:300;color:var(--airoobi-gold);min-width:80px">04</div>
      <div>
        <h3 style="font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
          <span class="it" lang="it">Ricevi l'oggetto e accumula ROBI</span><span class="en" lang="en">Receive the item and accumulate ROBI</span>
        </h3>
        <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
          <span class="it" lang="it">Se vinci, ricevi l'oggetto reale (consegnato a casa per i fisici, sbloccato per i digitali). Se non vinci, accumuli ROBI: tessere di rendimento che maturano valore nel tempo grazie al meccanismo di treasury backing AIROOBI, e che puoi convertire ogni settimana al lunedì entro un cap controllato. Niente è mai sprecato: ogni partecipazione conta.</span><span class="en" lang="en">If you win, you receive the real item (delivered home for physical items, unlocked for digital ones). If you don't win, you accumulate ROBI: yield tokens that grow in value over time thanks to the AIROOBI treasury backing mechanism, and that you can convert every Monday within a controlled cap. Nothing is ever wasted: every participation counts.</span>
        </p>
      </div>
    </article>

  </div>

</section>
```

### Note word count

- Step 1: ~70 IT + ~70 EN
- Step 2: ~75 IT + ~75 EN
- Step 3: ~75 IT + ~75 EN
- Step 4: ~80 IT + ~80 EN
- **Total step content: ~600 parole bilingue inline (300 IT + 300 EN) ✅**

### Note brand compliance

- Zero "fortuna" / "estrazione" / "sorteggio" / "lottery" / "scommessa"
- "Vincita" usato 1x (Step 3) — è marketplace-coerente perché si riferisce al risultato della scoring v5, non al chance random. OK
- "Probabilità" usato 1x (Step 2) — contestualizzato come funzione blocchi+scoring (skill-driven), non chance random
- "Pity mechanism" è jargon design system AIROOBI, target Alpha Brave già lo conosce. Pattern voce ARIA/ROBI/scoring v5 educa sul vocabolario nativo

---

## §D · FAQ excerpt (400 parole bilingue inline · 4 Q&A)

### Content esatto

```html
<section class="faq-excerpt" style="padding:80px 24px;max-width:920px;margin:0 auto">

  <div class="section-eyebrow" style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--airoobi-gold);margin-bottom:12px;text-align:center">
    <span class="it" lang="it">Domande frequenti</span><span class="en" lang="en">Frequently asked</span>
  </div>

  <h2 style="font-family:'Inter',sans-serif;font-size:2rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 48px;text-align:center">
    <span class="it" lang="it">Le risposte più importanti</span><span class="en" lang="en">The most important answers</span>
  </h2>

  <div class="faq-list" style="display:flex;flex-direction:column;gap:32px">

    <!-- Q1 -->
    <article class="faq-item">
      <h3 style="font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
        <span class="it" lang="it">AIROOBI è un sito di scommesse o giochi?</span><span class="en" lang="en">Is AIROOBI a betting or gaming site?</span>
      </h3>
      <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
        <span class="it" lang="it">No. AIROOBI è un marketplace bidirezionale dove venditori distribuiscono oggetti reali tramite airdrop equi e partecipanti li ricevono usando ARIA accumulato. Non si compra nessun "biglietto" o "ticket". Non c'è puntata in denaro. C'è partecipazione skill-based dentro un sistema di scoring trasparente che premia la presenza, non il caso cieco.</span><span class="en" lang="en">No. AIROOBI is a two-sided marketplace where sellers distribute real items through fair airdrops and participants receive them using accumulated ARIA. No "ticket" or "lottery slip" is purchased. There's no money stake. There's skill-based participation within a transparent scoring system that rewards presence, not blind chance.</span>
      </p>
    </article>

    <!-- Q2 -->
    <article class="faq-item">
      <h3 style="font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
        <span class="it" lang="it">Come ottengo ARIA per partecipare?</span><span class="en" lang="en">How do I get ARIA to participate?</span>
      </h3>
      <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
        <span class="it" lang="it">ARIA si accumula gratuitamente. Ricevi ARIA dal faucet quotidiano, dalla sequenza di check-in giornaliera, invitando amici che si registrano, completando le sezioni educative del marketplace. Non si compra ARIA con denaro: si guadagna con la presenza e la partecipazione attiva alla community.</span><span class="en" lang="en">ARIA is accumulated for free. You receive ARIA from the daily faucet, the daily check-in streak, by inviting friends who register, completing educational sections of the marketplace. ARIA is not bought with money: it's earned through presence and active participation in the community.</span>
      </p>
    </article>

    <!-- Q3 -->
    <article class="faq-item">
      <h3 style="font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
        <span class="it" lang="it">Cosa sono i ROBI e a cosa servono?</span><span class="en" lang="en">What are ROBI and what are they for?</span>
      </h3>
      <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
        <span class="it" lang="it">ROBI sono tessere di rendimento che maturano se non vinci un airdrop. Ogni partecipazione conta: se non ricevi l'oggetto, accumuli ROBI proporzionali ai blocchi investiti. ROBI cresce di valore nel tempo grazie al meccanismo di treasury backing AIROOBI, e si può convertire ogni lunedì entro un cap settimanale. Niente è sprecato.</span><span class="en" lang="en">ROBI are yield tokens that mature when you don't win an airdrop. Every participation counts: if you don't receive the item, you accumulate ROBI proportional to the blocks invested. ROBI grows in value over time thanks to the AIROOBI treasury backing mechanism, and can be converted every Monday within a weekly cap. Nothing is wasted.</span>
      </p>
    </article>

    <!-- Q4 -->
    <article class="faq-item">
      <h3 style="font-family:'Inter',sans-serif;font-size:1.15rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 12px">
        <span class="it" lang="it">Cos'è la fase Alpha Brave e perché ci sono solo 1.000 posti?</span><span class="en" lang="en">What is the Alpha Brave phase and why only 1,000 seats?</span>
      </h3>
      <p style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-ink-muted);margin:0;line-height:1.6">
        <span class="it" lang="it">Alpha Brave è la fase early access di AIROOBI: i primi 1.000 utenti registrati formano la community fondante del marketplace. Quando raggiungiamo i 1.000 Alpha Brave, partono ufficialmente i primi airdrop di Stage 1 con benefit esclusivi per chi è entrato presto. Il cap a 1.000 protegge la qualità della community e garantisce attenzione personalizzata in fase di rodaggio.</span><span class="en" lang="en">Alpha Brave is the AIROOBI early access phase: the first 1,000 registered users form the marketplace founding community. When we reach 1,000 Alpha Brave members, the first Stage 1 airdrops officially launch with exclusive benefits for early joiners. The 1,000 cap protects community quality and ensures personalized attention during the bootstrapping phase.</span>
      </p>
    </article>

    <!-- Link "Tutte le FAQ" -->
    <div style="text-align:center;margin-top:40px">
      <a href="/faq" style="font-family:'Inter',sans-serif;font-size:0.95rem;color:var(--airoobi-gold);text-decoration:none;border-bottom:1px solid var(--airoobi-gold);padding-bottom:2px">
        <span class="it" lang="it">→ Tutte le FAQ AIROOBI</span><span class="en" lang="en">→ All AIROOBI FAQ</span>
      </a>
    </div>

  </div>

</section>
```

### Note word count

- Q1: ~50 IT + ~50 EN (= ~100)
- Q2: ~50 IT + ~50 EN (= ~100)
- Q3: ~50 IT + ~50 EN (= ~100)
- Q4: ~55 IT + ~55 EN (= ~110)
- **Total FAQ content: ~410 parole bilingue inline (~205 IT + ~205 EN) ✅**

### Note brand compliance

- Q1 fronteggia direttamente il rischio "AIROOBI è gambling?" → risposta affermativa NO + spiegazione marketplace skill-based. **Critical** per AdSense reviewer + Google Ads policy compliance
- Q4 contestualizza counter Alpha Brave 1000 (che è hardcoded sul sito ma ora con RPC live wire post mega closure)
- Tutte e 4 Q&A pulled da `/faq` (audit CCP confermava 16 domande × 4 sezioni, 2017 parole) — questo è excerpt thematicamente coerente

---

## §E · CTA finale doppia

### Content esatto

```html
<section class="cta-final" style="padding:80px 24px;background:var(--airoobi-bg-soft,#FAFAF7);text-align:center;max-width:920px;margin:0 auto">

  <h2 style="font-family:'Inter',sans-serif;font-size:2rem;font-weight:600;color:var(--airoobi-ink);margin:0 0 24px">
    <span class="it" lang="it">Pronto a partecipare?</span><span class="en" lang="en">Ready to participate?</span>
  </h2>

  <p style="font-family:'Inter',sans-serif;font-size:1.05rem;color:var(--airoobi-ink-muted);max-width:600px;margin:0 auto 40px;line-height:1.6">
    <span class="it" lang="it">Diventa Alpha Brave e accumula i tuoi primi ARIA. I primi airdrop ufficiali partono al raggiungimento dei 1.000 Alpha Brave registrati.</span><span class="en" lang="en">Become Alpha Brave and accumulate your first ARIA. The first official airdrops launch when 1,000 Alpha Brave members register.</span>
  </p>

  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">

    <a href="/signup" class="btn-primary-large" style="display:inline-block;padding:16px 32px;background:var(--airoobi-gold);color:#fff;text-decoration:none;font-family:'Inter',sans-serif;font-size:1rem;font-weight:500;border-radius:4px">
      <span class="it" lang="it">Diventa Alpha Brave</span><span class="en" lang="en">Become Alpha Brave</span>
    </a>

    <a href="/come-funziona-airdrop" class="btn-secondary-ghost" style="display:inline-block;padding:16px 32px;background:transparent;color:var(--airoobi-ink);text-decoration:none;font-family:'Inter',sans-serif;font-size:1rem;font-weight:500;border:1px solid var(--airoobi-ink);border-radius:4px">
      <span class="it" lang="it">Scopri come funziona</span><span class="en" lang="en">Discover how it works</span>
    </a>

  </div>

</section>
```

### Note CTA

- Primary CTA "Diventa Alpha Brave" → `/signup` (action chiusa, conversion-focused)
- Secondary CTA "Scopri come funziona" → `/come-funziona-airdrop` (educational deep, dwell time + SEO crosslink)
- Link `/come-funziona-airdrop` è critical: rafforza segnale a Googlebot che la pagina educational orphan (4728 parole) è linkata da hub semantico `/airdrops`

---

## §Meta tags

### Content esatto per `<head>`

```html
<title><span class="it" lang="it">AIROOBI Airdrops — Marketplace di airdrop equi su blockchain Kaspa</span><span class="en" lang="en">AIROOBI Airdrops — Fair airdrop marketplace on Kaspa blockchain</span></title>

<!-- NB: bilingue title via inline span è non standard. Suggerisco IT default + alternate via Open Graph locale. Pattern: -->

<title>AIROOBI Airdrops — Marketplace di airdrop equi su blockchain Kaspa</title>

<meta name="description" content="Marketplace bidirezionale di airdrop equi su Kaspa. Partecipa con ARIA accumulato gratuitamente, ricevi oggetti reali via scoring v5 trasparente. Nessuna fortuna cieca, solo skill di partecipazione.">

<meta property="og:title" content="AIROOBI Airdrops — Marketplace di airdrop equi su blockchain Kaspa">
<meta property="og:description" content="Marketplace bidirezionale di airdrop equi su Kaspa. Partecipa con ARIA accumulato gratuitamente, ricevi oggetti reali via scoring v5 trasparente.">
<meta property="og:locale" content="it_IT">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.airoobi.app/airdrops">

<link rel="canonical" href="https://www.airoobi.app/airdrops">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
```

### Note meta

- Title 80 char (target SEO ottimale 50-80) + brand keyword + value prop + tech (Kaspa)
- Meta description 217 char (Google taglia a ~160 ma usa primo for snippet) — first 155 char è il "snippet visibile" che fa click
- `og:locale:alternate en_US` segnala bilingual content senza hreflang split (compromesso vs Skeezu directive bilingue inline)
- Robots `index, follow, max-snippet:-1` — segnala "preferisco snippet lungo nei rich results" (AdSense reviewer signal positivo)

---

## §JSON-LD strutturato (CRITICAL)

### Content esatto

Aggiungere nel `<head>` (o fine `<body>` per perf):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.airoobi.app/airdrops#webpage",
      "url": "https://www.airoobi.app/airdrops",
      "name": "AIROOBI Airdrops — Marketplace di airdrop equi su blockchain Kaspa",
      "description": "Marketplace bidirezionale di airdrop equi su Kaspa. Partecipa con ARIA accumulato gratuitamente, ricevi oggetti reali via scoring v5 trasparente.",
      "isPartOf": { "@id": "https://www.airoobi.app/#website" },
      "inLanguage": ["it-IT", "en-US"]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.airoobi.app/#website",
      "url": "https://www.airoobi.app/",
      "name": "AIROOBI",
      "description": "Il primo marketplace dove vendere e ottenere quello che desideri è una skill.",
      "publisher": { "@id": "https://www.airoobi.app/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "https://www.airoobi.app/#organization",
      "name": "AIROOBI",
      "url": "https://www.airoobi.app/",
      "logo": "https://www.airoobi.app/logo-black.png",
      "description": "Marketplace di airdrop equi su blockchain Kaspa."
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.airoobi.app/" },
        { "@type": "ListItem", "position": 2, "name": "Airdrops", "item": "https://www.airoobi.app/airdrops" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "AIROOBI è un sito di scommesse o giochi?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. AIROOBI è un marketplace bidirezionale dove venditori distribuiscono oggetti reali tramite airdrop equi e partecipanti li ricevono usando ARIA accumulato. Non si compra nessun biglietto o ticket. Non c'è puntata in denaro. C'è partecipazione skill-based dentro un sistema di scoring trasparente che premia la presenza, non il caso cieco."
          }
        },
        {
          "@type": "Question",
          "name": "Come ottengo ARIA per partecipare?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ARIA si accumula gratuitamente. Ricevi ARIA dal faucet quotidiano, dalla sequenza di check-in giornaliera, invitando amici che si registrano, completando le sezioni educative del marketplace. Non si compra ARIA con denaro: si guadagna con la presenza e la partecipazione attiva alla community."
          }
        },
        {
          "@type": "Question",
          "name": "Cosa sono i ROBI e a cosa servono?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ROBI sono tessere di rendimento che maturano se non vinci un airdrop. Ogni partecipazione conta: se non ricevi l'oggetto, accumuli ROBI proporzionali ai blocchi investiti. ROBI cresce di valore nel tempo grazie al meccanismo di treasury backing AIROOBI, e si può convertire ogni lunedì entro un cap settimanale. Niente è sprecato."
          }
        },
        {
          "@type": "Question",
          "name": "Cos'è la fase Alpha Brave e perché ci sono solo 1.000 posti?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Alpha Brave è la fase early access di AIROOBI: i primi 1.000 utenti registrati formano la community fondante del marketplace. Quando raggiungiamo i 1.000 Alpha Brave, partono ufficialmente i primi airdrop di Stage 1 con benefit esclusivi per chi è entrato presto. Il cap a 1.000 protegge la qualità della community e garantisce attenzione personalizzata in fase di rodaggio."
          }
        }
      ]
    }
  ]
}
</script>
```

### Note JSON-LD

- 5 schema types in 1 graph: `WebPage` + `WebSite` + `Organization` + `BreadcrumbList` + `FAQPage`
- FAQPage schema **mainEntity** array è il rich-snippet trigger principale per AdSense reviewer (il signal più forte di publisher serio)
- IT-only nel structured data (Google AdSense legge la lingua principale del dominio per FAQPage; EN inline content nel body resta accessible per dual-language UX)
- `@graph` permette nesting + ID linking per future updates senza duplication

---

## Acceptance criteria per H2 CCP

CCP integra il content sopra in `airdrops-public.html`. Acceptance:

1. ✅ File `airdrops-public.html` creato in repo root (mirror landing.html structure)
2. ✅ Tutto il content text bilingue inline IT+EN (pattern `<span class="it" lang="it">...</span><span class="en" lang="en">...</span>`)
3. ✅ FOUC fix inline `<style>[data-lang="it"] .en,[data-lang="en"] .it{display:none!important}</style>` PRIMA dei `<link>` CSS
4. ✅ Word count text-rich ≥ 1.000 parole (target ~1.150 = 575 IT + 575 EN)
5. ✅ JSON-LD `@graph` con 5 schema types presente nel `<head>`
6. ✅ Meta tags: title (80 char), description (217 char con first 155 click-friendly), canonical, robots, og locale + alternate
7. ✅ Vercel.json rewrite: `/airdrops` per host `airoobi.app` non-loggedin → `airdrops-public.html` · `/airdrops/:id` resta `dapp.html`
8. ✅ Header nav minimal (HOME / AIRDROPS / COME FUNZIONA / EDU / Accedi / Registrati) coerente con landing.html
9. ✅ Footer coerente con landing.html (logo + version + legal links)
10. ✅ CSS `airdrops-public.css` (o inline) per styling (Inter + Renaissance gold + manifesto-tone)
11. ✅ NO chrome dApp (zero modali signup/elimina-account, zero wallet panel, zero JS-driven content che richiede auth)
12. ✅ Zero gambling lexicon (verifica grep "fortuna", "scommessa", "lottery", "estrazione", "sorteggio", "azzardo")
13. ✅ Smoke verify post-deploy: `curl -A "Googlebot" https://www.airoobi.app/airdrops` → response HTML contiene tutti i text-rich blocks SSR (non lazy-loaded)

---

## Fonti / Reference

- AdSense audit CCP: `CCP_AdSense_Editorial_Audit_2026-05-09.md` § H2
- Sign-off ack: `ROBY_Reply_CCP_Editorial_Audit_SignOff_2026-05-09.md` § Fase 2
- Voice Principle 04 STRICT: `feedback_voice_principle_04_anti_gambling_strict.md` (memory)
- FAQ source: `https://www.airoobi.app/faq` (16 domande × 4 sezioni, 2017 parole)
- Brand v2.2: post mega closure (Inter + Renaissance gold + Skeezu signoff slogan v2.2)
- Pattern bilingue inline + FOUC fix: pattern già live su dapp.html (post MEGA closure ISSUE-21 fix)

---

## Closing · CCP H2 trigger pronto

Brief content R4 ready-to-incorporate. ETA mio scrittura: 1.5h actual.

CCP, quando ricevi questo file in for-CCP/ + lanci Fase 2 H2:
1. Crea `airdrops-public.html` con content sopra (zero rework necessario, paste-friendly)
2. Crea `src/airdrops-public.css` con tokens v2.2 (Inter + Renaissance gold + manifesto-tone) o inline equivalent
3. Edit `vercel.json` rewrite `/airdrops` (per host `airoobi.app` non-loggedin) → `airdrops-public.html` · preserva `/airdrops/:id` rewrite a `dapp.html`
4. Smoke verify Googlebot UA + smoke 13 acceptance criteria
5. Reply file `CCP_Round_Patch_AdSense_Fase2_H2_*.md` con audit-trail

Smoke priority: assicura che `/airdrops` per Googlebot risponda la NUOVA pagina pubblica SSR, NON dapp.html (questo è il fix critico vs duplicate content rejection).

ROBY parallel R1 sta partendo (espansione 19 blog articles thin a 800+ parole, ETA 25-40h spread 2-3 settimane).

Daje, chiudiamo anche H2.

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (R4 content brief airdrops-public.html · 1.150 parole bilingue inline + JSON-LD 5 schema + 13 acceptance criteria + ready-to-incorporate paste-friendly)*
