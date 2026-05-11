---
from: CCP (Claude Code · CIO/CTO · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu
subject: ✅ ROUND 12 SHIPPED · share messages outsider-friendly + seller hook · v4.13.2 hotfix
date: 2026-05-11
ref: Round 12 brief ROBY 11 May 2026 morning · post primi 2 referral confirmed · Skeezu jargon analysis Round 8
status: SHIPPED · LIVE · v4.13.2 · share campagna pronto resume con copy outsider-friendly
---

# ✅ ROUND 12 SHIPPED · Share Messages Outsider-Friendly + Seller Hook

## TL;DR

`shareReferral(platform, event)` in `src/dapp.js:1123` — messages dict
sostituito con copy Skeezu LOCKED Round 12. Zero jargon (no Alpha Brave, no ROBI,
no airdrop, no Kaspa). NEW seller dimension "vendi in ore, non mesi" attivo su
WhatsApp/Telegram long + Twitter short + Email body.

Cache buster bump `?v=4.12.0` → `?v=4.13.2` su `dapp.html`. Footer version
`4.13.1` → `4.13.2` su dapp.html + home.html + signup.html.

**Share campagna pronto resume.** Skeezu prossimo: click test E2E /invita
per visual verify preset rendering corretto IT + EN.

ETA reale: ~6 min CCP atomic (calibrato 5-10 min brief = match).

---

## Recon pre-edit

```bash
grep -n "shareReferral\|dappShareRef" src/dapp.js dapp.html
```

**Confermato wire-up:**
- `dapp.html:906-915` → 4 share buttons `onclick="shareReferral('whatsapp'|'telegram'|'twitter'|'email', event)"`
- `src/dapp.js:1123` → `function shareReferral(platform, event)` con messages dict
- `src/dapp.js:1183` → `function dappShareRef(platform)` exists ma **NOT wired** (legacy/unused — preservato as-is, no scope creep)

**Dispatcher esistente preservato** (flat email_subject + email_body keys):

```js
if(platform==='whatsapp') window.open('https://wa.me/?text='+...);
else if(platform==='telegram') window.open('https://t.me/share/url?url='+...);
else if(platform==='twitter'||platform==='x') window.open('https://twitter.com/intent/tweet?text='+...);
else if(platform==='email') window.location.href='mailto:?subject='+...+'&body='+...;
```

Brief usava struct annidata `email: { subject, body }` → **adattato a flat
struct esistente** (zero rischio break dispatcher · brief intent content
preservato 100%).

---

## Diff applicato

### src/dapp.js (lines 1128-1143)

**Before (Round 8 jargon crypto-native):**
- IT WhatsApp: "Ehi, ti consiglio AIROOBI: nuovo marketplace dove ricevi oggetti reali partecipando agli airdrop. Siamo in Alpha Brave (solo 1.000 posti, anche tu prendi 5 ROBI bonus se ti registri). Entra qui: ..."
- IT Twitter: "Su @airoobi_com ricevi oggetti reali partecipando agli airdrop. Marketplace skill-based su Kaspa. Alpha Brave aperto (1.000 posti). +5 ROBI bonus..."

**After (Round 12 outsider-friendly + seller hook):**
- IT WhatsApp/Telegram: "AIROOBI: il primo negozio online dove gli oggetti non si comprano, si ottengono partecipando. Entra adesso e sfrutta questo primo periodo pre-lancio ufficiale della piattaforma. Per ogni partecipazione vieni premiato. Curioso?\n{link}\nRegistrati e potrai anche vendere un tuo oggetto e non dovrai aspettare anni, mesi o settimane per venderlo, solo ore"
- IT Twitter: "Su AIROOBI gli oggetti non si comprano, si ottengono partecipando. Per ogni partecipazione vieni premiato. Curioso? Plus: se hai qualcosa da vendere, qui lo liquidi in ore, non mesi. {link}"
- IT Email subject: "AIROOBI · negozio dove gli oggetti non si comprano"
- IT Email body: 6 paragrafi · buyer + seller framing · pre-lancio + CTA

EN parallelo (peer parità content).

**Comment header aggiunto:**
```js
// Round 12 (11 May 2026) · outsider-friendly + seller hook · no jargon Alpha Brave/ROBI/airdrop
```

### dapp.html

- Cache buster: `<script src="/src/dapp.js?v=4.12.0">` → `<script src="/src/dapp.js?v=4.13.2">`
- Footer: `alfa-2026.05.10-4.13.1` → `alfa-2026.05.11-4.13.2`

### home.html · signup.html

- Footer: `alfa-2026.05.10-4.13.1` → `alfa-2026.05.11-4.13.2`

---

## Twitter length budget check

| Variant | Body (no link) | Link reserve | Total stima | Limit |
|---|---|---|---|---|
| IT twitter | 184 char | 43 char (`https://www.airoobi.app/signup?ref=XXXXXXXX`) | ~227 char | 280 ✅ |
| EN twitter | 178 char | 43 char | ~221 char | 280 ✅ |

Twitter shortened URLs (t.co) saranno ancora più corti, ulteriore buffer.

---

## Smoke verifica acceptance

| AC | Status |
|---|---|
| 1. messages dict aggiornato | ✅ src/dapp.js:1128-1143 |
| 2. WhatsApp opens wa.me con IT long + seller hook | ⏳ smoke Skeezu E2E |
| 3. Telegram opens t.me con IT stesso content | ⏳ smoke Skeezu E2E |
| 4. Twitter opens twitter.com/intent con IT short | ⏳ smoke Skeezu E2E |
| 5. Email opens mailto: con subject + body strutturato | ⏳ smoke Skeezu E2E |
| 6. EN locale equivalent (data-lang="en" toggle) | ⏳ smoke Skeezu E2E |
| 7. Cache buster `?v=4.13.2` su dapp.js ref | ✅ |
| 8. Version bump 4.13.1 → 4.13.2 | ✅ 3 file footer |

---

## File deliverables

| File | Tipo | Change |
|---|---|---|
| `src/dapp.js` | EDIT | messages dict in `shareReferral` lines 1128-1143 (8 string totali: 4 IT + 4 EN) |
| `dapp.html` | EDIT | cache buster `?v=4.13.2` + footer 4.13.2 |
| `home.html` | EDIT | footer 4.13.2 |
| `signup.html` | EDIT | footer 4.13.2 |
| `CLA-CCP BRIDGE/ROBY-Stuff/for-CCP/CCP_FixLampo_Round12_ShareMessages_2026-05-11.md` | NEW | Audit-trail |

---

## Adattamenti minori vs brief

1. **Email struct flat preserved:** brief usava `email: { subject, body }` annidato; codice esistente usa `email_subject` + `email_body` flat keys con dispatcher specifico `m.email_subject` + `m.email_body`. **Mantenuto flat per non toccare dispatcher** (chirurgico content-only replacement) · brief intent content 100% preservato.

2. **Comment header aggiunto:** una linea `// Round 12 ... no jargon Alpha Brave/ROBI/airdrop` per audit-trail in-source · zero behavior impact.

3. **Twitter/X dispatcher branch invariato:** brief mostrava solo `'twitter'`, codice esistente accetta `'twitter'||'x'`. Branch preservato as-is (no caller passa `'x'` attualmente, ma future-proof).

---

## Pattern operativi rispettati

- ✅ Edit chirurgico function content replace · NO sed cascade
- ✅ NO HTML/CSS change · pure JS content update + cache buster
- ✅ Bilingue IT + EN preservato (8 string parallele)
- ✅ Dispatcher esistente preservato (flat email keys + twitter||x branch)
- ✅ Cache buster bump per forzare reload browser
- ✅ Footer version bump 4.13.1 → 4.13.2 (signup/home/dapp affected pages)
- ✅ Commit + push immediate post-fix
- ✅ Outsider audit applied (no jargon Alpha Brave/ROBI/airdrop/Kaspa)
- ✅ Voice principle 04 anti-gambling rispettato (no "vinci/perdi/lotteria")

---

## Lesson learned applicata · Round 12

Inglobata in `feedback_verify_before_brief.md` extension copy text recon
(già attiva post-Round 10): aggiunto bullet pattern **outsider audit** per
copy outreach esterno.

**Rule of thumb consolidata:**
- **In-app loggato copy:** jargon AIROOBI native OK (utente onboarded)
- **Share esterno outreach copy:** categorize in concetti familiari
  (negozio online, oggetti, partecipare, vendere rapido) · utente cold +
  1° contatto

**Insight Skeezu seller dimension HUGE:** velocità liquidazione (24-120h
vs settimane/mesi competitor) è killer feature seller-side che era
invisibile nel copy Round 8. Round 12 ora copre 2 audience:
- Buyer side: "voglio iPhone/orologi a sconto"
- Seller side: "voglio liquidare il mio Rolex in ore non mesi"

→ share message ora arriva a 2x audience → 2x conversion potential.

---

## Closing

Round 12 SHIPPED chirurgico · ~6 min CCP atomic. Share campagna pronto
resume full speed con copy outsider-friendly + seller hook.

**Skeezu next:**
1. Hard refresh /invita (Cmd+Shift+R) · cache buster `?v=4.13.2` forza reload
2. Click test WhatsApp + Telegram + X + Email · verify preset render IT
3. Toggle lingua EN · verify preset render EN
4. Resume share campagna referral primo periodo pre-lancio

**ROBY next:**
- Sign-off Round 12 post-smoke Skeezu
- Riprende strategia acquisition con copy v4.13.2 outsider-friendly attivo

ETA reale: ~6 min CCP atomic (brief stima 5-10 min calibrato = match).

— **CCP**

*11 May 2026 W2 Day 7 morning · canale CCP→ROBY (Round 12 SHIPPED · share messages outsider-friendly + seller hook · 8 string IT+EN · cache buster v4.13.2 · zero jargon · seller dimension killer feature ora visible · share campagna pronto resume)*
