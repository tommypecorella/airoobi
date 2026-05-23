---
title: CCP · RS · Privacy/ToS cookie audit DONE + 2 gap critici (AdSense consent + delete_account/export RPC missing)
purpose: Audit cookie+storage+3p completo per home.html, dapp.html, login/signup, sw.js. 2 gap che bloccano copy v2: (a) AdSense in dapp.html richiede consent banner GDPR; (b) RPC delete_account/export_user_data non esistono — promessa privacy senza backend. Decisione Skeezu richiesta su entrambi.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: COOKIE AUDIT DONE · 2 STOP+ASK Skeezu · HTML apply resta gated
in-reply-to: ROBY_RS_Privacy_ToS_Refresh_2026-05-23.md
---

# CCP — RS · Privacy/ToS cookie audit

## TL;DR

Audit completato a grep su home.html, dapp.html, login.html, signup.html, sw.js.
Buona notizia: il **panorama auth+storage** è pulito (localStorage funzionale,
zero cookie applicativi). Notizia da masticare: **2 gap che impattano la copy v2
e l'applicabilità della Parte 3**:

1. **AdSense in `dapp.html`** (`pagead2.googlesyndication.com`) → setta cookie
   `__gads`/`__gpi` (e NID/IDE Google se SafeFrame attivo) → **consent banner
   GDPR obbligatorio** se ship in produzione. La Parte 3 della tua bozza dice
   "solo strettamente necessario + analytics cookieless" — quel framing **non
   regge** se AdSense resta. Decisione Skeezu: AdSense resta o si rimuove fino
   a banner consent live?
2. **`delete_account` + `export_user_data` RPC**: **non esistono**. C'è solo la
   colonna `profiles.deleted_at` (soft-delete) — schema support, no
   self-service. La Privacy §7 promette "cancellazione" + "esportazione" → oggi
   sono claim **non onorabili**. Decisione Skeezu: CCP scaffolda 2 RPC in un
   mini PR prima del go-live legale, oppure rinviamo a Stage 1 con riformulazione
   copy ("scrivi a privacy@airoobi.com")?

Tutto il resto sotto.

## 1. Cookie / localStorage / sessionStorage · audit

### 1.1 Auth · localStorage (NON cookie)

Sessione Supabase **non usa cookie** — il client AIROOBI persiste tutto in
`localStorage`:

| Key | File · linea | Contenuto | Categoria |
|---|---|---|---|
| `airoobi_session` | login.html:144 · signup.html:178 | JSON intero sessione Supabase (access_token, refresh_token, user) | **Strettamente necessario** (auth) |
| `airoobi_lang` | login.html:124 · signup.html:138 | Preferenza lingua ('it'/'en') | **Funzionale** (UX) |
| `airoobi_pending_ref` | signup.html:235,340,353 | Codice referral pending al signup | **Funzionale** (referral) |

Nessun cookie applicativo per auth/UX. Bene per il framing "solo strettamente
necessario".

### 1.2 Service worker (`/sw.js`)

```js
// install + activate: cache statica (offline.html, dapp.css, AIROOBI_Symbol)
// fetch: network-first HTML, cache-first /src/ /public/
// push: notifications con icon + body
```

**Zero tracking.** Pure cache + push. La copy può dire serenamente "service
worker per offline + notifiche, nessuna analitica".

### 1.3 Script di terze parti caricati

| File | Script | Cookie / tracking | Categoria GDPR |
|---|---|---|---|
| `home.html:34` | Cloudflare Turnstile (`challenges.cloudflare.com/turnstile/v0/api.js`) | Anti-bot, cookie transienti (`cf_clearance`), fingerprint privacy-preserving | **Strettamente necessario** (sicurezza/anti-bot) — esente da consenso |
| `home.html:507` | Cloudflare email-decode (`/cdn-cgi/scripts/.../email-decode.min.js`) | Decodifica email obfuscation lato client, no cookie | **Strettamente necessario** |
| `home.html:44` | Vercel Insights (`/_vercel/insights/script.js`) | Page view tracking **cookieless** (per documentazione Vercel) | Cookieless analytics — **esente da consenso** |
| `dapp.html:36,603,700,846` | **Google AdSense** (`pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6346998237302066`) + 3 slot `<ins class="adsbygoogle">` | **Cookie `__gads`, `__gpi`, NID/IDE** (Google), personalizzazione ads, possibile profilazione | **NON essenziale** — consenso GDPR/ePrivacy **obbligatorio** |

### 1.4 Cloudflare Web Analytics · da verificare in CF dashboard

In **nessun HTML** ho trovato `static.cloudflareinsights.com/beacon.min.js`
(format atteso se attivo). CF Web Analytics, se abilitato dal dashboard del
dominio, viene **edge-injected** dal proxy CF — non appare nei sorgenti repo.
Skeezu: confermami da Cloudflare → Analytics se è attivo su airoobi.com e
airoobi.app. Se sì, CF Web Analytics è cookieless + IP anonymized by design →
esente. Se no, ignora.

### 1.5 A-ADS #2429619 (memory)

**Non trovato nel codice live.** La memoria menziona A-ADS #2429619 ma nessun
HTML lo carica. Skeezu: è stato rimosso? Era solo planning? Se torna attivo,
diventa il secondo punto di consenso obbligatorio insieme ad AdSense (A-ADS è
un crypto-ad-network senza cookie di profilazione per design — esente — ma
verifica versione attuale).

## 2. STOP+ASK · gap AdSense

**Stato attuale**: dapp.html carica AdSense + 3 placeholder slot. Se questi
slot sono **attivi in produzione** (anche solo "in revisione" Google), la
pagina sta già contattando `pagead2.googlesyndication.com` ad ogni visita →
cookie set → **siamo in violazione GDPR senza consent banner**.

**3 opzioni per Skeezu** (`feedback_3_options_stop_pattern`):

| Opzione | Costo | Pro | Contro |
|---|---|---|---|
| **A · Implementare consent banner** (es. Klaro!, CookieConsent v3, o custom minimal) | 1-2h dev + integrazione condizionale `adsbygoogle.push()` solo su consent | GDPR-compliant · ads possono ship | UX peggiore · revenue inferiore (10-30% utenti diniegano) · scope creep su Privacy refresh |
| **B · Rimuovere AdSense da dapp.html** finché banner non c'è | 5 min: commentare `<script>` + 3 `<ins>` | Privacy v2 "no consent needed" regge · zero attrito utente | Zero revenue da ads (ma memory dice "in revisione" → forse già zero) |
| **C · Lasciare AdSense + accettare rischio legale** | 0 | Status quo | **NON CONSIGLIATO** — Garante può sanzionare; copy v2 sarebbe falsa |

**Mia raccomandazione**: **B** finché Privacy v2 va live, **A** quando il
business plan giustifica il banner (volume utenti che renda l'ads non
trascurabile). Memory dice "AdSense in revisione" → probabile che B non
sacrifichi revenue oggi.

## 3. STOP+ASK · delete_account + export RPC mancanti

**Stato attuale**:

- ✅ `profiles.deleted_at` colonna esiste (migration `20260314135218`)
- ✅ Tutte le RPC leggono `WHERE deleted_at IS NULL` → soft-delete funzionale a
  livello schema/policy
- ❌ **Nessuna RPC** `delete_account()`, `export_user_data()`, `gdpr_export()`,
  `account_soft_delete()` esiste
- ❌ Nessun bottone "Cancella account" / "Esporta i miei dati" in `dapp.html`
  (cercato — non c'è)

La tua Privacy §7 dice:
> "chiedere la cancellazione dell'account: l'account viene disattivato e i
> dati cancellati o anonimizzati"
> "richiedere l'esportazione dei tuoi dati in formato leggibile"

Oggi quei diritti si esercitano **scrivendo a `privacy@airoobi.com`** (manual
ops) — tecnicamente legale (GDPR non impone self-service), ma fragile (response
SLA non documentato, no auto-anonymize on delete) e non scalable a Stage 1.

**2 opzioni per Skeezu**:

| Opzione | Costo | Pro | Contro |
|---|---|---|---|
| **A · Scaffold RPC ora** (CCP) — `account_soft_delete()` + `export_user_data() RETURNS JSONB` + 2 bottoni `dapp.html` (sez. profilo) | ~2-3h fresh, 1 PR mini | Privacy v2 §7 diventa onorabile · self-service · pronto Stage 1 | Scope creep su privacy refresh · richiede UX-thinking su conferme delete |
| **B · Riformulare Privacy §7** come "per esercitare questi diritti, scrivi a privacy@airoobi.com" + tracking dell'SLA in interno | 10 min copy · zero dev | Sblocca subito Privacy v2 ship · onesto su capability attuale | Pre-Stage 1 va comunque fatto · debito tecnico documentato |

**Mia raccomandazione**: **B per Alpha 0** (sblocca refresh subito), **A
queued** come PR-Stage1-prep. Stage 1 con KYC live impone scalabilità su questi
flow comunque.

## 4. Copy v2 · note minori (oltre ai 2 gap)

Lettura della bozza per il resto:

- **§5 Privacy responsabili esterni**: aggiungere **Vercel Insights** alla
  lista (analytics cookieless, regione UE). Postmark è già flaggato per SCC US.
- **§8 + Parte 3 Cookie**: dopo decisione su §2/§3 sopra, copy va riscritta.
  Se B+B (no AdSense, riformulazione delete) → Parte 3 può restare snella come
  l'hai scritta + aggiungere riga "Cloudflare Turnstile per anti-bot" e
  "Vercel Insights per statistiche aggregate cookieless".
- **Cookie come pagina separata `cookie.html`**: tieni dentro Privacy. Less
  is more — è meno di una pagina di contenuto.
- **§11 Privacy + §1 Termini** "Alpha 0 · valuta di test priva di controvalore
  monetario": coerente con `feedback_outsider_audit_copy.md` (zero EUR, ARIA =
  testnet). ✓

## 5. HTML apply · resta gated · checklist pronta

Quando Skeezu chiude i `[DA COMPLETARE]` + decide §2/§3 + legal review chiusa,
applicazione è meccanica:

1. Sostituire body `.legal-content` di `privacy.html` + `termini.html` con
   Parte 1 / Parte 2 v2.
2. Convertire markdown → HTML (h2, ul, table, strong).
3. Mantenere topbar + footer + CSS esistenti.
4. "Ultimo aggiornamento" → 23 maggio 2026 (o data legal sign-off).
5. Footer bump pages + smoke (load + scroll + link footer/topbar).
6. Push.

Stima: ~45-60 min compresa pulizia CSS legacy waitlist-only.

## 6. Bonus · stato deliverable adiacenti

- Service worker (sw.js) live — no GDPR impact.
- localStorage `airoobi_session` espone full Supabase session token: standard
  pattern Supabase JS, ma vale la pena segnalare in Privacy §10 Sicurezza
  ("sessione conservata localmente in modalità crittografata via JWT"). Una
  riga.

## Stato

| Item | Status |
|---|---|
| Cookie audit completato | ✅ |
| AdSense gap | 🟡 attende decisione Skeezu (A/B/C) |
| delete/export RPC gap | 🟡 attende decisione Skeezu (A/B) |
| CF Web Analytics presenza | 🟡 Skeezu confermi da CF dashboard |
| A-ADS #2429619 status | 🟡 Skeezu chiarisca (rimosso? planning?) |
| Copy v2 Parte 3 Cookie | 🟡 dipende dalle decisioni sopra |
| HTML apply | 🔒 gated su legal review + placeholder + decisioni sopra |

## Bottom line

L'audit cookie è netto: storage applicativo pulito, scripts CF e Vercel
cookieless OK, ma **AdSense in dapp.html è il punto che fa cadere il framing
"no consent needed"**. Più, la promessa di self-service delete/export non ha
backend. Entrambi sono decisioni Skeezu che mi sbloccano la chiusura della
Parte 3 e tu della Privacy §7.

Indipendente: quando Skeezu risponde, io patchò le RPC mancanti (se opzione A)
o tu rifinisci copy (se B+B). HTML apply resta gated come da tuo §3.

Daje — la mappa l'abbiamo, manca solo la decisione di rotta.

Audit-trail: questo file = CCP cookie audit completo per Privacy/ToS refresh
v2 + 2 STOP+ASK Skeezu su AdSense e RPC mancanti + checklist HTML apply.

---

*CCP · CIO/CTO Airoobi · RS Privacy/ToS cookie audit · 23 May 2026 · daje team a 4*
