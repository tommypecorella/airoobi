---
title: ROBY · Mini-spec · GS-16 — il rullo ROBI: ROBI nascosti nei blocchi, accredito istantaneo + algoritmo di seeding
purpose: Mini-spec GS-16, ora che Skeezu ha chiarito il meccanismo. Due vie per ottenere ROBI: (a) mining-projection condizionata alla chiusura airdrop — by-design, già live. (b) IL RULLO — alcuni blocchi del pool d'acquisto nascondono 1 ROBI; minare quel blocco → +1 ROBI trasferito SUBITO al wallet, indipendente dalla chiusura. Serve un algoritmo che determina quanti ROBI vengono infilati nei blocchi di ogni airdrop. Spec dell'aggancio in pagina, del momento-reveal, del requisito accredito istantaneo. Supera il primo spec di ROBY_RS_GS16_Rullo_Hook (che ipotizzava il rullo = consolazione a chiusura — errato).
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-16 · meccanismo chiarito Skeezu · mini-spec + 1 STOP+ASK (algoritmo seeding) · verify-before-build per CCP
related: ROBY_RS_GS16_Rullo_Hook_2026-05-24.md (finding) · project_robi_mining_coherence · project_airdrop_closure_design_v3
---

# ROBY — Mini-spec · GS-16 · il rullo ROBI

## TL;DR

Skeezu ha chiarito il meccanismo. **Due vie distinte per i ROBI:**

- **(a) Mining-projection** — ogni *tot* blocchi minati (acquistati
  con ARIA), a seconda dell'airdrop, maturi ROBI. Sono tuoi **solo se
  l'airdrop si conclude correttamente**. È la proiezione "ROBI CHE
  GUADAGNI". **By-design, già live** — niente da fare.
- **(b) IL RULLO** — il rullo è l'insieme di **tutti i blocchi
  acquistabili** di un airdrop. **Alcuni blocchi nascondono 1 ROBI.**
  Quando hai la fortuna di minare uno di quei blocchi (non sai dove
  sono), guadagni 1 ROBI che va **trasferito subito al wallet**.
  Questi ROBI **non entrano nelle logiche di chiusura** dell'airdrop.

GS-16 = costruire/verificare **(b)**. Sotto: meccanismo, algoritmo di
seeding, aggancio in pagina, reveal, requisito hard. 1 STOP+ASK.

> Nota: questa mini-spec **supera** il primo spec in
> `ROBY_RS_GS16_Rullo_Hook` (lì avevo ipotizzato il rullo = la
> consolazione a chiusura — sbagliato). Il finding di quel file resta
> valido: l'aggancio in pagina non esiste, 10 blocchi test → 0 ROBI.

## 1. Il rullo — meccanismo (b)

- Ogni airdrop ha un pool di N blocchi acquistabili (es. Fontanella:
  405). **Quel pool È il rullo.**
- Un sottoinsieme di quei blocchi ha **1 ROBI "dentro"**. Quali, è
  nascosto — l'utente non lo sa.
- Quando un utente mina (acquista) un blocco che contiene un ROBI
  nascosto → **+1 ROBI**, trasferito **immediatamente** al suo wallet.
- È fortuna: minando blocchi puoi trovarne 0, 1, o più.
- Indipendenza totale dalla chiusura: i ROBI del rullo **non vengono
  considerati** nelle logiche di chiusura/aggiudicazione. Sono già
  dell'utente nell'istante in cui mina il blocco.

Differenza netta da (a): i ROBI di (a) sono *condizionati* (l'airdrop
deve chiudersi bene); i ROBI del rullo (b) sono *incondizionati e
istantanei*.

## 2. Algoritmo di seeding — quanti ROBI nel rullo (STOP+ASK)

Skeezu: *"dovrebbe esistere anche un algoritmo che determina quanti
ROBI saranno infilati nei blocchi."*

Quindi, alla creazione/approvazione di un airdrop, un algoritmo
calcola **quanti ROBI nascosti** vanno seminati nel pool di blocchi,
e li assegna a blocchi specifici (posizioni nascoste).

**STOP+ASK — questo è il punto da definire prima del build:**
- La formula del conteggio: quanti ROBI nascosti, in funzione di
  cosa? (valore oggetto · numero blocchi totali · prezzo blocco ·
  coerenza treasury). Deve essere **treasury-coerente** — stesso
  principio di `project_robi_mining_coherence`: i ROBI seminati non
  possono sbilanciare il treasury.
- Chi/cosa lo esegue: l'algoritmo gira a creazione airdrop (lato
  ABO/approvazione) e fissa il set di blocchi-con-ROBI.
- CCP: serve la tua proposta tecnica della formula + dove gira, e
  Skeezu la firma. ROBY può co-disegnare la formula se serve copy/UX
  intorno (es. "quanti ROBI nasconde questo airdrop" mostrato).

Senza la formula lockata, il build di (b) non è completo — il
seeding è metà del meccanismo.

## 3. Verify-before-build — CCP, prima cosa

Prima di costruire, CCP riferisce: **esiste già qualcosa di (b) nello
schema/RPC?**
- C'è un concetto di "blocco contiene un ROBI" nel DB (colonna/tabella
  sui blocchi)?
- La RPC `buy_blocks` accredita già ROBI istantanei per blocchi
  speciali?
- Esiste un algoritmo di seeding ROBI a creazione airdrop?

Il mio test (10 blocchi su Fontanella → 0 ROBI) è compatibile sia con
"meccanismo assente" sia con "presente ma sono stato sfortunato".
Solo CCP, guardando lo schema, può dire quale dei due. → §A
Discoveries se trovi che metà c'è già.

## 4. Aggancio "scopri ROBI nel rullo" — pagina airdrop

Elemento UI sulla pagina `/dapp/airdrop/:id` (oggi assente). Comunica
la meccanica con eccitazione, senza linguaggio gambling (Voice 04):

- **Dove:** colonna competitiva, vicino al pannello acquisto.
- **Cosa dice:** che alcuni blocchi del rullo nascondono un ROBI, e
  che minarli lo fa tuo subito. Tono "caccia/scoperta", non "azzardo".
  Bozza copy: *"Alcuni blocchi nascondono un ROBI. Minali e scopri
  quali — il ROBI trovato è subito tuo, sul wallet."*
- **Può mostrare** il numero totale di ROBI nascosti in questo airdrop
  (output dell'algoritmo §2) — "quanti", non "dove". Questo dà un
  aggancio concreto senza svelare le posizioni.

## 5. Momento-reveal — quando mini un blocco-ROBI

Quando l'acquisto include un blocco con ROBI nascosto, l'utente deve
**vederlo**: un reveal esplicito — *"Hai trovato 1 ROBI nel rullo! ·
+1 ROBI sul wallet"* — distinto dall'animazione confetti generica
dell'acquisto. Il reveal e l'accredito sono lo stesso istante.

## 6. Requisito hard — LOCKED, non negoziabile

Quando il rullo assegna un ROBI: **accredito istantaneo sul saldo
wallet + voce nello storico ROBI**, nello stesso istante del mining
del blocco. Niente stato "in arrivo", niente attesa chiusura, niente
"mostrato a schermo ma non sul saldo". È il cuore di GS-16.

## 7. Cadenza

1. **CCP** → verify-before-build §3 (cosa esiste già) + proposta
   tecnica formula seeding §2.
2. **Skeezu** → firma la formula di seeding.
3. **CCP** → build: seeding + accredito istantaneo (b) + aggancio §4
   + reveal §5.
4. **ROBY** → verifica UI-click: minare un blocco-ROBI noto (CCP può
   seminarne uno deterministico su un airdrop di test, come il seed
   GS-13) → confermare +1 ROBI istantaneo su wallet + storico.

## RS — paste-ready

```
RS · GS-16 mini-spec — il rullo ROBI

Meccanismo chiarito Skeezu. 2 vie ROBI:
(a) mining-projection "ROBI CHE GUADAGNI" — condizionata a chiusura
    airdrop, by-design, GIÀ LIVE, niente da fare.
(b) IL RULLO — il pool di tutti i blocchi acquistabili; alcuni
    blocchi nascondono 1 ROBI; minare quel blocco → +1 ROBI SUBITO
    sul wallet, indipendente dalla chiusura. GS-16 = costruire (b).

PRIMA (verify-before-build): riferisci se esiste già nello schema/RPC
un concetto di "blocco contiene ROBI", accredito istantaneo in
buy_blocks, o un algoritmo di seeding. → §A Discoveries.

STOP+ASK — algoritmo di seeding: serve una formula che, a creazione
airdrop, determina QUANTI ROBI nascosti seminare nel pool blocchi e
li assegna a blocchi specifici. Deve essere treasury-coerente
(principio robi_mining_coherence). CCP propone la formula tecnica +
dove gira, Skeezu la firma. Senza formula il build non è completo.

BUILD (dopo formula lockata):
- seeding ROBI nei blocchi a creazione airdrop;
- mining di un blocco-ROBI → +1 ROBI ISTANTANEO sul wallet + voce
  storico ROBI (requisito HARD, non negoziabile);
- aggancio "scopri ROBI nel rullo" sulla pagina airdrop (copy ROBY:
  "Alcuni blocchi nascondono un ROBI. Minali e scopri quali — il
  ROBI trovato è subito tuo, sul wallet."), può mostrare QUANTI
  ROBI nasconde l'airdrop, mai DOVE;
- momento-reveal quando mini un blocco-ROBI ("Hai trovato 1 ROBI
  nel rullo! +1 sul wallet").

VERIFICA: a build fatto, CCP semina un blocco-ROBI deterministico su
un airdrop di test → ROBY mina e verifica +1 ROBI istantaneo.

Cadenza: verify-before-build + formula → Skeezu firma → build →
UI-click ROBY.
```

## Bottom line

GS-16 ora ha un meccanismo chiaro: il rullo = blocchi col ROBI
nascosto, accredito istantaneo, separato dalla chiusura. Mancano:
(1) la formula di seeding — STOP+ASK, CCP propone / Skeezu firma; (2)
il build di (b) + aggancio + reveal. Verify-before-build per capire
quanto c'è già. Poi build, poi verifica ROBY a UI-click.

Audit-trail: questo file = mini-spec GS-16 post-chiarimento Skeezu ·
2 vie ROBI distinte (a mining-projection condizionata chiusura
by-design già live · b rullo = blocchi col ROBI nascosto, accredito
istantaneo wallet, closure-independent) · algoritmo di seeding ROBI
nei blocchi = STOP+ASK (formula treasury-coerente, CCP propone /
Skeezu firma) · verify-before-build CCP (schema/RPC/seeding già
esistenti?) · aggancio "scopri ROBI nel rullo" pagina airdrop + copy
bozza · momento-reveal al mining di un blocco-ROBI · requisito hard
locked accredito istantaneo + storico · supera il primo spec di
ROBY_RS_GS16_Rullo_Hook (rullo NON è la consolazione a chiusura) ·
cadenza verify → formula Skeezu → build → UI-click ROBY.

---

*ROBY · Strategic MKT & Comms & Community · mini-spec GS-16 rullo · 24 May 2026 · daje team a 4*
