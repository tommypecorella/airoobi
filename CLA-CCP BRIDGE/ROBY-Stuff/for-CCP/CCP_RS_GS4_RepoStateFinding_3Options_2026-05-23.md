---
title: CCP · RS · GS-4 finding repo state · delete già live · serve solo export · 3 opzioni
purpose: Pre-implementazione GS-4. Verifica repo state ha rivelato che ~50% di GS-4 è già live dal 11 apr 2026 — RPC delete_my_account() (HARD delete con blocco airdrop attivi) + bottone "Elimina account" in dapp.html Danger zone + handler FE con doppia conferma. Cookie audit del 23 May aveva grepato 4 nomi specifici (delete_account, account_soft_delete, ecc.) e mancato delete_my_account. La spec GS-4 dice "soft_delete" ma l'esistente fa hard-delete con stessa business logic (blocco se airdrop attivi). 3 opzioni con trade-off prima di scrivere codice.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: STOP pre-codice · 3 opzioni · raccomandazione A · GO richiesto
related: ROBY_RS_GoldenSession_Batch1_2026-05-23.md · CCP_RS_Privacy_ToS_Cookie_Audit_2026-05-23.md · CCP_Reanchor_ROBY_GS4_TrackA_NoCodeYet_2026-05-23.md
---

# CCP — RS · GS-4 finding repo state · 3 opzioni

## TL;DR

Prima di scrivere migration GS-4, ho fatto verify-repo-state come da
feedback `feedback_verify_before_brief`. **Finding**: la cookie audit del
23 May aveva drift — esiste già `delete_my_account()` (HARD delete, con
blocco airdrop attivi) **e** il bottone "Elimina account" in dapp.html
Profilo §Danger zone **e** l'handler FE con doppia conferma in
`src/dapp.js:172`. Tutto live dall'11 apr 2026
(`20260411152754_delete_account_rpc.sql`).

Manca solo la metà export di GS-4: `export_user_data()` RPC + bottone
"Esporta i miei dati".

La spec dice "soft_delete" pattern, l'esistente è "hard_delete" — ma
**hard-delete è una posizione GDPR più forte di soft-delete** (zero data
retention vs anonimizzazione). La Privacy v2 §7 promette "cancellazione"
— già onorata. Promette "esportazione" — questo manca.

**Stop pre-codice.** 3 opzioni con trade-off, raccomandazione A.
Attendo GO.

## 1. Cosa ho trovato — evidenza puntuale

**RPC esistente** (`supabase/migrations/20260411152754_delete_account_rpc.sql`):

```sql
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS jsonb SECURITY DEFINER ...
-- Blocca se active_participations o active_submissions
-- Hard delete chain: airdrop_messages, airdrop_blocks,
-- airdrop_participations, nft_rewards, points_ledger, checkins,
-- video_views, referral_confirmations, notifications, user_roles,
-- airdrop_manager_permissions, profiles, auth.users
-- Anonimizza: airdrops.winner_id/submitted_by/created_by, events,
-- treasury_funds.created_by → NULL
GRANT EXECUTE TO authenticated;
```

**FE bottone** (`dapp.html:1330`, sezione Profilo §Danger zone):

```html
<button onclick="showDeleteAccount()" ...>
  <span class="it">Elimina account</span>
  <span class="en">Delete account</span>
</button>
```

**FE modal con doppia conferma** (`dapp.html:203-220`): apre modal, chiede
di digitare "ELIMINA"/"DELETE" come conferma, mostra warning rosso.

**FE handler** (`src/dapp.js:172-203`): seconda conferma `confirm()`
dialog "CONFERMA DEFINITIVA", chiama `delete_my_account` via REST, gestisce
errori `active_participations`/`active_submissions`, rimuove
`airoobi_session` e redirect a `/`.

**Cosa manca** (verificato via grep su `*.html` `*.js`):
- Nessun bottone "Esporta i miei dati" / "Export my data" / "GDPR export"
- Nessuna RPC `export_user_data`/`gdpr_export`/`account_export`

## 2. Drift della cookie audit — diagnosi

Nel mio `CCP_RS_Privacy_ToS_Cookie_Audit §2.x`:

> ❌ **Nessuna RPC** `delete_account()`, `export_user_data()`,
> `gdpr_export()`, `account_soft_delete()` esiste
> ❌ Nessun bottone "Cancella account" / "Esporta i miei dati" in
> `dapp.html`

Entrambe FALSE per il delete. Avevo grepato 4 nomi specifici e mancato
`delete_my_account` (verbo + possessivo invece di sostantivo). E avevo
grepato "Cancella account" mentre il bottone live dice "Elimina account".

Sibling del `feedback_reanchor_canonical_doc` appena salvato — questa volta
era assenza di un grep generoso (regex troppo stretta) invece che drift
di item-identity. Stessa classe: lavoro su lista chiusa di stringhe
invece che pattern aperto.

## 3. La spec dice "soft" ma il live fa "hard" — diagnosi semantica

ROBY RS Batch 1 §GS-4 dice testualmente:

> Scaffoldare `account_soft_delete(p_user_id)` + `export_user_data()
> RETURNS JSONB` (SECURITY DEFINER) + 2 bottoni nel Profilo dApp (delete
> con conferma doppio click · export download JSON). Pattern come da
> tuo ack AdSense.

Il "pattern del tuo ack AdSense" che cita ROBY è il mio
`CCP_Ack_PrivacyToS_v2_Finalized §GS-4`:

> **GS-4**: pattern `account_soft_delete` + `export_user_data`
> SECURITY DEFINER + 2 bottoni profilo. Lo scaffoldo quando arriva l'RS
> golden-session.

Quindi il pattern "soft_delete" l'ho proposto io stesso 23 May AM,
**senza sapere** che esisteva già `delete_my_account` hard-delete. Drift
mio dell'altra direzione: avevo proposto soft, l'esistente è hard,
nessuno dei due l'ha incrociato fino ad ora.

**Domanda di sostanza**: hard vs soft delete — quale onora meglio GDPR?

| | Hard delete (esistente) | Soft delete (spec) |
|---|---|---|
| GDPR Art. 17 (right to erasure) | ✅ Pieno — zero data | ⚠️ Parziale — data retained anonimizzata |
| Audit trail finanziario (ledger ARIA, ROBI) | ❌ Cancellato | ✅ Anonimizzato, retained |
| Compliance fiscale (transazioni reali) | ⚠️ Rischio se utente fa redemption KAS | ✅ Audit retained |
| User-side promessa "cancellazione" Privacy §7 | ✅ Letterale | ⚠️ Funzionale ma non letterale |
| Re-registrazione stesso email | ✅ Possibile | ❌ Bloccato da unique constraint |

**Live = hard**. La promessa Privacy v2 §7 dice "cancellazione" — onorata
letteralmente. Su redemption KAS / audit fiscale **non c'è ancora niente
on-chain** in Alpha (stage testnet ARIA, no KAS reali) → hard-delete non
crea problemi di compliance fiscale **oggi**. Diventerà un problema in
Stage 2+ quando ARIA → KAS sarà attivo.

## 4. 3 opzioni · trade-off

### Opzione A · MINIMALE (raccomandata)
Build solo la parte mancante: `export_user_data()` + bottone "Esporta i
miei dati". Lasciare `delete_my_account` intatto.

**Scope**:
- Migration `20260523170000_gs4_export_user_data.sql`:
  - `export_user_data() RETURNS JSONB` SECURITY DEFINER, walk su 7
    tabelle (profiles, points_ledger, airdrop_participations, nft_rewards,
    referral_confirmations, checkins, video_views), return JSONB
    {exported_at, user_id, profile, ledger, ...}.
  - GRANT EXECUTE TO authenticated.
- FE dapp.html: bottone "Esporta i miei dati" sopra il Danger zone
  (sezione neutra, non-danger), download JSON via Blob.
- FE src/dapp.js: handler che chiama RPC, trigger download
  `airoobi-export-${YYYYMMDD}.json`.
- Integration test: chiamare RPC come utente test, validare JSONB shape.
- Footer bump dapp.html.

**Pro**:
- Minimo blast radius — nessun touch su flow delete già live & testato.
- Privacy §7 fully honored in 1 push (delete già live, export nuovo).
- GDPR-stronger (hard delete preserved).
- Stima: ~2-3h (vs ~6-8h opzione B).

**Con**:
- Spec letteralmente diceva "soft_delete" — divergenza nome RPC.
  Mitigazione: il live è semanticamente migliore (vedi §3 tabella).
- Re-registrazione email non possibile dopo delete — caso d'uso rare in
  alpha. Mitigazione: documentare nel /privacy.

### Opzione B · REFACTOR SOFT-DELETE
Sostituire `delete_my_account` (hard) con `account_soft_delete` (soft) +
build `export_user_data`.

**Scope** (in più rispetto ad A):
- Migration: DROP `delete_my_account`, CREATE `account_soft_delete()`
  che fa UPDATE profiles SET deleted_at=now(), email=anonimizzato,
  display_name='Utente cancellato', first/last_name=NULL, avatar=NULL,
  phone=NULL. DELETE su push_subscriptions/user_preferences/
  watchlist/auto_buy/wishlist (functional, no audit). KEEP
  points_ledger/airdrop_participations/nft_rewards/transactions
  (audit/finanziario).
- FE: stesso bottone "Elimina account" ma chiama `account_soft_delete`
  invece di `delete_my_account` — copy modal aggiornato ("i tuoi dati
  rimangono anonimizzati per requisiti legali" invece di "cancellati
  permanentemente").

**Pro**:
- Stage-2 ready (audit trail KAS quando attivo).
- Coerenza con spec letterale ("soft_delete").

**Con**:
- Touch su flow live testato → integration test ampio richiesto.
- User-side promessa "cancellazione permanente" cambia tono → coordinarsi
  con copy Privacy §7.
- Re-registrazione possibile (vantaggio user side) ma blocco da UNIQUE
  su email — serve gestire unique constraint con suffix.
- Stima: ~6-8h.

### Opzione C · IBRIDA
Mantieni `delete_my_account` (hard) **e** aggiungi `account_soft_delete`
(soft) + `export_user_data`. 2 bottoni: "Cancella" (soft) + "Cancella
definitivamente" (hard).

**Pro**: Massima opzionalità user-side.
**Con**: 2 flow paralleli = confusione UX + 2 bug surface. Non raccomandato.

## 5. Raccomandazione · A

**Opzione A** — minimale, in-spirito con GS-4 (Privacy §7 fully honored
in 1 push), con flag esplicito che il nome RPC nel live diverge dalla
spec ma il comportamento è GDPR-stronger.

**Razionale operativo**:
- Il drift sulla cookie audit è già 2 lezioni in 1 giornata
  (`feedback_reanchor_canonical_doc` + grep più generoso) — opzione B che
  riscrive flow live ne aggiunge una terza per benefici marginali su uno
  Stage 2 che è mesi distante.
- Privacy §7 si applica ad Alpha (ARIA testnet, nessuna compliance
  fiscale a rischio oggi).
- Opzione B la possiamo fare in Stage 2 quando i requisiti audit KAS
  diventano vincolanti — come migration di refactor mirata, non come
  emergency mid-go-live.

Per `feedback_premise_stale_with_delega`: con delega esplicita (parti
GS-4) + obiettivo chiaro (privacy §7 honored) + premise stale (spec
"soft" ma live "hard") → adatto in-spirito (Opzione A) + flaggo in
stessa consegna. Non hard-stop ma flag esplicito perché lo scope letterale
della spec ROBY cambia.

## 6. Cosa serve da te

- **GO Opzione A** → parto subito su migration `export_user_data` +
  bottone "Esporta i miei dati", merge in 2-3h, RS UI-click.
- **GO Opzione B** → riallinea timing Track A (~6-8h vs 2-3h), e
  coordina copy Privacy §7 sul tono "anonimizzato" vs "cancellato".
- **GO Opzione C** → faccio i 3 pezzi (export + soft + lasciare hard)
  ma sconsiglio (UX rumorosa).

Attendo GO entro la giornata per shippare oggi.

## RS conferma (paste-ready, se Opzione A)

```
RS · GO Opzione A — export-only

Solo export_user_data() RPC + bottone "Esporta i miei dati" sopra
Danger zone in Profilo dApp. delete_my_account già live dall'11 apr —
intatto. Privacy §7 fully honored in 1 push. Stage 2 refactor a soft-
delete quando KAS audit diventa vincolante. Stima 2-3h, merge oggi.
```

## Bottom line

Verify-repo-state ha catturato un drift mio sull'audit cookie del 23 May
AM (delete RPC mancata dal grep, bottone "Elimina" non grepato come
"Cancella"). Meglio scoperto pre-codice che post-merge.

Privacy §7 si chiude con SOLO la parte export (Opzione A) — il delete
hard è già migliore della spec soft proposta. Attendo GO.

Daje — stop catch funzionante, niente codice scritto.

Audit-trail: questo file = CCP finding repo state pre-GS-4 · drift cookie
audit (delete RPC missed) · 3 opzioni con tabella trade-off GDPR ·
raccomandazione Opzione A export-only · stop pre-codice in attesa GO.

---

*CCP · CIO/CTO Airoobi · RS GS-4 finding repo state · 23 May 2026 · daje team a 4*
