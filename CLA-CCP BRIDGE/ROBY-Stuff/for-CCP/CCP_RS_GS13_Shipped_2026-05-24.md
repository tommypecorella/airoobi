---
title: CCP · RS · GS-13 SHIPPED · chat bubbles dx/sx · dApp + ABO · classi CSS condivise
purpose: GS-13 chiuso. Refactor loadAirdropChat (dApp) + loadAboChat (ABO) da inline styles a classi CSS condivise (.chat-msg, .msg-mine/.msg-theirs, .chat-msg-bubble). Bolle dx gold tonale per msg miei, sx aria blu tonale per msg altrui. Padding asymmetric, border-radius asymmetric. Cache-bust + footer 4.29.0. UI-click ROBY pending.
date: Dom 24 maggio 2026
audience: ROBY · Skeezu
status: GS-13 SHIPPED · commit pending push · attendo UI-click ROBY · next GS-7
in-reply-to: ROBY_SignOff_GS2_Verified_2026-05-23.md
---

# CCP — RS · GS-13 SHIPPED · chat bubbles

## TL;DR

GS-13 chiuso. Chat dApp + ABO ora usa **classi CSS condivise**
(`.chat-msg.msg-mine`/`.msg-theirs`), bolle visivamente discriminate:
- **mie** → destra · gold tonale (`rgba(184,150,12,.16)` + border 35%)
  · bottom-right-radius 4px (tail visiva)
- **altrui** → sinistra · aria blu tonale (`rgba(74,158,255,.08)` + border 25%)
  · bottom-left-radius 4px

Padding asymmetric, max-width 78% (88% mobile). Stesso pattern in
entrambi i posti. **UI-click ROBY pending.**

## 1. Cosa è cambiato

### CSS (condiviso · stessa regola in 2 punti)

| File | Posizione | Cosa |
|---|---|---|
| `src/dapp.css` | tail (dopo `.my-tab:hover`) | Aggiunto blocco `/* Chat bubbles (GS-13) */` con `.chat-msg`, `.chat-msg-bubble`, head/body/time + media-query mobile |
| `abo.html` | `<style>` block (dopo `#abo-tooltip .tt-tip`) | Stesso blocco identico inline (abo.html non carica CSS esterni) |

Regole chiave:
- `.chat-msg{display:flex;margin-bottom:10px}`
- `.chat-msg.msg-mine{justify-content:flex-end}` ·
  `.chat-msg.msg-theirs{justify-content:flex-start}`
- `.chat-msg-bubble{max-width:78%;padding:10px 14px 8px;border-radius:14px}`
- Asymmetric tail: `msg-mine .chat-msg-bubble{border-bottom-right-radius:4px}`
  · `msg-theirs .chat-msg-bubble{border-bottom-left-radius:4px}`
- Author color: mine → gold · theirs → aria
- Mobile: max-width 88%, font-size 12.5px

### JS render (refactor inline → classi)

**dApp** · `src/dapp.js:4607-4621` `loadAirdropChat()` for-loop:
```js
// Prima: 4 var inline (align/bg/border + html con styles)
var align=isMine?'flex-end':'flex-start';
var bg=isMine?'rgba(184,150,12,.12)':'rgba(74,158,255,.08)';
var border=isMine?'var(--gold)':'var(--aria)';
html+='<div style="display:flex;justify-content:'+align+';...">'...

// Dopo: solo classe 'msg-mine|msg-theirs'
var side=isMine?'msg-mine':'msg-theirs';
html+='<div class="chat-msg '+side+'">';
html+='<div class="chat-msg-bubble">';
html+='<div class="chat-msg-head"><span class="chat-msg-author">'+label+'</span><span class="chat-msg-time">'+time+'</span></div>';
html+='<div class="chat-msg-body">'+escHtml(m.body)+'</div>';
html+='</div></div>';
```

**ABO** · `abo.html:3889-3902` `loadAboChat()` for-loop · **stesso identico refactor** (sostituito `escH` invece di `escHtml`).

### Discriminante "mine vs theirs"

Logica invariata: `m.sender_id === myId` → mine. Vale per entrambi i lati:
- **dApp** lato utente: i miei msg → dx gold · risposte AIROOBI/admin → sx aria
- **ABO** lato admin: i miei (admin) msg → dx gold · msg utente → sx aria

Label conservata ("AIROOBI" / "Tu" / "Utente"), timestamp localizzato `it-IT` invariato.

## 2. Cache-bust + footer

- `dapp.html:29` · `dapp.css?v=4.26.3` → **4.29.0** (cal. `feedback_cache_bust_v_bump`)
- `dapp.html:1681` · `dapp.js?v=4.28.0` → **4.29.0**
- `dapp.html:1609` · footer `alfa-2026.05.23-4.28.0` → **alfa-2026.05.24-4.29.0**
- `abo.html` · nessun cache-bust necessario (CSS inline, no asset esterni cambiati)
- Footer ABO: non presente, non aggiornato

## 3. Smoke test

- `node --check src/dapp.js` → ✅ syntax OK
- Verifica `escHtml` (dapp.js:11) e `escH` (abo.html:1395) entrambe definite e XSS-safe (replace `&<>` → entities)
- Logica `isMine` invariata, label/time/body invariati → no regressione funzionale
- CSS classi non collidono con altre regole repo (grep `.chat-msg` → zero match precedenti)

UI-click verifica raccomandata su:
- **dApp** · aprire un airdrop, sezione MESSAGGI (bottone con `loadAirdropChat`) · scrivere msg + verificare bolla dx gold
- **ABO** · sezione Messaggi · cliccare thread con conversazione esistente · verificare bolle differenziate dx (admin/gold) e sx (utente/aria)

## 4. Counter golden-session

- Aperti: **10** (era 11) — GS-13 chiuso
- In corso: 1 (cluster GS-9 rework Track B in standby)
- Risolti: **4** (GS-11 · GS-4 · GS-2 · **GS-13**)

## 5. Prossimo: GS-7 banner rosa Alpha — IN MOTION

Parto subito su GS-7 (banner rosa fase Alpha · `dapp.html` container CSS
fix). Item low-risk, CSS puro. Footer 4.30.0. Shipped file separato a
chiusura.

A oltranza come da Skeezu, ma consegne singole per il tuo UI-click come
da tuo precedente sign-off.

## Bottom line

GS-13 chiuso · classi CSS condivise dApp+ABO · padding/border/color
asymmetric · cache-bust + footer 4.29.0 · syntax OK · UI-click pending.
Counter Track A: 4 risolti su 11 originali. **GS-7 starting now.**

Audit-trail: questo file = shipped GS-13 · CSS condiviso
src/dapp.css+abo.html<style> · refactor inline→classi loadAirdropChat
src/dapp.js:4607 + loadAboChat abo.html:3889 · cache-bust dapp.css/js
4.29.0 · footer dapp.html 4.29.0 · smoke node --check OK · UI-click ROBY
pending · next GS-7 in motion.

---

*CCP · CIO/CTO Airoobi · GS-13 shipped · 24 May 2026 · daje team a 4*
