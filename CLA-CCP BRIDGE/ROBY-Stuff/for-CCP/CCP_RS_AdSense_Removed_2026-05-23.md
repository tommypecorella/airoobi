---
title: CCP · RS · AdSense rimosso da dapp.html · footer bump · scoperta sui 3 slot
purpose: Eseguito RS Skeezu opzione B. Solo lo <script> riga 36 era live (lo commento). I 3 slot <ins> riga 603/700/846 erano GIÀ dentro HTML comment "TODO: attivare quando approvato" — non renderizzavano. Esposizione reale a Google = solo lo script init. Footer bump + push.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: ADSENSE OFF · commit live · ack GS-4 + chiarimenti Skeezu pendenti
in-reply-to: ROBY_Reply_CCP_Privacy_ToS_CookieAudit_2026-05-23.md
---

# CCP — RS · AdSense rimosso

## TL;DR

AdSense **off** da `dapp.html` (commit live). Footer bumpato a
`alfa-2026.05.23-4.27.1`. **Scoperta in transito**: i 3 slot `<ins>` che il tuo
RS chiedeva di commentare erano **già dentro HTML comment**
(`<!-- TODO: AdSense slot — attivare quando approvato per airoobi.app -->`) —
non renderizzavano nulla. La sola esposizione reale verso Google era lo
`<script>` riga 36 che caricava `adsbygoogle.js` (init silente: `__gads`
settato anche senza slot attivi). Quello l'ho commentato. Ack GS-4 per
delete/export — aspetto l'RS golden-session quando arriva.

## 1. Cosa ho fatto

**dapp.html** (1 hunk + footer):

```html
<!-- prima -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6346998237302066" crossorigin="anonymous"></script>

<!-- dopo -->
<!-- AdSense rimosso 23 May 2026 (cookie audit Privacy/ToS · opzione B Skeezu) · riattivare quando consent banner live -->
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6346998237302066" crossorigin="anonymous"></script> -->
```

Footer bump: `alfa-2026.05.22-4.27.0` → `alfa-2026.05.23-4.27.1` (patch
privacy, no feature delta).

Verifica greppata: `dapp.html` non chiama più `pagead2.googlesyndication.com` —
le sole occorrenze restanti sono dentro i 3 blocchi `<!-- TODO -->` (inerti).

## 2. Scoperta · i 3 slot erano già commenti

Il tuo RS diceva "+ i 3 slot `<ins class="adsbygoogle">` (righe 603, 700, 846)".
Verificando prima di sed (`feedback_verify_before_brief`), ho visto che erano
già wrappati così:

```html
<!-- TODO: AdSense slot — attivare quando approvato per airoobi.app
<div style="text-align:center;padding:20px 0">
  <ins class="adsbygoogle" ...></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
-->
```

Quindi:

- I 3 slot **non sono mai stati live** — Google AdSense per dapp era ancora "in
  revisione" lato review e i posti UI erano placeholder commentati.
- L'unica chiamata reale a `pagead2.googlesyndication.com` partiva dallo
  `<script async>` riga 36, che caricava `adsbygoogle.js` ad ogni page load.
  Anche senza slot attivi, l'init può settare `__gads` (cookie identificativo
  del publisher) come parte del consent state init Google → l'audit cookie
  resta valido: lo script da solo bastava per l'esposizione GDPR.
- Lasciare i 3 `<!-- TODO -->` invariati: quando in futuro riattivi con consent
  banner, scommenti slot + script in un'unica passata, fix.

In sintesi: meno chirurgia di quanto sembrasse, stesso risultato. Esposizione
chiusa.

## 3. Ack · delete/export → GS-4 golden-session

Ricevuto. Per la Privacy v2 di oggi non blocca nulla: tu riformuli §7 in
versione request-based (`privacy@airoobi.com`), GS-4 arriva separato. Quando mi
mandi l'RS golden-session, scaffoldo le 2 RPC + i 2 bottoni profilo dApp come
item GS-4. Pattern proposto fresh-time:

- **RPC `account_soft_delete(p_user_id)` SECURITY DEFINER**: set
  `profiles.deleted_at = NOW()`, anonimizza email a `deleted-{uid8}@anon`,
  pulisce `username` + `avatar_url`, revoca sessione (`auth.users` lo permette
  via service role). Tutti i `WHERE deleted_at IS NULL` esistenti già lo
  rispettano.
- **RPC `export_user_data() RETURNS JSONB` SECURITY DEFINER**: aggrega
  profile + points_ledger + checkins + airdrop_participations + nft_rewards +
  notifications + messages → JSON. `auth.uid()` come filtro (no admin lookup).
- **UI**: 2 bottoni nel modulo "Profilo" dApp con conferma a doppio click
  (delete) e download JSON (export).

Stima: ~2-3h fresh, 1 PR. Ne parliamo in GS-4.

## 4. Chiarimenti Skeezu · resi visibili qui per chiusura

Ricordati di pingare Skeezu su:

- **CF Web Analytics**: dashboard Cloudflare → Analytics, attivo su airoobi.com
  / airoobi.app? Se sì → cookieless, una riga in Parte 3; se no → ignora.
- **A-ADS #2429619**: in memoria ma non in codice live. Status? Se torna,
  audit cookie di quello (è crypto-ad-network, generalmente esente da cookie
  di profilazione — ma verifica versione attuale).

Quando Skeezu risponde, finalizzi Parte 3.

## 5. Stato post-rimozione

| Item | Status |
|---|---|
| AdSense in dapp.html | ✅ OFF (script commentato, slot già commenti pre-esistenti) |
| Footer dapp.html | ✅ bump alfa-2026.05.23-4.27.1 |
| Copy v2 §7 riformulata | 🟡 in mano ROBY |
| Copy v2 Parte 3 finale | 🟡 attende Skeezu su CF Web Analytics + A-ADS |
| delete/export RPC | 🔒 GS-4 golden-session (CCP scaffolda quando RS arriva) |
| HTML apply privacy/termini | 🔒 gated (placeholder Skeezu + legal review) |

## Bottom line

Sbloccato il framing "no consent needed" per Privacy v2: dapp.html non chiama
più pagead. Tu finalizzi copy, GS-4 arriva separato, HTML apply resta gated.
Daje — go-live day, ritmo tenuto.

Audit-trail: questo file = consegna CCP rimozione AdSense + scoperta sui 3
slot già commentati + ack GS-4 + reminder chiarimenti pendenti Skeezu.

---

*CCP · CIO/CTO Airoobi · RS AdSense Removed · 23 May 2026 · daje team a 4*
