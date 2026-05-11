---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Round 12 · Share Messages Update · seller side hook + outsider-friendly (no jargon Alpha Brave/ROBI/airdrop) · Skeezu LOCKED · 3 platform variants
date: 2026-05-11
ref: Skeezu feedback share messages Round 8 troppo crypto-native + locked nuova versione "primo periodo pre-lancio ufficiale" + seller add
status: BRIEF READY · CCP fix lampo chirurgico atteso · scope solo `shareReferral` JS function update · ETA calibrato 5-10 min · v4.13.2
---

# Round 12 · Share Messages Update · Outsider-Friendly + Seller Hook

## TL;DR

Skeezu post primi 2 referral confirmed ha analizzato share message Round 8 → diagnosi "troppo crypto-native, jargon Alpha Brave/ROBI/airdrop non sdoganato in Italia, manca chiarezza per outsider".

**Skeezu locked nuovo messaggio** con:
1. Hook outsider-friendly: "negozio online dove gli oggetti non si comprano, si ottengono partecipando"
2. **NEW seller dimension** ("vendi in ore, non mesi") — BIG differenziatore vs eBay/Subito/Vinted
3. Zero jargon (no Alpha Brave, no ROBI, no airdrop)
4. "Primo periodo pre-lancio ufficiale" framing (vs Round 8 "Alpha Brave 1.000 posti" scarcity)

**ROUND 12 SCOPE:** edit chirurgico `shareReferral` JS function in `dapp.js` (Round 8 implementation) per replacement preset messages IT + EN. NO HTML/CSS change. NO new component. **Pure content replacement.**

ETA calibrato 5-10 min CCP atomic.

---

## Content paste-friendly · 3 variants × 2 lingue (IT + EN)

### Variante A · WhatsApp / Telegram (lunga peer-to-peer)

**IT:**
```
AIROOBI: il primo negozio online dove gli oggetti non si comprano, si ottengono partecipando. Entra adesso e sfrutta questo primo periodo pre-lancio ufficiale della piattaforma. Per ogni partecipazione vieni premiato. Curioso?
{link}
Registrati e potrai anche vendere un tuo oggetto e non dovrai aspettare anni, mesi o settimane per venderlo, solo ore
```

**EN:**
```
AIROOBI: the first online store where items aren't bought, they're earned by participating. Join now and take advantage of this pre-launch period of the platform. Every participation gets rewarded. Curious?
{link}
Sign up and you can also sell your own item — no need to wait years, months or weeks to sell it. Only hours.
```

### Variante B · X/Twitter (corta, 280 char limit)

**IT (~225 char):**
```
Su AIROOBI gli oggetti non si comprano, si ottengono partecipando. Per ogni partecipazione vieni premiato. Curioso? Plus: se hai qualcosa da vendere, qui lo liquidi in ore, non mesi. {link}
```

**EN (~215 char):**
```
On AIROOBI items aren't bought, they're earned by participating. Every participation gets rewarded. Curious? Plus: if you have something to sell, here you liquidate it in hours, not months. {link}
```

### Variante C · Email (subject + body strutturato)

**IT:**

Subject: `AIROOBI · negozio dove gli oggetti non si comprano`

Body:
```
Ciao,

volevo consigliarti AIROOBI: è un negozio online dove gli oggetti (smartphone, orologi, tech) non si comprano direttamente — si ottengono partecipando. Per ogni partecipazione vieni premiato.

Plus: se hai qualcosa di valore da vendere, qui lo liquidi in ore, non mesi come eBay/Subito.

Siamo nel primo periodo pre-lancio ufficiale della piattaforma, è il momento giusto per entrare.

Provalo: {link}

Fammi sapere cosa ne pensi!
```

**EN:**

Subject: `AIROOBI · the store where items aren't bought`

Body:
```
Hi,

I wanted to recommend AIROOBI: it's an online store where items (smartphones, watches, tech) aren't bought directly — they're earned by participating. Every participation gets rewarded.

Plus: if you have something valuable to sell, here you liquidate it in hours, not months like eBay.

We're in the pre-launch period of the platform — perfect timing to join.

Try it: {link}

Let me know what you think!
```

---

## JS spec for CCP impl (paste-friendly)

Edit `src/dapp.js` `shareReferral(platform, event)` function · replace messages dict object.

```javascript
async function shareReferral(platform, event) {
  event.preventDefault();
  var link = document.getElementById('dapp-ref-link');
  link = link ? link.textContent.trim() : '';
  var lang = document.documentElement.dataset.lang || 'it';

  var messages = {
    it: {
      whatsapp: 'AIROOBI: il primo negozio online dove gli oggetti non si comprano, si ottengono partecipando. Entra adesso e sfrutta questo primo periodo pre-lancio ufficiale della piattaforma. Per ogni partecipazione vieni premiato. Curioso?\n' + link + '\nRegistrati e potrai anche vendere un tuo oggetto e non dovrai aspettare anni, mesi o settimane per venderlo, solo ore',
      telegram: 'AIROOBI: il primo negozio online dove gli oggetti non si comprano, si ottengono partecipando. Entra adesso e sfrutta questo primo periodo pre-lancio ufficiale della piattaforma. Per ogni partecipazione vieni premiato. Curioso?\n' + link + '\nRegistrati e potrai anche vendere un tuo oggetto e non dovrai aspettare anni, mesi o settimane per venderlo, solo ore',
      twitter: 'Su AIROOBI gli oggetti non si comprano, si ottengono partecipando. Per ogni partecipazione vieni premiato. Curioso? Plus: se hai qualcosa da vendere, qui lo liquidi in ore, non mesi. ' + link,
      email: {
        subject: 'AIROOBI · negozio dove gli oggetti non si comprano',
        body: 'Ciao,\n\nvolevo consigliarti AIROOBI: è un negozio online dove gli oggetti (smartphone, orologi, tech) non si comprano direttamente — si ottengono partecipando. Per ogni partecipazione vieni premiato.\n\nPlus: se hai qualcosa di valore da vendere, qui lo liquidi in ore, non mesi come eBay/Subito.\n\nSiamo nel primo periodo pre-lancio ufficiale della piattaforma, è il momento giusto per entrare.\n\nProvalo: ' + link + '\n\nFammi sapere cosa ne pensi!'
      }
    },
    en: {
      whatsapp: 'AIROOBI: the first online store where items aren\'t bought, they\'re earned by participating. Join now and take advantage of this pre-launch period of the platform. Every participation gets rewarded. Curious?\n' + link + '\nSign up and you can also sell your own item — no need to wait years, months or weeks to sell it. Only hours.',
      telegram: 'AIROOBI: the first online store where items aren\'t bought, they\'re earned by participating. Join now and take advantage of this pre-launch period of the platform. Every participation gets rewarded. Curious?\n' + link + '\nSign up and you can also sell your own item — no need to wait years, months or weeks to sell it. Only hours.',
      twitter: 'On AIROOBI items aren\'t bought, they\'re earned by participating. Every participation gets rewarded. Curious? Plus: if you have something to sell, here you liquidate it in hours, not months. ' + link,
      email: {
        subject: 'AIROOBI · the store where items aren\'t bought',
        body: 'Hi,\n\nI wanted to recommend AIROOBI: it\'s an online store where items (smartphones, watches, tech) aren\'t bought directly — they\'re earned by participating. Every participation gets rewarded.\n\nPlus: if you have something valuable to sell, here you liquidate it in hours, not months like eBay.\n\nWe\'re in the pre-launch period of the platform — perfect timing to join.\n\nTry it: ' + link + '\n\nLet me know what you think!'
      }
    }
  };

  var msg = messages[lang][platform];

  if (platform === 'whatsapp') {
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  } else if (platform === 'telegram') {
    window.open('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(msg), '_blank');
  } else if (platform === 'twitter') {
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(msg), '_blank');
  } else if (platform === 'email') {
    window.location.href = 'mailto:?subject=' + encodeURIComponent(msg.subject) + '&body=' + encodeURIComponent(msg.body);
  }
}
```

**Note:** struttura function esistente preserved (Round 8 wire OK). Solo replace messages dict object content.

---

## Acceptance criteria post-impl

Smoke verify post-deploy v4.13.2:

1. ✅ `shareReferral` function `dapp.js` messages dict aggiornato
2. ✅ WhatsApp click → opens wa.me con messaggio IT lungo + link + seller hook
3. ✅ Telegram click → opens t.me con messaggio IT (stesso content WhatsApp)
4. ✅ Twitter click → opens twitter.com/intent con messaggio IT corto (~225 char)
5. ✅ Email click → opens mailto: con subject + body strutturato
6. ✅ EN locale equivalent (test cambio lingua data-lang="en")
7. ✅ Cache buster `?v=4.13.2` su dapp.js reference
8. ✅ Version bump 4.13.1 → 4.13.2

---

## ETA stima calibrata

| Phase | ETA |
|---|---|
| Recon `shareReferral` function dapp.js (Round 8 location) | 2 min |
| Replace messages dict object IT + EN (8 strings totali: 4 IT + 4 EN) | 3-5 min |
| Smoke local (test click WhatsApp + Telegram + X + Email opens with correct preset) | 2 min |
| Version bump 4.13.1 → 4.13.2 + cache buster | 1 min |
| Audit-trail file | 3 min |
| **TOTAL nominale** | **~12-15 min** |

ETA calibrato `feedback_roby_estimate_calibration.md` -50/-70%: real estimate **~5-10 min CCP atomic**.

---

## Pattern operativi

- NO sed cascade · Edit chirurgico function content replace
- NO HTML/CSS change · pure JS content update
- Bilingue inline IT+EN preservato
- Audit-trail immediate post-commit
- Skeezu post-deploy test click su /invita loggato per verify preset messages renderizzati correttamente

---

## Lesson learned NEW · Round 12

**Pattern emerso post primi 2 referral confirmed Skeezu:**

Copy outreach per acquisition pubblico generalista ≠ copy in-app per utenti existing.

**Rule of thumb:**
- **In-app loggato:** jargon AIROOBI native OK (ARIA, ROBI, Alpha Brave, scoring v5, treasury, pity) — utente è onboarded + curva apprendimento condivisa
- **Share esterno outreach:** **CATEGORIZE in concetti familiari** (negozio online, oggetti di valore, gratis, partecipare, vendere rapido) — utente è cold + 1° contatto + audience generalista non-crypto

**Application:** ogni copy esterno (share message, OG image, email marketing, Google Ads copy, blog SEO, ecc.) deve passare "outsider audit" — leggilo come se non sapessi nulla di AIROOBI, ti convince?

Aggiungo entry breve in memoria post-deploy: `feedback_outsider_audit_copy.md` (NEW · paired con `feedback_voice_principle_04_anti_gambling_strict.md` + `feedback_brutal_honesty.md`).

---

## Bonus value-add seller dimension

**Insight Skeezu Round 12 seller add HUGE:**

AIROOBI ha 2 audience distinte:
- **Buyer side:** "voglio smartphone/orologi a sconto" → competitor: eBay, Vinted, marketplace classici
- **Seller side:** "voglio liquidare il mio Rolex/oggetto valore in tempi rapidi" → competitor: eBay (settimane), aste casa (mesi), Subito.it (settimane), Vinted (giorni ma fashion-only)

Velocità liquidazione (24-120h vs settimane/mesi) è KILLER FEATURE per seller side che NON era visibile nel share message Round 8.

Acquisition implicazione: ora share message arriva a 2x audience → 2x conversion potential (compratori curiosi + venditori frustrated da eBay slow).

---

## Closing

Round 12 micro · chirurgico · pure content replacement preset messages.

CCP, daje 5-10 min fix lampo. Skeezu riprende share full speed Voice + Username + OG + outsider-friendly compliant.

ETA hotfix totale Round 12: ~10 min CCP + ~5 min visual verify Skeezu = ~15 min recovery share campagna v4.13.2 outsider-friendly.

---

— **ROBY**

*11 May 2026 W2 Day 7 morning · canale ROBY→CCP (Round 12 share messages update post Skeezu analysis Round 8 jargon · seller side hook NEW · 3 platform variants IT+EN · ETA calibrato 5-10 min · v4.13.2 hotfix outsider-friendly)*
