# CCP · Sprint W4 · Day 12.5 · Fix Lampo UAT P0 · STOP+ASK pre-COMMIT

**Data:** 2026-05-19
**Trigger:** ROBY RS · UAT smoke Skeezu Dom 17/05 sera (pre-UAT-Gio-21/05 official) catch first P0 bug
**Bug:** dApp logged user click airdrop card → routed `/airdrops/:id` (SSR public BLACK theme) instead of dApp internal `openDetail()` (light theme, buy_blocks form, ARIA scoreboard)
**Context bonus:** ~76% available

---

## 1 · Verify-before-brief (root cause confermato)

Grep + read evidenza repo (snapshot 2026-05-19):

| Riferimento | Evidenza |
|---|---|
| `src/dapp.js:3006-3008` | `function goToAirdrop(id){ window.location.href='/airdrops/'+id; }` — full navigation, **nessuna auth check** |
| `src/dapp.js:2143` | Card onclick listing: `onclick="goToAirdrop('+a.id+')"` |
| `src/dapp.js:3239` | Card onclick miei airdrop |
| `src/dapp.js:4201` | Button "ENTRA" su scoreboard streaming |
| `src/dapp.js:1928` | Call programmatica post-azione |
| `src/dapp.js:374` | Init handler `if(urlId){openDetail(urlId)}` — **dead code path** per fresh load (Vercel intercetta prima che dapp.html monti) |
| `vercel.json:113` | `/airdrops` → `/airdrops-public.html` (marketing hub AdSense Fase 2 H2) |
| `vercel.json:114,142` | `/airdrops/:id` → `/api/airdrop-ssr?id=:id` (SSR public BLACK) — **questa rewrite è la causa root** |
| `api/airdrop-ssr.js:131-178` | BLACK theme palette `--black:#000000` · CTA `/signup` hard-coded · `Cache-Control: public, max-age=180, s-maxage=3600` |
| `src/dapp.js:8` | `var _publicMode=false` — flag auth-state già disponibile lato client |

**Conferma repro Skeezu:** listing in dApp logged renderizza topbar balance perché viene mostrato dentro dapp.html (route `/airdrops` rewrite a `airdrops-public.html` ma il listing reale logged è in-page tramite `navigateTo('explore')`; in alternativa è già su dapp.html shell). Il click sulla card invoca `goToAirdrop` → full nav → Vercel rewrite a SSR. Bug **deterministico** indipendente dal punto di partenza.

---

## 2 · 3 Options analizzate (ROBY brief + CCP trade-off)

### Option A · auth-based routing SSR (server-side)

**Cosa:** `/api/airdrop-ssr.js` legge JWT da cookie/Authorization, se valido → `res.writeHead(302, {Location: '/dapp?airdrop_id=:id'})`, altrimenti renderizza HTML public attuale.

**Pro:**
- Server-authoritative · funziona anche per deep-link condivisi (WhatsApp, email, social) aperti da utente loggato
- Pulizia architetturale a lungo termine

**Contro · CRITICI:**
- 🚨 **Cache poisoning rischio:** SSR risponde con `Cache-Control: public, max-age=180, s-maxage=3600`. Se cache CDN salva la 302 redirect (vista da utente loggato), anon successivi ricevono 302 a dApp privato. Mitigazione richiede `Vary: Cookie` o `Cache-Control: private` su redirect path → invalidate SEO cache benefit
- JWT decoding edge-runtime (Supabase access_token cookie name varia: `sb-vuvlmlpuhovipfwtquux-auth-token`), parsing + verify signature lato server non triviale per fix lampo
- ~1h+ stima reale (verify JWT edge, cache headers split, test anon vs logged)

**Stima:** 1h+ implementazione · ~30min testing · **rischio cache** alto

---

### Option B · client-side link fix (ROBY+Skeezu reco)

**Cosa:** Modifica `goToAirdrop(id)` in `src/dapp.js` per branchare su `_publicMode`:

```js
function goToAirdrop(id){
  if(_publicMode){
    window.location.href='/airdrops/'+id;  // anon → SSR public preserved (SEO + marketing landing)
    return;
  }
  openDetail(id);
  history.pushState({page:'explore',detail:id},null,'/airdrops/'+id);
}
```

**Pro:**
- ✅ ~20-30min context · scope chirurgico (1 funzione, 1 file)
- ✅ Zero SSR refactor · zero cache risk
- ✅ Preserva SSR public BLACK come marketing landing per anon arrivati da search engine / share social (SEO benefit Sprint W3 Area 8 confermato)
- ✅ Logged user listing → in-page detail (no full reload · feel snappy dApp)
- ✅ `_publicMode` flag già esistente · pattern noto

**Contro:**
- ⚠️ **Logged user che ricarica `/airdrops/:id` o apre deep-link da share esterno → vede SSR BLACK comunque.** Probabilmente OK per UAT (caso edge raro), ma vale flaggarlo
- Non risolve link condivisi WhatsApp/email aperti da utenti loggati (vedono marketing landing, devono cliccare CTA per tornare in dApp)

**Stima:** 20-30min implementazione · 10min smoke test · **rischio basso**

---

### Option B+ · client-side + tiny SSR redirect script (CCP suggest add-on)

**Cosa:** Option B + aggiungere script inline nel SSR `api/airdrop-ssr.js` che lato browser controlla presenza Supabase auth token in `localStorage` (o cookie) e fa `window.location.replace('/dapp?airdrop_id=:id')` se loggato.

**Pro:**
- Risolve anche edge case reload/share-deeplink per logged user
- Cache-safe: lo script gira post-cache-hit, decisione lato client
- Tiny addition (~10 LOC inline `<script>` nel SSR shell)

**Contro:**
- Flash of BLACK content (FOUC) prima del redirect ~100-200ms
- Mitigabile con `style="visibility:hidden"` finché script decide

**Stima:** Option B + 15min aggiuntivi · rischio FOUC visivo

---

### Option C · merge themes (W5+ deferred)

Refactor SSR public con tema light dApp + auth-aware CTA embed buy_blocks. Out of scope fix lampo · scheduled W5+ post-UAT.

---

## 3 · CCP recommendation

**Option B baseline + valutare add-on Option B+ se Skeezu vuole copertura edge case reload/share.**

Razionale:
1. Fix lampo timeline preservata (≤30min) · UAT smoke può ripartire stasera
2. Cache CDN safe (zero modifica SSR cache headers)
3. SEO/marketing landing SSR preservato per anon (Sprint W3 Area 8 ROI intatto)
4. Pattern noto · `_publicMode` flag già pervasive in `src/dapp.js`
5. Option B+ add-on opzionale se Skeezu vuole risolvere subito anche share-deeplink logged (10-15min extra)

---

## 4 · STOP+ASK pre-COMMIT

**Decisione richiesta a Skeezu:**

- [ ] **B** · client-side fix puro (30min, edge case reload BLACK accettato)
- [ ] **B+** · client-side + tiny SSR redirect script (45min, edge case risolto, FOUC ~150ms)
- [ ] **A** · server-side SSR auth redirect (1h+, cache risk · sconsigliato fix lampo)
- [ ] **C** · merge themes refactor (W5+, out of scope fix lampo)

**Domande secondarie:**

1. Pre Option B/B+: confermo che logged user reload `/airdrops/:id` (raro ma possibile durante UAT) può vedere BLACK accettato? O necessario coprire?
2. Per il redirect lato dApp, mantengo URL `/airdrops/:id` (in-page pushState) o switch a `/dapp/airdrop/:id` (path nuovo, no Vercel rewrite collision)?
3. Smoke test post-fix: oltre a click card listing, verificare `goToAirdrop` chiamato da line 1928 (post-buy) e 4201 (scoreboard ENTRA) — confermo full coverage?

---

## 5 · Pattern operativi preserved

- ✅ Verify-before-brief: grep + read sorgenti pre-decisione (this doc)
- ✅ STOP+ASK pre-COMMIT (3 options + reco + trade-off)
- ✅ Edit chirurgico: 1 funzione `goToAirdrop` · 1 file `src/dapp.js`
- ✅ GRANT preserved · nessuna migration SQL
- ✅ Audit-trail post-commit: `CCP_Sprint_W4_Day12.5_FixLampo_UAT_P0_Closing_2026-05-19.md`
- ✅ Mini integration test PR: smoke logged listing → click card → openDetail in-page · anon listing → click → SSR BLACK preserved
- ✅ Tech ownership · BANNED terms smoke
- ✅ FASE A timeline preservata: Day 13 UAT FINALE Gio 21/05 + fix lampo · Day 14 GO-LIVE Ven 22/05

---

**CCP standby decision Skeezu Option A/B/B+/C.**

_— CCP (CIO/CTO AIROOBI) · 2026-05-19_
