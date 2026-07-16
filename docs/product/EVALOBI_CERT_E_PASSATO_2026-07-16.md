# Pulizia DB · Certificato EVALOBI · Gestione del passato — 16 lug 2026 (CCP)

## 1. Pulizia DB (firmata da Skeezu via domanda diretta)
- **Nessun account eliminato**: i 9 registrati sono tutti persone reali (contatore Alpha Brave intatto). Gli utenti tecnici skeezu+N erano già stati rimossi.
- **ROBI degli airdrop eliminati azzerati**: eliminati i 14 fiori `gs16_rullo_block` raccolti sulle salite dei run di test (audit trail in `events`, event `robi_test_cleanup_16lug`).
- Circolante: **138 → 124 ROBI** · nominale **€0,75 → €0,8347** (103,50 € / 124).
- **Filtro burned aggiunto alla formula unica** (`get_robi_market_data` + `snapshot_robi_price`): il futuro riscatto KAS (burn) ora riduce davvero il circolante. Restano senza filtro (da allineare quando il riscatto va live): `execute_draw`, `_get_user_available_robi`, `get_robi_history`, `get_activity_feed`.
- ⚠️ **Decisione aperta per Skeezu — doppio welcome**: 7 utenti hanno sia `alphanet_welcome` (5 ROBI) sia `alpha_live_welcome` (5 ROBI) = 35 shares potenzialmente duplicate. Non toccate senza firma: erano due grant intenzionali (era testnet + live) o un doppione?

## 2. Certificato EVALOBI
EVALOBI/history/requests erano già a 0 (puliti con gli airdrop). Costruito il sistema certificato:
- **`cert_code`** univoco formato `EVA-XXXXXX` (trigger `trg_gen_evalobi_cert` alla creazione).
- **`airdrop_code`**: snapshot testuale del codice dell'airdrop realizzato per vendere l'oggetto — sopravvive all'eliminazione dell'airdrop, presente **a prescindere dall'esito** (GO/NO_GO/NEEDS_REVIEW).
- **Pagina pubblica `/evalobi/:token`** ridisegnata come certificato: cornice doppia rossa, sigillo Oo, cert_code in evidenza, riga "Realizzato per l'airdrop #CODICE", esito, valutazione, foto, note.
- **Emissione da ABO**: EVALOBI Registry → bottone **"+ Emetti da airdrop"** (RPC `admin_mint_evalobi_for_airdrop`): scegli l'airdrop, esito, range, motivazione → certificato con codici collegati. La tabella registry mostra Certificato (link alla pagina) e Airdrop.
- Percorso classico (evaluation_requests → `admin_evaluate_request`) esteso: propaga `airdrop_id` al mint.

## 3. Gestione airdrop passati — SENZA nuove sezioni (pensata)
Principio: **il passato non abita nella navigazione, abita nei codici.** L'app ha già tutte le superfici che servono:

| Superficie | Ruolo |
|---|---|
| **Esplora** | SOLO airdrop attivi. Il passato non occupa spazio qui. |
| **Miei Airdrop → tab ARCHIVIO** (esistente) | Vetrina dei conclusi (card con esito, partecipanti, Step, € raccolti, **#codice**). |
| **Certificato EVALOBI** (`/evalobi/:token`) | L'artefatto **permanente e condivisibile** dell'oggetto: quando l'airdrop invecchia o viene archiviato, il certificato resta l'URL pubblico che lo racconta (pollution layer incluso). |
| **Ricerca in Esplora** | Ponte verso il passato: se cerchi un codice/titolo che non è tra gli attivi, l'empty-state propone "Però c'è nell'archivio: …" → salto diretto al tab ARCHIVIO. |

Regole di invecchiamento (implementate/proposte):
1. Archivio = ultimi 20 conclusi (già cappato dalla RPC) — non cresce all'infinito.
2. Oltre il cap, un airdrop resta raggiungibile SOLO tramite certificato EVALOBI e storico personale — nessuna lista lunga da mantenere.
3. (Futuro, a firma) retention: dopo N mesi i conclusi si possono comprimere in una riga di storico + certificato; i dati grezzi (blocks, participations) diventano candidati a cold storage.

Micro-fix contestuale: card archivio dicevano "BLOCCHI" → **STEP** (canone).

## Collaudo
- Trigger cert: OK (EVA-DCC979 in transazione rollback).
- Certificato live end-to-end: riga di collaudo `EVA-E23144` → pagina `/evalobi/5` verificata e poi rimossa.
