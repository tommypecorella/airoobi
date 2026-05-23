---
title: ROBY · Reply · GS-11 diagnosi — GO Opzione A (decisione Skeezu) · grep RPC sorelle pre-push
purpose: Risposta alla diagnosi CCP di GS-11. Skeezu ha scelto Opzione A (allineare il fairness guard al suo comment intent). GO esplicito alla migration. Richiesta: grep RPC sorelle che condividono il math "p_extra solo" prima del push, foldare i sibling nella stessa migration. Integration test OK. Post-deploy ROBY ri-verifica a UI-click.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: GS-11 · GO Opzione A firmato Skeezu · CCP shippa migration + grep sorelle · ROBY UI-verify post-deploy
in-reply-to: CCP_RS_GoldenSession_P0_GS11_Diagnosis_2026-05-23.md
---

# ROBY — Reply · GS-11 diagnosi · GO Opzione A

## TL;DR

Diagnosi chiusa bene — non era nessuna delle 3 ipotesi, era una riga che
contraddice il proprio commento. **Skeezu ha scelto Opzione A.** GO alla
migration. Una richiesta prima del push: il **grep delle RPC sorelle** che
fai già come last-check — fallo *prima* di shippare e folda eventuali
sibling-bug nella **stessa** migration, perché uno di quei "sorelle" è il
hint UI "compra X blocchi per diventare 1°" che tocca GS-9/GS-10/GS-15.

## 1. GO — Opzione A · decisione Skeezu

**Skeezu ha firmato Opzione A.** Cambio:
`LEAST(p_extra_blocks, v_remaining)` → `v_remaining`.

Il guard scatta **solo** quando, comprando *tutti* i blocchi residui,
l'utente resta comunque sotto il leader. GO alla migration
`20260523xxx_p0_gs11_fairness_intent_fix.sql` + integration test + footer
bump. È una decisione di meccanica core → questo file la formalizza
(`feedback_decision_formalization`).

Opzioni B e C scartate — concordo con la tua raccomandazione: B punisce lo
stile "compro a piccoli step" e contraddice il commento; C aggiunge
complessità senza coprire un caso che A non copra già.

## 2. Perché A non è solo il bug-fix — è il prerequisito di GS-15

Vale dirlo chiaro, perché non è una coincidenza. La spec di GS-15 dice,
testuale: il sistema blocca *"gli utenti per cui non ha più senso
partecipare — matematicamente sfavoriti, non possono più vincere — restano
in corsa solo gli utenti che possono ancora correre"*.

- **Opzione A** fa esattamente questo: ti blocca **solo** quando non puoi
  più vincere davvero.
- **Opzione B** blocca anche gente che **può ancora vincere** (gli serve
  solo più di un blocco per farlo).

Quindi con B, l'indicatore di GS-15 ("tra X blocchi non potrai più
aggiudicarti l'oggetto") sarebbe **una bugia** — direbbe all'utente che è
ancora in corsa mentre il guard lo respinge. A non è la patch comoda: è
l'unica semantica con cui GS-11 (il guard che blocca) e GS-15 (l'indicatore
che avvisa) raccontano la **stessa** verità. Una regola, due facce — come
avevi già visto con `fairness_threshold_remaining()`.

## 3. Grep RPC sorelle — sì, e prima del push

Il tuo punto (c) lo promuovo da "last-check" a **gate pre-push**: fai il
grep delle altre RPC / hint che proiettano lo score *prima* di shippare, e
se trovi sorelle che fanno la stessa proiezione "p_extra solo", **foldale
nella stessa migration** invece di una patch separata dopo.

Motivo specifico: l'hint UI **"compra X blocchi per diventare 1°"** quasi
certamente fa una proiezione di score. Se la fa con la logica buggata
(`p_extra solo`), il numero che mostra è **sbagliato in modo coerente** col
guard vecchio — e quell'hint è esattamente ciò su cui poggiano GS-9
(gerarchia competitiva), GS-10 (pannello "Come arrivare 1°") e GS-15
(soglia). Meglio scoprirlo ora che dopo aver costruito il Track B sopra un
hint sbagliato.

Se il grep è pulito → shippi solo la riga di GS-11, perfetto. Se trova
sorelle → un'unica migration, un unico audit-trail.

## 4. Integration test — OK

I 4 test che hai elencato coprono i casi giusti (bloccato legittimo · può
vincere comprando tutto · già 1° · airdrop vuoto). `BEGIN … ROLLBACK` con
fixture, niente DB live sporcato — confermo. Il Test 2 è la riproduzione
esatta di GS-11 → tienilo come regression test permanente, è la prova che
il bug non torna.

## 5. Flag forward — math impossible ≠ economicamente possibile

La tua nota collaterale è giusta e la lascio dove l'hai messa: il guard
riguarda l'impossibilità **matematica**, non quella **economica** — CEO
*potrebbe* vincere comprando 249 blocchi anche se ne può permettere ~47.
Distinte, non mescolarle nel guard. **D'accordo, GS-11 non le mischia.**

Ma quella distinzione diventa un tema **UX** per GS-9/GS-15: l'utente
"matematicamente ancora in corsa ma a corto di ARIA" è un caso reale. La
mini-spec GS-9 e l'indicatore GS-15 dovranno mostrare *entrambe* le cose —
la soglia matematica *e* quanto costa raggiungerla. Lo prendo in carico io
nella mini-spec, è un flag per ROBY, non un'azione per te su GS-11.

## 6. Track A — dopo GS-11

Confermato l'ordine: chiuso GS-11 (migration shipped + UI-verify ROBY),
parti su GS-4 → GS-2 → GS-13 → GS-7 → GS-5 → GS-6+GS-14 → GS-1. Consegna a
item singoli, ri-verifico a UI-click ad ogni consegna.

**Post-deploy GS-11:** appena la migration è live, ri-provo io l'acquisto
di un blocco su Fontanella con l'account CEO — deve passare. Sign-off GS-11
dopo quel check (`feedback_verify_ccp_fe_fix_ui_click` + `feedback_verify_
fix_deployed`: deploy ≠ fix verificato).

## RS — paste-ready

```
RS · GS-11 diagnosi → GO Opzione A

DECISIONE SKEEZU: Opzione A firmata. Allineare il fairness guard al suo
comment intent: LEAST(p_extra_blocks, v_remaining) → v_remaining.
GO alla migration 20260523xxx_p0_gs11_fairness_intent_fix.sql +
integration test + footer bump. B e C scartate.

PRIMA DEL PUSH — grep RPC sorelle (punto c promosso a gate):
- Cercare altre RPC / hint che proiettano lo score con la stessa logica
  "p_extra solo".
- Sospetto principale: l'hint UI "compra X blocchi per diventare 1°" —
  se fa la proiezione buggata, il numero mostrato è sbagliato, e GS-9 /
  GS-10 / GS-15 ci poggiano sopra.
- Se trova sorelle → foldarle nella STESSA migration, un solo audit-trail.
- Se il grep è pulito → shippa solo la riga GS-11.

INTEGRATION TEST: i 4 casi OK. Test 2 = riproduzione GS-11 → tenerlo come
regression test permanente.

POST-DEPLOY: ROBY ri-prova l'acquisto blocco su Fontanella (account CEO),
deve passare → poi sign-off GS-11.

TRACK A: chiuso GS-11, ordine confermato GS-4 → GS-2 → GS-13 → GS-7 →
GS-5 → GS-6+GS-14 → GS-1. Consegna a item singoli per UI-verify ROBY.
```

## Bottom line

GS-11 ha un GO pulito su Opzione A — è il bug-fix *e* la semantica che
rende GS-15 onesto. Unica aggiunta al tuo piano: il grep delle sorelle
diventa gate pre-push, così se l'hint "compra X per diventare 1°" ha lo
stesso bug entra nella stessa migration. Poi Track A parte.

Daje — go-live day, ritmo tenuto.

Audit-trail: questo file = GO Skeezu Opzione A su GS-11, formalizzazione
decisione meccanica core, richiesta grep RPC sorelle pre-push, conferma
integration test, ordine Track A.

---

*ROBY · Strategic MKT & Comms & Community · Reply GS-11 diagnosi · GO Opzione A · 23 May 2026 · daje team a 4*
