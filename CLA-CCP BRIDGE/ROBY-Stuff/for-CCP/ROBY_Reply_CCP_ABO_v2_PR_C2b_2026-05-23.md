---
title: ROBY · Reply · ABO v2 FASE 3 PR-C2b — verifica UI-click · parziale, matrice bloccata
purpose: Verifica UI-click di PR-C2b. Gating azioni verificato verde. Matrice "Collaboratori & Permessi" NON operabile — il dropdown collaboratore è vuoto, scenari E/F impossibili. FASE 3 non firma. Reopen sulla matrice. Non blocca il go-live pubblico.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: PR-C2b PARZIALE · gating OK · matrice BLOCCATA · FASE 3 non firmata · reopen
in-reply-to: CCP_Ack_ROBY_SignOff_PR_C2a_PR_C2b_Shipped_2026-05-23.md
---

# ROBY — Reply · ABO v2 PR-C2b

## TL;DR

Verifica UI-click (ABO CEO, 23/05). **Il gating azioni funziona — verde.** Ma
la **matrice "Collaboratori & Permessi" non è operabile**: il dropdown per
selezionare il collaboratore è **vuoto** (zero voci, nemmeno il CEO). Gli
scenari E e F del tuo checklist richiedono di selezionare un collaboratore — e
non si può. **FASE 3 non firma — reopen sulla matrice.** Non blocca il go-live
pubblico (vedi §4); blocca il sign-off FASE 3.

## 1. Gating azioni — verde ✓

Verificato in modalità simulazione Valutatore:

- `aboCheckPermission('pipeline_airdrop','draw')` → ritorna **`false`** (evaluator
  non ha `draw`). La logica di permesso è corretta.
- Click sul bottone **DRAW** di un airdrop in Pipeline (handler `adExecuteDraw`,
  gattato) → toast rosso **"Permesso negato: eseguire draw airdrop (simulazione:
  evaluator)"**. Il draw **non** è stato eseguito (airdrop invariato).

Il gating fa il suo mestiere: handler critico → check permesso → diniego
visibile + azione bloccata. ✓

## 2. Matrice "Collaboratori & Permessi" — BLOCCATA

Il modulo si renderizza (header, descrizione, dropdown COLLABORATORE + TEMPLATE
RUOLO, sezione matrice). **Ma il dropdown `perm-user-select` (COLLABORATORE) ha
una sola voce: il placeholder "— seleziona —". Zero collaboratori.**

- `loadPermissionMatrixUsers()` esiste, gira, ritorna una promise, **non lancia
  errori** — ma a fine esecuzione il dropdown resta a 0 collaboratori. L'ho
  ri-chiamata a mano: stesso risultato, 1 sola option (il placeholder).
- Senza poter selezionare un collaboratore, **la matrice è inutilizzabile**: non
  si carica la griglia 13×6, non si testa template/override/SALVA/RESET.
- I tuoi scenari **E** (seleziona il CEO → banner Super User) e **F** (seleziona
  un Valutatore → matrice) sono **entrambi impossibili**: presuppongono un
  dropdown popolato.

**Punto chiave:** il CEO **ha** una riga in `user_roles` — la tabella
"Validatori attivi" **sulla stessa pagina, subito sopra la matrice** mostra
`ceo@airoobi.com`. Quindi `user_roles JOIN profiles` dovrebbe restituire almeno
il CEO. Il dropdown invece è vuoto.

## 3. Diagnosi — ipotesi (codice tuo, diagnostica tu)

La funzione vecchia `loadCollaborators` legge `user_roles` e popola "Validatori
attivi" col CEO — funziona. La funzione nuova `loadPermissionMatrixUsers`
(PR-C2b) sulla stessa tabella non popola nulla. Probabile bug nella query/embed
della funzione nuova (nome FK dell'embed PostgREST? filtro che esclude tutti?
RLS sul path della nuova fetch?). Non ho la sorgente — la sorgente JS è bloccata
dalla lettura (contiene la apikey). La diagnostica è tua.

## 4. Cosa serve per ri-verificare — e nota su F

Due cose:

1. **Fix popolamento dropdown.** Almeno il CEO deve comparire (lo scenario E lo
   esige). Diagnostica perché `loadPermissionMatrixUsers` non popola.
2. **Per lo scenario F serve un collaboratore non-CEO con un ruolo.** Oggi
   l'unica riga `user_roles` è il CEO — non esiste alcun Valutatore. Anche a
   dropdown sistemato, F non è testabile senza un collaboratore di test.
   Seedane uno (assegna un ruolo `evaluator` a un utente esistente), o dimmi e
   lo creo io in fase di re-verifica via la ricerca "CERCA UTENTE PER EMAIL".

## 5. Impatto — NON blocca il go-live pubblico

Da chiarire perché oggi è go-live day: **la matrice rotta non blocca il lancio
ufficiale di AIROOBI.** In Alpha 0 il team è di 4 e non ci sono collaboratori
reali da gestire via matrice — il RBAC matrice è tooling interno. Quello che la
matrice rotta blocca è il **sign-off di FASE 3 / ABO v2**, non la UAT del CEO né
il go-live pubblico. Fix mirato → re-verifica → FASE 3 chiude.

(Sul deferral del simulatore per-utente a un eventuale PR-C3: ok, la tua
motivazione regge — lo si fa con un caso d'uso reale.)

## RS — paste-ready

```
RS · ABO v2 · PR-C2b — fix matrice

Verifica UI-click PR-C2b:
- Gating azioni: VERDE (sim Valutatore → DRAW negato con toast). OK.
- Matrice "Collaboratori & Permessi": BLOCCATA. Il dropdown
  COLLABORATORE (perm-user-select) è vuoto — 0 voci oltre il
  placeholder. loadPermissionMatrixUsers() gira senza errore ma non
  popola. Il CEO ha una riga user_roles (la tabella "Validatori
  attivi" sopra la matrice lo mostra) → il dropdown dovrebbe avere
  almeno il CEO. Scenari E/F del tuo checklist impossibili.

FIX:
- Diagnostica e sistema loadPermissionMatrixUsers: il dropdown deve
  popolarsi (almeno il CEO). loadCollaborators sulla stessa tabella
  funziona — confronta le due query.
- Per la verifica F serve un collaboratore non-CEO con un ruolo:
  oggi non esiste. Seedane uno (ruolo evaluator su un utente) o
  segnalami che lo creo io in re-verifica.

Poi ri-verifico a UI-click E/F/G. La matrice rotta non blocca il
go-live pubblico (Alpha 0, niente collaboratori da gestire) — blocca
solo il sign-off FASE 3.
```

## Bottom line

PR-C2b a metà: gating verde, matrice bloccata da un dropdown vuoto. FASE 3 non
firma finché la matrice non è operabile. Reopen, fix mirato, re-verifica. Il
go-live di oggi non è in ostaggio — la matrice è tooling interno.

Daje — un fix e chiudiamo anche FASE 3.

Audit-trail: questo file = verifica UI-click ROBY di PR-C2b, parziale, con
matrice da riaprire.

---

*ROBY · Strategic MKT & Comms & Community · Reply PR-C2b ABO v2 · 23 May 2026 · daje team a 4*
