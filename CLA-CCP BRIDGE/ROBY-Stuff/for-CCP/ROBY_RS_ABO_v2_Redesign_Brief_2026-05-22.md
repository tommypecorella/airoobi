---
title: ROBY · RS · ABO v2 — Redesign Brief per CCP
purpose: Spec implementativa del redesign ABO. 3 fasi — integrità numeri, refactor IA (22→13 moduli), layer RBAC per-modulo/per-azione con CEO unico Super User. Accompagna review UX + mockup interattivo.
date: Ven 22 maggio 2026
audience: CCP · Skeezu
status: RS BRIEF · pronto da passare a CCP · attende STOP+ASK CCP su schema RBAC
related: specs/ABO-Redesign/ROBY_ABO_UX_Functional_Review_2026-05-22.md · specs/ABO-Redesign/ABO_v2_Mockup_2026-05-22.html
---

# ABO v2 — RS Brief per CCP

## TL;DR

Redesign dell'ABO (`02_app_pages/abo.html`) in 3 fasi. Audit live completo +
review UX nel file collegato. Headline: 22 voci di menu → 13 moduli, 4 sezioni
morte (gruppo W4) da togliere dal menu, isole di numeri manuali che
contraddicono gli aggregati, e un RBAC che oggi ammette solo 2 ruoli e va
esteso a permessi per-modulo/per-azione.

**Non è un rewrite** — SPA, Supabase REST e brand restano. È refactor di
information architecture + un layer permessi.

## RS — paste-ready

```
RS · ABO v2 REDESIGN · 3 fasi

Contesto: review UX completa + mockup interattivo in
specs/ABO-Redesign/ (ROBY_ABO_UX_Functional_Review + ABO_v2_Mockup.html).
Target: 02_app_pages/abo.html. Refactor, non rewrite.

FASE 1 — Integrità numeri (basso rischio, fare per prima)
- ROBI Valuation: eliminare il campo Treasury manuale. Valore ROBI =
  Treasury Balance reale (treasury_funds) / ROBI in circolazione reale
  (nft_rewards). Una formula sola, usata da Overview, Treasury, ARIA&ROBI.
- Riconciliare il conteggio ROBI: 112 (Overview/Treasury) vs 110
  (NFT per tipo) — una query unica, capire il delta di 2.
- Patrimonio aziendale: la riga "ARIA circolante" non deve essere un
  input manuale a 0 — o la si lega a profiles.total_points o la si
  rimuove dal registro (l'ARIA circolante ha già la sua pagina).
- Ogni KPI card porta un tag di fonte: "live" (aggregato DB) o
  "inserito a mano · {data}". "AUTO" deve voler dire AUTO.

FASE 2 — Information architecture (22 voci → 13 moduli, 3 aree)
- Merge: Valutazioni+Gestione+Statistiche → "Pipeline airdrop" (una
  lista, tab di stato, azioni per riga). Analysis+Fairness Index →
  "Analisi & Fairness". ARIA Metrics+ROBI Valuation+NFT per tipo →
  "ARIA & ROBI".
- Rinominare i due "Conto AIROOBI": Tokenomics → "Conto ARIA
  piattaforma"; Finanze → "Patrimonio aziendale". Mai due voci con lo
  stesso nome.
- Gruppo "W4 · ATTO 4-6" (EVALOBI, Dispute, Swap, TX Explorer):
  TOGLIERE dal menu — oggi sono 4 pagine bianche. Dietro un flag
  "moduli in sviluppo", nascoste finché non sono costruite.
- Aree: Operations / Tesoreria / Sistema (vedi mockup per il site-map).

FASE 3 — RBAC per-modulo/per-azione
- Estendere user_roles oltre i 2 ruoli admin/evaluator: serve poter
  assegnare ogni modulo (13) e ogni azione (view/edit/approve/draw/
  reply/manage) in modo indipendente.
- Ruoli = template (Valutatore, Community Manager, Tesoriere, Analista,
  Personalizzato) che pre-riempiono la matrice.
- CEO = unico Super User: accesso totale immutabile, unico a vedere
  "Collaboratori & Permessi", non declassabile.
- Sidebar renderizzata sui permessi: un utente vede solo i moduli
  concessi.
- "Vedi ABO come…" — anteprima della vista di un ruolo per il CEO.

STOP+ASK: prima di toccare lo schema, dimmi come vuoi modellare i
permessi per-azione lato DB (estensione user_roles vs tabella
permission separata) — è una call tua. Io ho il modello logico, tu il
design tecnico.
```

## Dettaglio fasi

### FASE 1 — Integrità numeri

Il principio (dal review §4.4): ogni numero a schermo ha **una query sorgente**;
nessuna metrica derivata da un campo manuale mostrato anche altrove. Oggi lo
stesso valore ROBI è €0,8973 su Overview/Treasury e **€0,00** in ROBI Valuation,
perché quella pagina ha un campo Treasury manuale fermo a 0 (per giunta
etichettato "AUTO"). Il fix è togliere il campo manuale, non sincronizzarlo.

Tabella delle incongruenze rilevate nel review §3.C. È la fase a rischio più
basso e valore più alto — farla per prima.

### FASE 2 — Information architecture

Mapping completo 22→13 nel review §4.2. Punti che richiedono attenzione:

- **Pipeline airdrop** è il merge più grosso: la lista deve avere tab di stato
  (In valutazione / Val. completata / Presale / Sale / Conclusi / Tutti) con
  conteggi reali e azioni per riga (Modifica, Anteprima, Draw, Risultati). Le
  "Statistiche" diventano i conteggi dei tab + KPI in Dashboard, non una pagina.
- **W4 group**: non cancellare il codice di EVALOBI/Dispute/Swap/TX Explorer —
  solo rimuoverli dal site-map dietro flag. Quando sono pronti si re-inseriscono
  nell'area giusta.
- Uniformare le label dei pulsanti di refresh (oggi RICARICA / AGGIORNA /
  ANALIZZA → una sola: "Aggiorna") e il comportamento di caricamento.

### FASE 3 — RBAC

Modello logico (il *cosa*; il *come* DB è call CCP — vedi STOP+ASK):

- **13 moduli** assignabili (lista nel review §4.2 / nel mockup).
- **Azioni per modulo**: view, edit, approve, draw, reply, manage — solo quelle
  applicabili al modulo. view è il prerequisito di tutte.
- **5 template di ruolo** + Personalizzato (grant cella per cella). Dettaglio
  ruoli nel review §4.3.
- **CEO Super User**: identificato come oggi (admin via email hardcoded), riga
  bloccata nella matrice, unico a vedere il modulo Permessi.
- **Sidebar permission-rendered** + **"Vedi come"** (anteprima ruolo).
- Lo scoping per `category` del Valutatore già esiste in `user_roles` — si tiene.

Il mockup `ABO_v2_Mockup.html` mostra la matrice permessi funzionante (template
dropdown, toggle azioni, riga CEO bloccata, simulatore "Vedi come"): è il
riferimento UX di questa fase.

## Note

- Snapshot repo (21 apr) è disallineato dal live: il gruppo "W4 · ATTO 4-6" è
  in prod ma non nel mirror. Lavora sul file live.
- Migration di riferimento per lo stato attuale ruoli: `user_roles_system.sql`
  (CHECK role IN admin,evaluator) e `collaborators_rpc.sql` (admin_add_evaluator
  ecc.). L'RBAC v2 le estende, non le butta.
- Ordine consigliato: FASE 1 → 2 → 3. La 1 è indipendente e spedibile subito.

---

*ROBY · Strategic MKT & Comms & Community · RS ABO v2 Redesign Brief · 22 May 2026 · daje team a 4*
