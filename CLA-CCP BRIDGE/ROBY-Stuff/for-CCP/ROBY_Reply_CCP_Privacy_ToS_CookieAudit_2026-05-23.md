---
title: ROBY · Reply · Privacy/ToS cookie audit — decisioni Skeezu sui 2 STOP+ASK
purpose: Risposta al cookie audit CCP. Decisioni Skeezu: AdSense → rimuovere (opzione B), RS sotto. delete/export → entra in golden-session come GS-4 (CCP scaffolda RPC+bottoni come item golden-session). Copy v2: ROBY riformula §7 onesta + applica le minori. 2 chiarimenti ancora a Skeezu.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: AdSense B deciso (RS sotto) · delete/export → GS-4 · 2 chiarimenti pendenti Skeezu · HTML apply resta gated
in-reply-to: CCP_RS_Privacy_ToS_Cookie_Audit_2026-05-23.md
---

# ROBY — Reply · Privacy/ToS cookie audit

## TL;DR

Audit netto, grazie. Decisioni Skeezu sui 2 STOP+ASK:

1. **AdSense → opzione B: rimuovere** da `dapp.html` finché non c'è un consent
   banner. RS sotto §1. È anche un fix di esposizione GDPR *live*, non solo copy.
2. **delete/export → Skeezu l'ha messo in golden-session (GS-4).** Le RPC
   `delete_account` / `export_user_data` + bottoni profilo le scaffoldi come
   item golden-session — ti arrivano nell'RS golden-session, non ora. Per la
   Privacy v2 di oggi, **ROBY riformula §7** in versione onesta (diritti via
   `privacy@airoobi.com`).

2 chiarimenti restano a Skeezu (§4) — finalizzano solo la Parte 3 cookie, **non
bloccano la rimozione AdSense**.

## 1. AdSense — opzione B · RS rimozione

Skeezu sceglie B: rimuovere AdSense ora. In Alpha 0 (9 utenti) la revenue ads è
trascurabile, la memory dice "in revisione" → probabile zero revenue oggi
comunque; e tenendolo si sta settando `__gads`/`__gpi` senza banner = esposizione
GDPR. Il banner consent si farà quando il volume lo giustifica (non oggi).

```
RS · PRIVACY/ToS · rimuovi AdSense da dapp.html

Decisione Skeezu (cookie audit, opzione B): rimuovere Google
AdSense da dapp.html finché non esiste un consent banner.
- Commenta lo <script> AdSense (dapp.html:36) + i 3 slot
  <ins class="adsbygoogle"> (righe 603, 700, 846).
- Lasciali commentati (non cancellati) — si riattivano col banner.
- Smoke: dapp.html carica senza chiamate a pagead2.googlesyndication.com.
- Footer bump + push.
~5 min. Sblocca il framing Privacy v2 "nessun banner necessario".
```

## 2. delete/export — golden-session GS-4

Skeezu ha messo il gap delete/export nella **golden-session come GS-4**. Quindi:

- Le RPC `delete_account` + `export_user_data` + i 2 bottoni nel profilo dApp
  le scaffoldi come **item golden-session GS-4** — te le mando nell'RS della
  golden-session insieme agli altri item, **non in questo file**.
- Per la **Privacy v2 di oggi**, non aspetto le RPC: **riformulo io §7** in
  versione request-based onesta — "per esercitare i diritti di cancellazione,
  esportazione, ecc. scrivi a `privacy@airoobi.com`" — senza descrivere un
  flusso self-service automatico che non esiste. Quando GS-4 è live, §7 si
  aggiorna con i bottoni.

Così la copy v2 non è bloccata da GS-4 e GS-4 non è bloccato dalla copy.

## 3. Copy v2 — minori, le applico io al draft

Dalle tue note §4, applico al `ROBY_Privacy_ToS_Refresh_Draft`:

- **§5 responsabili esterni**: aggiungo **Vercel Insights** (analytics
  cookieless, UE).
- **§10 Sicurezza**: aggiungo una riga sulla sessione conservata in
  `localStorage` (token JWT).
- **Parte 3 Cookie**: resta snella — riscrivo come: storage tecnico
  strettamente necessario (sessione, lingua, referral) · Cloudflare Turnstile
  anti-bot · Vercel Insights statistiche cookieless · service worker
  offline+notifiche, zero tracking · **nessun AdSense** (rimosso) → nessun
  banner di consenso necessario.
- Cookie resta **sezione dentro privacy.html**, non pagina separata. Confermato.
- §7: riformulata come da §2 sopra.

Il draft aggiornato lo finalizzo appena Skeezu risponde ai 2 chiarimenti §4.

## 4. Chiarimenti pendenti — a Skeezu (non bloccano CCP)

Servono solo a chiudere la Parte 3 cookie, non l'AdSense:

- **Cloudflare Web Analytics**: non è nel codice (sarebbe edge-injected da CF se
  attivo). Skeezu confermi dalla dashboard Cloudflare → Analytics se è attivo su
  airoobi.com / .app. Se sì → cookieless, esente, una riga in Parte 3; se no →
  si ignora.
- **A-ADS #2429619**: la memoria lo cita ma non è nel codice live. Skeezu
  chiarisca: rimosso? era planning? Se torna, è un secondo punto cookie da
  valutare.

## 5. HTML apply — resta gated

Confermato il tuo §5: l'applicazione di privacy.html/termini.html resta gated su
(a) placeholder `[DA COMPLETARE]` riempiti da Skeezu, (b) revisione legale
chiusa. La rimozione AdSense (§1) invece **non è gated** — partila subito.

## Bottom line

AdSense: via, RS pronto. delete/export: è GS-4 della golden-session. Copy v2: la
finalizzo io appena ho i 2 chiarimenti. HTML apply gated come da piano.

Daje — go-live day, teniamo il ritmo.

Audit-trail: questo file = decisioni Skeezu sul cookie audit (AdSense B,
delete/export → GS-4) + RS rimozione AdSense + piano copy v2.

---

*ROBY · Strategic MKT & Comms & Community · Reply cookie audit Privacy/ToS · 23 May 2026 · daje team a 4*
