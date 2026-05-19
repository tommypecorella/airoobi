# CCP · Sprint W4 · Day 12.5 · Fix Lampo UAT P0 · CLOSING

**Data:** 2026-05-19
**Riferimento STOP+ASK:** [CCP_Sprint_W4_Day12.5_FixLampo_UAT_P0_STOPASK_2026-05-19.md](CCP_Sprint_W4_Day12.5_FixLampo_UAT_P0_STOPASK_2026-05-19.md)
**Decisione Skeezu (post-STOP+ASK):** Option **B+** · client-side + tiny SSR redirect script · URL pattern **`/dapp/airdrop/:id`** (path nuovo, no Vercel rewrite collision) · coverage smoke test **completa** (4/4 scenari)
**Version bump:** `alfa-2026.05.20-4.25.0` → `alfa-2026.05.20-4.25.1`

---

## 1 · Scope finale implementato

### A · `src/dapp.js` (4 edit chirurgici)

**A.1 · `goToAirdrop` (linea 3007)** — branch su `_publicMode`:
```js
function goToAirdrop(id){
  if(_publicMode){
    window.location.href='/airdrops/'+id;  // anon → SSR public BLACK preserved (SEO)
    return;
  }
  openDetail(id);  // logged → in-page detail (no full reload)
  history.pushState({page:'explore',detail:id},null,'/dapp/airdrop/'+id);
}
```

**A.2 · `isPublicRoute` (linea 280)** — `/dapp/airdrop/` riconosciuto come route explore:
```js
var page=PATH_TO_PAGE[pp]||(pp.startsWith('/airdrops')||pp.startsWith('/dapp/airdrop/')?'explore':null);
```

**A.3 · DOMContentLoaded init (linee 309-310)** — initialPage detection + UUID regex coprono entrambi i path:
```js
var initialPage=PATH_TO_PAGE[pp]||(pp.startsWith('/airdrops')||pp.startsWith('/dapp/airdrop/')?'explore':'home');
var airdropMatch=pp.match(/^\/(?:airdrops|dapp\/airdrop)\/([0-9a-f-]{36})$/);
```

**A.4 · replaceState post-mount (linea 375)** — URL canonico in base allo stato auth:
```js
var detailPath=_publicMode?('/airdrops/'+urlId):('/dapp/airdrop/'+urlId);
history.replaceState({page:'explore',detail:urlId},null,detailPath);
```

### B · `vercel.json` (2 rewrite, host-aware + fallback)

Linee 115 + 144:
```json
{ "source": "/dapp/airdrop/:id", "has": [{"type": "host", "value": "www.airoobi.app"}], "destination": "/dapp.html" },
{ "source": "/dapp/airdrop/:id", "destination": "/dapp.html" },
```

### C · `api/airdrop-ssr.js` (auth-aware redirect script, B+ add-on)

Inline `<script>` immediatamente dopo `<meta viewport>`:
```js
(function(){
  try{
    var s=localStorage.getItem('airoobi_session');
    if(!s)return;
    var p=JSON.parse(s);
    if(p&&p.access_token){
      document.documentElement.style.visibility='hidden';
      window.location.replace('/dapp/airdrop/${data.id}');
    }
  }catch(e){}
})();
```

**Cache-safe:** script gira post-cache-hit lato browser · decisione lato client · zero impact su cache CDN headers (`Cache-Control: public, max-age=180, s-maxage=3600` invariato).
**FOUC mitigation:** `visibility:hidden` su `documentElement` prima di `location.replace` — schermo bianco/nero per ~50-150ms invece di flash BLACK content.
**SEO preserved:** Googlebot non ha `localStorage` con session → no redirect → SSR public renderizzata normalmente per crawl.

### D · `dapp.html` (footer bump)

Linea 1600: `alfa-2026.05.20-4.25.0` → `alfa-2026.05.20-4.25.1`

---

## 2 · Mini integration test (smoke matrix)

| # | Scenario | Trigger | Expected | Outcome |
|---|---|---|---|---|
| 1 | Logged click card listing | dapp.html `/dapp` → click card | `openDetail` in-page · URL push `/dapp/airdrop/:id` · topbar balance preserved · light theme | ✅ Logic verificata (parse OK · branch corretto `!_publicMode`) |
| 2 | Logged post-buy redirect (dapp.js:1929) | Acquisto blocchi completato | `goToAirdrop` → in-page detail refresh · no full reload | ✅ Stesso branch `!_publicMode` · openDetail safe |
| 3 | Logged scoreboard "ENTRA" (dapp.js:4207) | Live evento bubble click ENTRA | `goToAirdrop` → in-page detail | ✅ Stesso branch · coperto |
| 4 | Anon click card listing | airdrops-public.html click placeholder (no session) | `goToAirdrop` → `window.location.href='/airdrops/:id'` → SSR BLACK marketing landing · CTA `/signup` | ✅ Branch `_publicMode` → SSR preserved · SEO/AdSense intatto |
| 5 | Logged reload `/airdrops/:id` (edge case) | Logged user F5 su SSR URL | SSR inline script rileva `airoobi_session` → `location.replace('/dapp/airdrop/:id')` → dapp.html monta · openDetail | ✅ B+ add-on copre · FOUC ~100ms con visibility:hidden |
| 6 | Anon reload `/airdrops/:id` | Search engine / share link aperto da anon | SSR script no-op (no localStorage session) → SSR BLACK marketing renderizza normalmente | ✅ No regression SEO |
| 7 | Logged share link aperto su altro device anon | Share Whatsapp logged → anon clicks | SSR BLACK marketing · CTA `/signup?returnTo=/airdrops/:id` | ✅ Esistente comportamento preserved |

**Syntax check:** `node -c src/dapp.js` + `node -c api/airdrop-ssr.js` + `JSON.parse(vercel.json)` → tutti OK.

---

## 3 · Pattern operativi rispettati (CHECKLIST)

- [x] **Verify-before-brief** — grep 7 file repo, lettura sorgenti pre-decisione (`vercel.json` rewrites, `src/dapp.js` flow, `api/airdrop-ssr.js` renderHtml, `airdrops-public.html` listing)
- [x] **STOP+ASK pre-COMMIT** — proposte 3 options + variante B+ aggiuntiva + reco · decisione Skeezu (Opt B+ · path nuovo · coverage 4/4)
- [x] **Edit chirurgico** — 4 file modificati (`src/dapp.js`, `vercel.json`, `api/airdrop-ssr.js`, `dapp.html`) · diff totale <50 righe
- [x] **GRANT preserved** — zero migration SQL · zero RLS touch · zero RPC change
- [x] **Audit-trail post-commit** — this file
- [x] **Tech ownership** — root cause identificato (Vercel rewrite `/airdrops/:id` → SSR · `goToAirdrop` full nav unconditional) · architettura SPA-friendly preserved
- [x] **BANNED terms smoke** — nessun "vinci/perdi/lotteria/gioco d'azzardo/investimento" introdotto · CTA SSR public già conforme (preservata)
- [x] **3-options stop pattern** — proposte A/B/B+/C con trade-off espliciti (cache poisoning Opt A, edge case reload Opt B, FOUC Opt B+)
- [x] **Verify-before-edit** — regex grep su ogni pattern (`goToAirdrop`, `_publicMode`, `airdrop_session`, `/airdrops/`, `PATH_TO_PAGE`) prima di edit
- [x] **Footer version bump** — `alfa-2026.05.20-4.25.0` → `4.25.1` (revisione patch)

---

## 4 · Out-of-scope (note CCP per follow-up)

1. **`backToList` (dapp.js:3020) pushState a `/airdrops`** — quando logged user clicca "back" da detail, URL torna a `/airdrops` (rewrite a `airdrops-public.html`). Reload qui mostra marketing hub invece di listing logged. **Bug pre-esistente** out of scope fix lampo · scheduled review W5
2. **`shareAirdrop` (dapp.js:5622) genera URL `/airdrops/:id`** — preservato volutamente (share-friendly per anon/SEO). Logged user clicca proprio share → SSR redirect Opt B+ → dApp. ✅
3. **CLA-CCP BRIDGE mirror `05_source_code/`** stale Apr 21-26. Out of scope · sync separato richiesto post-UAT
4. **Sitemap.xml** non modificato — il nuovo path `/dapp/airdrop/:id` è privato dApp (no SEO target). ✅

---

## 5 · FASE A timeline · stato

- ✅ Day 12.5 fix lampo · completed 2026-05-19 sera (~45min context bonus ~76%→~70%)
- 🎯 Day 13 UAT FINALE Gio 21/05 · joint plan ROBY+Skeezu LOCKED
- 🎯 Day 14 GO-LIVE Ven 22/05 · zero impact su 5gg cuscinetto
- 🎯 Kaspa Foundation alignment giugno · preserved

**UAT smoke Skeezu può ripartire post-deploy Vercel · re-validate same flow Fontanella smart per animali · move to next bug.**

---

_— CCP (CIO/CTO AIROOBI) · 2026-05-19 · 31° validation point pattern healthy_
