---
title: ROBY · RS · test UX mobile + dark mode brand + redesign banner rossi + entry-UX — pre go-live
purpose: ROBY ha testato la dApp a viewport mobile reale (412px, Chrome ext). Questo file consegna a CCP — in una passata coerente — (1) i finding del test UX mobile con triage blocker/fast-follow, (2) la spec dark mode con tabella token brand-corretta (nero/bianco/oro) — DISCOVERY: un blocco [data-theme="dark"] esiste già ma è fuori brand (palette blu-navy, gold→blu, radius 14px), va RITARATO non costruito da zero, (3) la spec redesign banner rossi (una riga + expand/collapse/close, riappare al refresh), (4) la spec entry-UX (le 3 azioni core sopra la piega). Smoke test CCP recepito, cleanup 6 airdrop già autorizzata da Skeezu in file separato.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: RS consegnato · dark mode = ritaratura blocco esistente + toggle · redesign banner + entry-UX = fast-follow · 2 quick-fix candidabili stasera (cuore scuro + word-wrap)
in-reply-to: CCP_SmokeTest_PreGoLive_2026-05-24.md
---

# ROBY — RS · UX mobile + dark mode + banner + entry-UX

## TL;DR

ROBY ha testato la dApp a **viewport mobile reale 412px**. L'app è
funzionale e lanciabile. Trovati: 1 bug visivo evidente (card "ARIA
quotidiano" che spezza il testo parola-per-parola), il cuore preferiti
**ancora scuro** come segnalato da Skeezu, e l'entry-UX che non mette
le 3 azioni-core sopra la piega.

**Discovery dark mode**: il blocco `[data-theme="dark"]` **esiste già**
nel CSS della dApp — ma è un draft fuori brand (palette blu-navy,
`--gold` rimappato a **blu**, `radius` 14px invece di 4px). Dark mode
quindi **non si costruisce: si ritara**. Sotto la tabella token
brand-corretta (nero/bianco/oro), copy-paste ready.

Triage: niente di questo blocca il go-live delle 22. 2 quick-fix
piccoli sono candidabili stasera (cuore + word-wrap); dark mode +
banner + entry-UX sono il primo fast-follow post-lancio.

## 1. Smoke test CCP — recepito

`CCP_SmokeTest_PreGoLive` recepito: 10/11 aree verdi, semaforo
backend **verde** per il go-live. I 2 advisor `security_definer_view`
(`email_count_today`, `v_treasury_robi_supply`) = falsi positivi non
bloccanti (GRANT solo `service_role`), fix cosmetico post-lancio
`WITH (security_invoker=on)` — ok.

Lo STOP+ASK cleanup marketplace è già chiuso: **Skeezu ha autorizzato
tutti e 6** gli airdrop di test → vedi
`ROBY_RS_Cleanup_6_Airdrop_Test_PreGoLive_2026-05-24.md` (CCP esegue
la query transazionale prima del go-live).

## 2. Test UX mobile — finding

Viewport 412px, utente CEO loggato, percorsi: ingresso dApp →
dashboard → pagina airdrop → area acquisto.

### 2.1 🔴 Bug visivo — card "Il tuo ARIA quotidiano" spezza il testo
Nella sezione GUADAGNI, la card "Il tuo ARIA quotidiano" rende il
testo **una parola per riga** ("Il / tuo / ARIA / quotidiano" — "Ricevi
/ 100 / ARIA / gratis / — / ogni / giorno…"). A 412px è vistoso e
sembra rotto. Sintomo classico di colonna flex/grid figlia senza
`min-width:0` o con `width` fissa che collassa, oppure `word-break`
errato. **Verify-before-fix CCP**: grep la card nel sorgente dApp,
trova il contenitore che collassa. Frontend-only.

### 2.2 🟡 Cuore preferiti ancora scuro (finding Skeezu confermato)
Pagina airdrop, pulsante "Aggiungi ai preferiti": è un tondino 36px,
glifo `♡`, **`color: rgb(63,63,63)`** (#3F3F3F) — scuro, come Skeezu
sospettava. Va schiarito. Raccomandazione: stato a riposo = grigio
soft `var(--ink-faint)` (cuore vuoto = chiaro, legge "non salvato");
stato attivo/salvato = pieno coral o oro. Così è più chiaro **e**
semanticamente corretto. Da legare a token tema (non hardcodare
#3F3F3F), così segue anche il dark mode.

### 2.3 ✅ Tondino share — presente
Accanto al cuore c'è il tondino "Condividi airdrop": 36px,
`border-radius:50%`, visibile. Skeezu lo voleva "sotto" il cuore — è
**di fianco** (stessa riga, a destra). A mobile affiancati va bene;
se Skeezu vuole sotto è 1 riga di flex-direction. Lo share esiste,
ok. (Nota: in DOM ci sono 2 bottoni "Condividi" 0×0 nascosti —
residuo, innocuo, segnalato per pulizia.)

### 2.4 🟡 Entry-UX — le 3 azioni core sono sotto la piega
All'ingresso (`/dashboard`) sopra la piega si vedono: header
"Bentornato", **3 card di saldo** (ARIA/ROBI/KAS). Le 3 cose che
Skeezu vuole comunicare *subito* — (a) hai task che fanno guadagnare
ARIA, (b) partecipa agli airdrop, (c) crea airdrop con FAI VALUTARE —
sono **tutte sotto**: GUADAGNI a metà pagina, la griglia
AIRDROP/INVITA/WALLET/VENDI quasi in fondo. Spec di riordino in §6.

### 2.5 🟢 Navigazione mobile — ok (MNB-1 chiuso)
Nessuna regressione: niente scroll laterale, topbar contenuta,
scroll-lock hamburger rilasciato. MNB-1 tiene.

### Triage go-live
| Finding | Severità | Go-live |
|---|---|---|
| 2.1 word-wrap card ARIA | visivo evidente | quick-fix candidabile stasera, NON blocker |
| 2.2 cuore scuro | cosmetico | quick-fix candidabile stasera, NON blocker |
| 2.3 share | ok | nessuna azione |
| 2.4 entry-UX | UX | fast-follow |
| dark mode | feature | fast-follow (o stasera se CCP ha margine) |
| redesign banner | UX | fast-follow |

**Nessun rosso bloccante lato UX mobile. Si lancia.**

## 3. Dark mode — DISCOVERY + spec brand

### 3.1 Cosa c'è già
`<html data-theme="light">` è già impostato: **l'infrastruttura di
theming esiste**. E un blocco `[data-theme="dark"]` **esiste già nel
CSS** (verificato: flippando `data-theme` a `dark` la pagina cambia).
Ma è un draft **fuori brand**:

| Token | Light (brand) | Dark ESISTENTE (fuori brand) | Problema |
|---|---|---|---|
| `--gold` | `#B8893D` | `#4A9EFF` | **oro rimappato a BLU** ❌ |
| `--accent` | `#B8893D` | `#4A9EFF` | accent blu invece che oro ❌ |
| `--radius` | `4px` | `14px` | cambia il linguaggio visivo ❌ |
| `--radius-sm` | `4px` | `10px` | idem ❌ |
| body bg | `#FFFFFF` | `#060b18` | navy-black, non nero ❌ |
| `--bg-elevated` | `#FAFAF7` | *(vuoto)* | mancante ❌ |
| `--bg-card` | `#FFFFFF` | *(vuoto)* | mancante ❌ |
| `--bg-modal` | `#FFFFFF` | *(vuoto)* | mancante ❌ |
| `--ink` | `#0F1417` | `#F5F1E8` | warm white — ok ✅ |

Quindi: **dark mode non si costruisce da zero, si ritara.** Si
sostituisce il blocco `[data-theme="dark"]` con quello brand qui sotto
e si aggiunge un toggle. È davvero "solo un nuovo css", come diceva
Skeezu.

### 3.2 Tabella token dark BRAND (nero/bianco/oro) — copy-paste ready
Sostituire i valori del blocco `[data-theme="dark"]` con questi.
**Regola**: il dark NON cambia `--radius` né i font — solo superfici,
inchiostro e linee si invertono; **l'oro resta oro**.

```css
[data-theme="dark"] {
  /* superfici — nero caldo (espresso-tinted), NON navy */
  --bg-primary:  #0D0D0D;            /* base pagina */
  --bg-elevated: #161513;            /* superficie sollevata */
  --bg-alt:      #1B1814;            /* superficie secondaria */
  --bg-card:     #141210;            /* card */
  --card-bg:     #141210;            /* alias legacy */
  --bg-modal:    #1F1B16;            /* modale (un filo più chiara) */
  --glass-bg:    rgba(20,18,16,0.85);

  /* inchiostro — bianco caldo */
  --ink:         #F5F1E8;
  --ink-soft:    rgba(245,241,232,0.66);
  --ink-faint:   rgba(245,241,232,0.40);
  --white:       #F5F1E8;            /* token semantico foreground */
  --black:       #0D0D0D;            /* token semantico background */

  /* linee */
  --line:        rgba(245,241,232,0.12);
  --line-soft:   rgba(245,241,232,0.07);
  --glass-border:rgba(245,241,232,0.10);

  /* ORO — resta oro, leggermente schiarito per contrasto su nero */
  --gold:        #D4A04C;
  --gold-light:  #E3B560;
  --gold-deep:   #B8893D;
  --gold-dim:    rgba(212,160,76,0.24);
  --gold-glow:   rgba(212,160,76,0.10);
  --accent:      #D4A04C;            /* accent = oro, NON blu */
  --accent-dim:  rgba(212,160,76,0.24);
  --accent-soft: rgba(212,160,76,0.14);
  --accent-glow: rgba(212,160,76,0.10);

  /* token funzionali — restano sé stessi, schiariti per il nero */
  --aria:        #5AA8FF;            /* ARIA = blu, ok */
  --aria-blue:   #5AA8FF;
  --kas:         #49EACB;            /* KAS = verde menta */
  --kas-green:   #49EACB;
  --coral:       #FF4D6A;
  --red-alert:   #FF5A5A;
  --red:         #FF6B6B;

  /* RADIUS — NON cambiare: il brand è netto 4px */
  --radius:      4px;
  --radius-sm:   4px;
  --radius-lg:   8px;
  /* --radius-pill resta 999px */
}
```

I token non elencati (font, safe-area, gray-scale di supporto)
restano. Se nel dark esistente compaiono `--gray-*` con valori navy,
allinearli a grigi neutri caldi (es. `--gray-900:#0D0D0D`,
`--gray-800:#161513`, `--gray-700:#1F1B16`).

### 3.3 Il toggle
- Pulsante tema nella **topbar dApp**, accanto al toggle lingua EN
  (stesso trattamento — sono fratelli). Icona sole/luna.
- Click → flip `document.documentElement.dataset.theme`
  `light`↔`dark`.
- Persistenza: `localStorage['airoobi-theme']`.
- Primo accesso senza preferenza salvata → leggere
  `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Anti-flash**: applicare il tema con uno script inline nel
  `<head>` PRIMA del primo paint (altrimenti flash bianco al load in
  dark).
- Scope: **solo dApp `airoobi.app`** in questo giro. ABO back-office e
  `airoobi.com` istituzionale = follow-up separati (non in questo RS).

### 3.4 Verifica
A ritaratura fatta, ROBY ri-verifica a UI-click flippando il toggle
su dashboard + pagina airdrop + modale acquisto: zero superficie
navy, oro = oro ovunque, contrasto testo AA, niente flash al load.

## 4. Redesign banner rossi

Direttiva Skeezu: i banner rossi devono essere **una sola riga** con
**expand / collapse / close** — e dopo il close **riappaiono al
refresh** della pagina.

Spec del componente banner unico (vale per: banner fase Alpha, banner
autobuy attivo GS-12, warning soglia/fairness, ogni banner alert):

- **Collassato (default)**: una riga ~36-40px — icona + messaggio in
  una riga con ellissi se eccede + chevron expand + `×` close.
- **Expand** (chevron): mostra il messaggio esteso / dettaglio sotto.
- **Close (`×`)**: nasconde il banner **solo per la sessione di
  pagina** — stato in-memory, **NON** persistito su localStorage →
  al refresh il banner **riappare**. (Esplicito da Skeezu.)
- Sticky: dove il banner era già sticky (autobuy GS-12) resta sticky.
- Una sola riga = niente più banner multi-riga che mangiano mezzo
  viewport mobile.

Nota: è un refactor di componente, frontend-only. Non blocca il
go-live — i banner attuali funzionano, sono solo ingombranti.

## 5. Quick-fix candidabili stasera (opzionali, decisione CCP)

Due fix piccoli, frontend-only, a basso rischio — se CCP ha margine
prima delle 22 entrano, altrimenti primo fast-follow:

1. **Cuore preferiti**: `color` del bottone da `#3F3F3F` a
   `var(--ink-faint)` (riposo) + stato attivo pieno coral/oro.
2. **Word-wrap card ARIA**: root-cause del contenitore che collassa a
   412px (grep + `min-width:0` / rimozione `width` fissa).

## 6. Entry-UX — le 3 azioni core sopra la piega

Obiettivo Skeezu: entrando nell'app si deve capire **subito** che
(a) hai task che fanno guadagnare ARIA, (b) devi partecipare agli
airdrop, (c) devi crearne con FAI VALUTARE.

Spec di riordino `/dashboard` (frontend-only, sezioni già esistenti,
si spostano):

1. Header "Bentornato" — resta in cima.
2. **Subito sotto**: una **action-strip a 3 CTA** sopra la piega —
   `Guadagna ARIA` (→ GUADAGNI/task) · `Partecipa a un airdrop`
   (→ explore) · `Fai valutare un oggetto` (→ submit valutazione).
   Sono le 3 azioni-core, devono stare sopra senza scroll.
3. Sotto: le 3 card di saldo (ARIA/ROBI/KAS) — sono *stato*, non
   azione, scendono.
4. Micro-nudge opzionale: una riga "Hai N task da completare oggi" se
   ci sono daily ARIA disponibili o sequenza incompleta (oggi: "5/7
   timbrati · mancano 2 per il ROBI").
5. La griglia AIRDROP/INVITA/WALLET/VENDI resta come scorciatoie
   secondarie, ma il "crea airdrop" deve essere già coperto dalla CTA
   `Fai valutare` in cima.

Fast-follow. Non blocca il go-live.

## RS — paste-ready

```
RS · UX MOBILE + DARK MODE + BANNER + ENTRY-UX (pre go-live)

ROBY ha testato la dApp a viewport mobile reale 412px. App
funzionale, lanciabile. Smoke test recepito, cleanup 6 airdrop già
autorizzata (file separato).

FINDING MOBILE:
- 🔴 card "Il tuo ARIA quotidiano" (sez. GUADAGNI) spezza il testo
  una-parola-per-riga a 412px. Verify-before-fix: grep la card,
  contenitore flex/grid che collassa (min-width:0 mancante o width
  fissa). Frontend-only.
- 🟡 cuore preferiti pagina airdrop ancora SCURO: color #3F3F3F.
  Schiarire → var(--ink-faint) a riposo + pieno coral/oro se attivo.
  Legare a token tema, non hardcodare.
- ✅ tondino share presente (accanto al cuore). 2 bottoni "Condividi"
  0x0 nascosti = residuo da pulire.
- 🟡 entry-UX: le 3 azioni-core sotto la piega (vedi sotto).
- 🟢 navigazione mobile ok, MNB-1 tiene.
Nessun rosso bloccante UX mobile. Si lancia.

DARK MODE — DISCOVERY: il blocco [data-theme="dark"] ESISTE GIA' nel
CSS dApp ma è fuori brand: --gold rimappato a BLU #4A9EFF, --accent
blu, --radius 14px (invece di 4px), body navy #060b18, --bg-elevated
/--bg-card/--bg-modal vuoti. NON costruire da zero: RITARARE il
blocco con la tabella token brand (nero/bianco/oro) nel file ROBY
§3.2 — copy-paste ready. Regola: dark non cambia radius né font;
solo superfici/inchiostro/linee si invertono; l'ORO RESTA ORO.
+ toggle in topbar accanto a EN: flip data-theme, persist
localStorage 'airoobi-theme', fallback prefers-color-scheme, script
anti-flash inline nel <head>. Scope: solo airoobi.app (ABO + .com
follow-up). ROBY ri-verifica a UI-click.

BANNER ROSSI — componente unico: una riga ~36-40px (icona +
messaggio ellissato + chevron expand + × close). Expand mostra il
dettaglio. Close = dismiss SOLO di sessione, in-memory, NON
localStorage → riappare al refresh (esplicito Skeezu). Sticky dove
già sticky (autobuy GS-12). Fast-follow.

ENTRY-UX /dashboard: action-strip a 3 CTA sopra la piega — Guadagna
ARIA / Partecipa a un airdrop / Fai valutare un oggetto. Le 3 card
saldo scendono sotto (sono stato, non azione). Fast-follow.

QUICK-FIX candidabili stasera se c'è margine (basso rischio,
frontend): cuore #3F3F3F→token + word-wrap card ARIA. Altrimenti
primo fast-follow.

Priorità: dark mode è il pezzo più voluto da Skeezu. Banner +
entry-UX = onda fast-follow post-lancio. Niente blocca le 22.
```

## Bottom line

L'app a mobile è lanciabile: nessun blocker. Il dark mode è una
fortuna nascosta — l'impianto c'è già, va solo riverniciato in brand
(la tabella in §3.2 fa tutto il lavoro di design, CCP fa il
copy-paste + il toggle). Banner ed entry-UX sono il primo fast-follow
post-lancio. I 2 quick-fix (cuore + word-wrap) li può prendere CCP
stasera se ha margine. Si va live alle 22.

Audit-trail: questo file = RS ROBY→CCP post test UX mobile 412px ·
finding (🔴 word-wrap card ARIA quotidiano · 🟡 cuore preferiti scuro
#3F3F3F · ✅ tondino share presente affiancato + 2 bottoni Condividi
0x0 residuo · 🟡 entry-UX 3 azioni sotto la piega · 🟢 nav mobile
MNB-1 ok) · triage nessun blocker UX · DISCOVERY dark mode: blocco
[data-theme="dark"] già esistente ma fuori brand (gold→blu #4A9EFF ·
radius 14px · body navy #060b18 · bg-elevated/card/modal vuoti) →
ritaratura con tabella token brand nero/bianco/oro §3.2 copy-paste +
toggle topbar (flip data-theme · localStorage airoobi-theme ·
prefers-color-scheme fallback · script anti-flash inline) scope solo
airoobi.app · redesign banner rossi una riga + expand/collapse/close
dismiss di sessione non persistito (riappare al refresh) · entry-UX
action-strip 3 CTA sopra la piega · 2 quick-fix candidabili stasera
(cuore + word-wrap) · smoke test recepito + cleanup 6 airdrop
autorizzata file separato · go-live 22:00 non bloccato.

---

*ROBY · Strategic MKT & Comms & Community · RS UX mobile + dark mode + banner + entry-UX · 24 May 2026 · daje team a 4*
