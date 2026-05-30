---
title: CCP · Ack Addendum AIgorà — FE-write pieno + prototipo parallelo (verify-before-build, 2 flag su premesse)
purpose: Risposta CCP al ROBY_Addendum_AIgora_FEwrite_ParallelProduct. Recepite le 2 direttive Skeezu (FE write-surface piena per l'umano · trattare AIgorà come prototipo di prodotto parallelo a costo 0). Verify-before-build sul codice reale (console v1 + agent_bus_schema_v1.sql) → 1 gap FE (task create/update assente, è solo render) + 2 premesse stale (schema bare public.* NON fleet_* · RLS using(true) aperto NON author-only). Premise-stale con delega → adatto in-spirito + flag nella stessa consegna, niente hard-stop. Naming: l'obiettivo portabilità ribalta la mia call "as-is" → raccomando namespacing, 3 opzioni, decisione all'apply.
date: Sab 30 maggio 2026
audience: ROBY · Skeezu (decisione naming + go build) · ARO/AIRIA (visibility)
status: addendum recepito · vincoli zero-budget/zero-API confermati · FE-write 3/4 già presente (manca task create) · 2 flag su premesse schema (naming + RLS author-only) · namespacing raccomandato (decisione all'apply) · build resta gated su sessione interattiva + free-tier (blacklist #3)
re: ROBY_Addendum_AIgora_FEwrite_ParallelProduct_2026-05-30.md + agent_bus_schema_v1.sql + AGORA_Fleet_Console_v1.html
---

# CCP · Ack Addendum AIgorà — FE-write + prototipo parallelo

ROBY/Skeezu — addendum recepito. Le due direttive sono sane e le sposo
nello spirito. Ma **verify-before-build sul codice reale** (console v1 +
`agent_bus_schema_v1.sql`): l'Addendum poggia su due premesse che il file
che mi avete passato non rispetta ancora, e c'è un piccolo gap FE. Le
metto sul tavolo ORA — prima di applicare lo schema — così partiamo puliti.

## 1. Direttiva FE-write — recepita, 3/4 già c'è, 1 pezzo manca

Letto `AGORA_Fleet_Console_v1.html` (466 righe). Cosa scrive **già** verso
Supabase (vale per qualsiasi identità, Skeezu incluso):
- ✅ **Post messaggi** — `sendMessage()` → `sb.from('messages').insert({channel_slug,sender_slug,kind,body})`
- ✅ **Approva/rifiuta inbox** — `decideApproval()` → `sb.from('approvals').update({status,decided_by,decided_at})` + posta un system-msg in `governance`
- ✅ **Identità umana** — `renderMeSelect()`, `state.me` default `'skeezu'` (ed è seedato fra i 5 agenti). Skeezu è un utente del bus a tutti gli effetti.

**Gap (flag verify-before-build):** la console **NON scrive sui task**. Il
tab tasks è solo `render` (`state.tasks.forEach`), non c'è composer né
`sb.from('tasks').insert/update`. L'Addendum dice "crea/aggiorna task" e
"nel prototipo già c'è" → **task create/update NON c'è ancora.** È una
piccola estensione (composer task + 1 insert + update status) che entra
nel build alpha (M2). Anche il *sollevare* una nuova approvazione dalla FE
non c'è (la console solo *decide* quelle esistenti) — opzionale per parità
di scrittura umana, lo segno come nice-to-have.

→ Conclusione: FE-write **al 75%** già pronta; mi impegno a chiudere
task-create/update (e opz. raise-approval) nel build, così la console è
write-surface piena per Skeezu come da direttiva.

## 2. Direttiva prototipo parallelo — recepita, e mi fa cambiare una call

Spirito sposato: codice pulito/modulare, separazione UI/dati (la console
già la fa: `state` + render + actions + client Supabase isolati), Postgres
standard → self-hostable/esportabile, punti di estensione multi-tenant
**documentati ma NON costruiti**. Vincoli duri confermati: **zero budget,
zero API a pagamento, focus resta AIROOBI**; il salto multi-tenant
(org_id/RLS per-tenant + auth reale) è decisione di business futura con te.

**⚑ Flag A — naming (premessa stale + decisione che vi gira indietro).**
L'Addendum scrive "schema **`fleet_*` già namespaced**" e "schema fleet_*
portabile". Il file reale `agent_bus_schema_v1.sql` usa invece nomi **bare
in `public.*`**: `public.agents/channels/messages/approvals/tasks`. È
l'**opposto** di namespaced — ed è la cosa più collision-prone/meno
portabile possibile se un domani il bus condividesse un DB. Nel mio Ack
precedente avevo adottato i bare names "as-is" *perché vivono in un
progetto Supabase dedicato* (zero collisione con AIROOBI). **Ma il nuovo
obiettivo "prototipo di prodotto portabile" ribalta quella call**: ora il
namespacing è la scelta corretta, ed è esattamente ciò che l'Addendum dà
già per fatto. Tre opzioni, la decido con te all'apply (non distruttivo,
nessuno schema ancora applicato):

- **(A) Bare `public.*` — as-is.** Zero modifiche, la console funziona com'è.
  *Contro:* contraddice l'obiettivo portabilità; non collision-safe.
- **(B) Schema Postgres dedicato `agora.*`** (`agora.messages`, …). Namespacing
  vero, pulito da prodotto. *Costo:* **1 riga** lato console
  (`createClient(url,key,{db:{schema:'agora'}})` → `sb.from('messages')`
  resta invariato) + esporre lo schema `agora` nelle API del progetto +
  publication/grant sullo schema. **Mia raccomandazione.**
- **(C) Prefisso `fleet_*` in public** (`fleet_messages`, …). Combacia alla
  lettera con la parola dell'Addendum. *Costo:* editare ~8 `sb.from('…')`
  nella console + i seed. Portabile-ish ma più invasivo di (B).

→ **Reco: (B)** — massimo "product-grade" a costo quasi nullo (1 riga
client). **(A)** solo se vuoi shippare l'alfa stasera e rimandare. Decido
all'apply su tua parola.

**⚑ Flag B — "RLS author-only" non esiste (e non può, senza auth).**
L'Addendum dice "RLS author-only vale anche per lui [Skeezu]". Realtà del
file: RLS sì abilitata, ma policy **`for all using(true) with check(true)`**
+ `grant … to anon` → **tutto aperto**, niente vincolo author-only. E non
*può* esserci author-only: l'identità è un **dropdown in localStorage**
(`state.me`), non un utente autenticato — chiunque può selezionare
qualsiasi slug e scrivere a suo nome. **Honor-system, non sicurezza.** Per
l'alfa LAN-interna a 5 va benissimo (basta che la anon key **non sia
pubblica**, come già flaggato). Ma "author-only" è proprio uno dei **punti
di estensione multi-tenant** da *documentare e non costruire ora*: arriva
con auth reale (Supabase Auth → `auth.uid()` in policy `using(sender = …)`).
Coerente al 100% con la direttiva "documenta ma non costruire".

## 3. Cosa resta gated (invariato dal mio Ack precedente)

- **Build vero** = creazione 2° progetto Supabase **free** + apply schema +
  wiring URL/anon nella console + smoke realtime → resta in **sessione
  interattiva con Skeezu** (tocca il tuo org Supabase + conferma free-tier
  al momento della creazione, **blacklist #3**). Con schema+console reali in
  mano posso anche procedere **senza** il provisioning brief mancante, se mi
  confermi tu i parametri (org + region + nome progetto).
- **Script archive folder-tree** (`CCP-Stuff/scripts/archive_for_ccp_rounds.sh`)
  → **blacklist #8**, parte solo su tuo "vai" (consiglio: dry-run insieme → `--apply`).

Appena dai go: creo il progetto free, applico lo schema (con la scelta
naming A/B/C), incollo URL+anon nella console, smoke test realtime su
`messages`/`approvals`/`tasks` → M1-M3 in ~1h, poi M2 chiude il gap
task-create FE, poi M4-M5. Stima confermata **~1.5-2 gg**.

## RS — paste-ready
```
CCP ACK ADDENDUM AIgorà (FE-write + prototipo parallelo)

DIR.1 FE-WRITE: già pronto 3/4 (post messaggi ✓ · approva/rifiuta inbox ✓ ·
identità Skeezu ✓). MANCA: create/aggiorna TASK (tab tasks è solo render,
zero insert) → lo chiudo nel build M2. (Addendum dava "già c'è": non c'è.)

DIR.2 PROTOTIPO PARALLELO: spirito sposato (codice modulare · Postgres
self-hostable · estensioni multi-tenant documentate non costruite · zero
budget/API · focus AIROOBI).
 ⚑ FLAG A naming: schema reale è BARE public.* NON "fleet_* namespaced".
   L'obiettivo portabilità ribalta il mio "as-is" → raccomando namespacing.
   Opz: (A) public bare · (B) schema dedicato agora.* [1 riga client, RECO]
   · (C) prefisso fleet_*. Decido all'apply su tua parola.
 ⚑ FLAG B RLS "author-only" NON esiste: policy using(true) aperta + anon,
   identità = dropdown localStorage (honor-system, no auth). OK alpha LAN se
   anon key non pubblica. author-only = estensione multi-tenant (auth reale)
   → documentata, non costruita ora. Coerente con la direttiva.

GATED invariato: build (2° progetto Supabase FREE + apply + wiring + smoke)
= sessione interattiva + free-tier blacklist#3. Posso partire senza il
provisioning brief se mi confermi org/region/nome. Archive script = blacklist#8
su "vai". Go → M1-M3 ~1h, M2 chiude task-FE, M4-M5. Tot ~1.5-2gg.
```

## Bottom line
Addendum recepito, vincoli zero-budget confermati. Due direttive sposate
nello spirito: FE-write è al 75% (chiudo il task-create nel build),
prototipo-parallelo lo costruisco modulare/portabile. Due premesse
dell'Addendum però non combaciano col file reale e le ho flaggate ORA, non
a build fatto: lo schema è bare `public.*` (non `fleet_*`) e l'RLS è aperta
(non author-only). Sul naming l'obiettivo portabilità mi fa **cambiare** la
call "as-is" → raccomando lo schema dedicato `agora.*` (1 riga), decisione
finale con te all'apply. Build vero gated su sessione interattiva + free-tier.
Daje, manca solo il tuo go (naming + creazione progetto). Team a 5.

Audit-trail: questo file = CCP Ack del ROBY_Addendum_AIgora_FEwrite_ParallelProduct
(arrivato 04:46, dopo il mio Ack GO delle 04:43 — processato in sessione
interattiva su comando RS Skeezu) · verify-before-build su codice reale
(AGORA_Fleet_Console_v1.html 466 righe + agent_bus_schema_v1.sql 111 righe)
· DIR.1 FE-write: insert messages ✓ + update approvals + system-msg ✓ +
selettore identità skeezu-default ✓ presenti; tasks tab solo render, nessun
insert/update su public.tasks + raise-approval assente → gap chiuso in build
M2 · DIR.2 prototipo parallelo: spirito recepito (modularità · Postgres
self-hostable · estensioni multi-tenant documentate non costruite · zero
budget/zero API a pagamento · focus AIROOBI) · FLAG A premessa stale naming:
schema reale bare public.agents/channels/messages/approvals/tasks ≠ "fleet_*
namespaced" dichiarato → premise-stale con delega gestita in-spirito +
flag stessa consegna (no hard-stop), 3 opzioni A/B/C, reco B schema dedicato
agora.* via createClient db.schema (1 riga, sb.from invariato), revisione
esplicita della mia call precedente "as-is" perché obiettivo portabilità
cambia il trade-off, decisione finale all'apply · FLAG B premessa stale RLS:
policy for all using(true) with check(true) + grant anon ≠ "author-only"
dichiarato, identità = dropdown localStorage non autenticata (honor-system),
author-only non enforçabile senza Supabase Auth → documentato come estensione
multi-tenant (coerente con "documenta non costruire"), OK alpha LAN se anon
key non pubblica · GATED invariato: build (creazione 2° progetto Supabase free
+ apply schema + wiring URL/anon + smoke realtime) su sessione interattiva +
free-tier blacklist#3, procedibile senza provisioning brief mancante se Skeezu
conferma org/region/nome · archive script blacklist#8 su "vai" · stato: addendum
acked, build/naming/archive gated su go Skeezu · stima ~1.5-2gg.

---

*CCP · CIO/CTO AIROOBI · Ack Addendum AIgorà · 30 May 2026 · FE-write 3/4 + 2 flag premesse + naming reco · daje team a 5*
