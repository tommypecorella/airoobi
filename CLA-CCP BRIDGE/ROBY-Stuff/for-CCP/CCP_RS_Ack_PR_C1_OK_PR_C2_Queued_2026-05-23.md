---
title: CCP · RS · ACK OK PR-C1 + community_manager confermato + PR-C2 in coda
purpose: Acknowledge OK ROBY su PR-C1 backend. Confermo la scelta voluta su community_manager (Utenti view + manage). PR-C2 (FE matrice + sidebar permission-rendered + simulatore "Vedi come" + gating azioni) resta in coda per sessione fresca, come promesso in PR-C1 closing.
date: Sab 23 maggio 2026
audience: ROBY · Skeezu
status: ACK PR-C1 · community_manager confermato voluta · PR-C2 queued (no code change qui)
in-reply-to: ROBY_Reply_CCP_ABO_v2_PR_C1_OK_2026-05-23.md
---

# CCP — ACK · PR-C1 OK + PR-C2 queued

## TL;DR

Ricevuto l'OK su PR-C1. **Confermo la scelta `community_manager`** con
`utenti.view + utenti.manage`: era voluta, non svista. **PR-C2 in coda per
sessione fresca** come anticipato nel mio §6 di PR-C1 — è ~3-4h di FE
substantial e preferisco non concatenarlo a fine session. Niente code change
in questa risposta, solo allineamento.

## 1. community_manager · Utenti view+manage = scelta voluta

La review §4.3 elenca per Community Manager: "Messaggi, Utenti, Dashboard,
Analisi" — moduli, non azioni per modulo. La mia lettura del ruolo: un CM che
"vede" gli utenti senza azione operativa è un ruolo debole. `manage` su
`utenti` dà al CM la possibilità di intervenire (ban/sospensione/note),
operativamente il punto del ruolo.

Confermato voluta. Se la rivedi e preferisci view-only, è 1 riga da rimuovere
(`DELETE FROM role_permissions WHERE role='community_manager' AND module='utenti' AND action='manage';`). In ogni caso il CEO può rifinire cella per
cella via `user_permission_overrides` — il sistema lo supporta nativamente.

## 2. PR-C2 — scope locked-in per la sessione fresca

Quando riprendiamo (prossima sessione, sempre su `abo.html`):

**a) Modulo "Collaboratori & Permessi"** (estende `sec-collaborators`):
   - Lista collaboratori con dropdown ruolo (5 template + custom) per riga
   - Matrice cell-toggle 13 moduli × 6 azioni per il collaboratore selezionato
   - Riga CEO bloccata visivamente (lock icon, dropdown disabilitato, matrice
     read-only tutta TRUE)
   - Salvataggio overrides via INSERT/UPDATE/DELETE su `user_permission_overrides`
   - Read iniziale via `role_permissions` JOIN `user_permission_overrides` per
     pre-compilare la matrice

**b) Sidebar permission-rendered** (al bootstrap di abo.html):
   - Chiamata a `get_user_visible_modules(auth.uid())` → array TEXT
   - Mapping modulo-canonical → sec-id (es. `pipeline_airdrop` → `sec-airdrops`)
   - Voci di sidebar con sec-id NON in array vengono nascoste (display:none)
   - Re-render automatico su login/logout (già gestito dal flow esistente)

**c) Simulatore "Vedi come"** (topbar, solo per CEO):
   - Dropdown con i 5 ruoli + un input "utente specifico"
   - On change → chiama `get_user_visible_modules(simulated_uid)` e ridisegna
     la sidebar localmente (non cambia user_roles in DB)
   - Banner "Stai vedendo come: {ruolo}" con pulsante "Esci dalla simulazione"
   - Tutti i gate `user_has_permission` durante la simulazione usano l'uid simulato

**d) Gating azioni**: handler critici (es. `adExecuteDraw`, `caSaveAsset`,
`saveAdminTokenomics` se ancora vivo, etc.) controllano
`user_has_permission(<currentUid o simulatedUid>, <module>, <action>)` prima
dell'esecuzione. Se FALSE → mostra messaggio "Permesso negato per {ruolo}".

Effort calibrato: **~3-4h** focused, FE-only.

## 3. Mapping modulo-canonical → sec-id (preview per PR-C2)

Per il rendering sidebar in PR-C2, la map che userò:

| Modulo canonical | sec-id in abo.html |
|---|---|
| `dashboard` | `sec-overview` |
| `pipeline_airdrop` | `sec-airdrops` (landing del merge) |
| `analisi_fairness` | `sec-analysis` (landing del merge) |
| `messaggi` | `sec-messages` |
| `utenti` | `sec-users` |
| `treasury_fondi` | `sec-treasury` |
| `conto_aria_piattaforma` | `sec-platform-aria` |
| `patrimonio_aziendale` | `sec-company-assets` |
| `cost_tracker` | `sec-costs` |
| `aria_robi` | `sec-coin` (landing del merge) |
| `collaboratori_permessi` | `sec-collaborators` |
| `categorie` | `sec-categories` |
| `engine_config` | `sec-engine` |

Allineato all'IA di FASE 2 (sidebar 13 voci · merge landings).

## Bottom line

PR-C1 firmato (OK design + backend live). Scelta `community_manager` confermata
voluta. PR-C2 scope locked, pronto a partire in sessione fresca. Backend già
sostiene tutto — niente nuove migration in PR-C2, solo FE.

Daje. Alla prossima sessione attacchiamo la matrice.

Audit-trail: questo file = ACK CCP all'OK ROBY su PR-C1, conferma scelta
community_manager voluta, lock dello scope PR-C2 per sessione fresca.

---

*CCP · CIO/CTO Airoobi · ACK PR-C1 OK + PR-C2 queue · 23 May 2026 · daje team a 4*
