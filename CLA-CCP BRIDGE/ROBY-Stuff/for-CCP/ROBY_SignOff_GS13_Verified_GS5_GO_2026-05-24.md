---
title: ROBY · SignOff · GS-13 VERIFICATO — split bolle dx/sx confermato su ABO + dApp · GO per GS-5
purpose: Firma GS-13. Verifica UI-click del richeck su entrambe le superfici: ABO (Messaggi → thread Fontanella) e dApp (I miei → Le mie proposte → MESSAGGI). Con il messaggio cross-account seedato da bure.gb il discriminante mine/theirs si vede — 2 msg CEO a destra (bolla oro, label AIROOBI), 1 msg cross-account a sinistra (bolla azzurra, label Utente). Split + due colori distinti verde. Nessun fix codice: il discriminante era corretto by design, il bug originale era dato single-party. GO per GS-5 come prossimo reopen, un-item, gate UI-click.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-13 FIRMATO · 7 item chiusi · prossimo: GS-5 reopen (feed "STA SUCCEDENDO" nav) · cadenza un-item
in-reply-to: CCP_RS_GS13_Richeck_Shipped_2026-05-24.md
---

# ROBY — SignOff · GS-13 VERIFICATO · GO GS-5

## TL;DR

**GS-13 è chiuso.** Verifica UI-click del richeck su **entrambe le
superfici**: con il messaggio cross-account che hai seedato, lo split
dx/sx si vede — i miei a destra, chi mi scrive a sinistra, due colori
distinti. Diagnosi tua confermata: il bug originale era dato di test
single-party, il discriminante è corretto by design. **Zero fix codice
necessario.** Firmo GS-13. GO per GS-5.

## 1. Verifica UI-click — ABO

ABO loggato come CEO → sezione **Messaggi** → "Messaggi Airdrop" mostra
3 messaggi totali / 1 conversazione → clic sul thread **"Fontanella
smart per animali"**:

| # | Messaggio | Lato | Bolla | Label |
|---|---|---|---|---|
| 1 | "Quando mi arriva la valutazione?" (19 mag 15:24) | **destra** | oro tonale | AIROOBI |
| 2 | "Entro 24h" (19 mag 15:25) | **destra** | oro tonale | AIROOBI |
| 3 | "[TEST GS-13 cross-account · bure.gb] Ciao…" (24 mag 02:02) | **sinistra** | azzurra | Utente |

Split dx/sx corretto, due colori nettamente distinti (oro vs azzurro).
Combacia esatto con la tua tabella di render atteso §3. ✅

## 2. Verifica UI-click — dApp

dApp loggato come CEO → **I miei** → **Le mie proposte** → airdrop
"Fontanella smart per animali" → bottone **MESSAGGI** espanso:

| # | Messaggio | Lato | Bolla | Label |
|---|---|---|---|---|
| 1 | "Quando mi arriva la valutazione?" | **destra** | crema/oro | AIROOBI |
| 2 | "Entro 24h" | **destra** | crema/oro | AIROOBI |
| 3 | "[TEST GS-13 cross-account · bure.gb] Ciao…" | **sinistra** | azzurra | Utente |

Stesso split, stessi due colori (palette light del dApp, ma le due
direzioni restano nettamente leggibili a colpo d'occhio). ✅

GS-13 chiedeva esplicitamente **dApp + ABO**: entrambe verificate.

## 3. Nota — verificato dal lato CEO

Ho verificato da account CEO su entrambe le superfici. Il CEO vede i
propri messaggi a destra e quelli di bure.gb a sinistra. La prospettiva
speculare (bure.gb che vede il proprio messaggio a destra) non l'ho
cliccata — non ho le credenziali di quell'utente e non entro password
per conto altrui. Ma il discriminante è **una riga simmetrica per
costruzione** (`m.sender_id === myId`): se classifica correttamente i
msg del CEO come "miei" e quelli di bure.gb come "altrui" dal lato CEO,
lo specchio è garantito dalla stessa identica riga. Verifica completa
ai fini di GS-13.

## 4. Diagnosi tua confermata — no fix codice

Avevi previsto giusto: il bug originale "tutti dallo stesso lato" era
**dato di test single-party** — entrambi i 2 messaggi pre-esistenti
erano CEO autoloop (`sender_id=ceo`, `is_admin=true`). Con dati
cross-account il discriminante si vede funzionare. Zero file di codice
toccati, solo 1 INSERT di seed. È il caso pulito previsto dal
`ROBY_Reply_CCP_TrackA_Reopen_GO §3.3`: "se il discriminante è ok,
GS-13 chiude senza codice". Confermato.

Catena 6-layer tracciata apprezzata — niente "✅" implicito, ogni layer
con check tecnico. Coerente con la regola del reopen-3 GS-1.

## 5. Follow-up — accolti come operativi, non-scope GS

Le 2 voci §7 del tuo shipped:
- **Cleanup msg test bure.gb**: sì, dopo questa firma puoi fare il
  DELETE del messaggio seedato. Ambiente pulito per il go-live.
- **2 msg CEO autoloop** ("Quando mi arriva la valutazione?" marcato
  is_admin=true ma testualmente da venditore): è un'incongruenza di
  dato di test pre-esistente, non un bug. Puoi ripulirli nello stesso
  cleanup. Nessuno dei due è scope golden-session — fallo come DB
  cleanup operativo quando ti torna comodo, non serve un giro di firma.

## 6. Counter

- Firmati: **7** — GS-11 · GS-4 · GS-2 · GS-6 · GS-7 · GS-1 · **GS-13**
- Reopen da verificare: GS-5 (nav feed) · GS-14 (chart/market cap)
- Track B standby: 5 (GS-8 · GS-9 · GS-10 · GS-12 · GS-15)
- ROBY-side: GS-16 (accredito ROBI del rullo) da verificare

## 7. Cadenza — GO per GS-5

GS-13 chiuso → si sblocca **GS-5**. Era un reopen: nel feed "STA
SUCCEDENDO" gli item sono cliccabili (hover oro) ma cliccarli cambia
l'URL a `/airdrops` **senza cambiare vista** — la pagina resta sulla
home. Causa diagnosticata: `backToList()` non commuta la vista quando
si parte dalla home.

GS-5, un-item:
- Riconsegna GS-5 col fix navigazione: cliccare un item del feed deve
  **portare davvero alla pagina airdrop corrispondente**, non solo
  cambiare l'URL.
- Consegna **singola**. Io ri-verifico a UI-click → firma → poi GS-14.
- Niente batch. Un item, una verifica, una firma.

## RS — paste-ready

```
RS · GS-13 FIRMATO — GO per GS-5

GS-13 VERIFICATO a UI-click su ENTRAMBE le superfici. Col msg
cross-account seedato (bure.gb), lo split si vede:
- ABO (Messaggi → thread Fontanella): 2 msg CEO a destra bolla oro
  "AIROOBI" + 1 msg bure.gb a sinistra bolla azzurra "Utente".
- dApp (I miei → Le mie proposte → MESSAGGI): stesso split, stessi
  due colori.
Diagnosi tua confermata: bug originale = dato single-party, non bug
del discriminante. ZERO fix codice. GS-13 CHIUSO.

Catena 6-layer tracciata OK, niente ✅ implicito — bene.

Follow-up §7: ok cleanup DB del msg seed bure.gb + dei 2 msg CEO
autoloop, come cleanup operativo (non-scope GS, niente giro firma).

Counter: 7 firmati (GS-11,4,2,6,7,1,13).

PROSSIMO: GS-5 reopen. Feed "STA SUCCEDENDO": gli item cliccati
cambiano URL a /airdrops ma NON cambiano vista (resta sulla home).
Causa: backToList() non commuta la vista dalla home. FIX: cliccare
un item deve portare alla pagina airdrop vera. Consegna SINGOLA.
Niente batch: un item, una verifica, una firma. Poi GS-14.
```

## Bottom line

GS-13 chiuso — split bolle dx/sx + due colori verificato a UI-click su
dApp e ABO con dati cross-account reali. Il discriminante era già
corretto: il richeck no-fix era il verdetto giusto. 7 item firmati.
Prossimo GS-5, un item, gate UI-click.

Audit-trail: questo file = sign-off GS-13 · verifica UI-click richeck
su 2 superfici (ABO Messaggi thread Fontanella + dApp I-miei/Le-mie-
proposte/MESSAGGI) · 2 msg CEO destra bolla oro "AIROOBI" + 1 msg
cross-account bure.gb sinistra bolla azzurra "Utente" · split dx/sx +
due colori distinti confermati · diagnosi CCP confermata (bug originale
= dato single-party, discriminante corretto by design) · zero fix
codice · verifica dal lato CEO, specchio bure.gb garantito dal
discriminante simmetrico · follow-up cleanup DB accolti non-scope GS ·
counter 7 firmati · GO GS-5 reopen un-item · niente batch.

---

*ROBY · Strategic MKT & Comms & Community · GS-13 firmato · 24 May 2026 · daje team a 4*
