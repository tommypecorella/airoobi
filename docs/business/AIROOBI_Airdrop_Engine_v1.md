# AIROOBI — Airdrop Engine Specification
**Version 1.0 · 19 Marzo 2026 · DOCUMENTO FONDATIVO**

> Questo documento definisce le regole, gli algoritmi e l'architettura tecnica
> del motore di airdrop di AIROOBI. È la fonte di verità per ogni implementazione.
> Aggiornare questo documento prima di modificare qualsiasi logica di business.

---

## 1. Split Economica per Airdrop

```
100% ARIA incassato (convertito a €0,10/ARIA) =
  67,99% → Venditore P2P       (pagato in KAS, 24-48h dopo draw)
  22,00% → Fondo Comune        (aggiunto a treasury_stats automaticamente al draw)
  10,00% → Fee Piattaforma     (AIROOBI operational revenue)
   0,01% → Charity Pool        (accumulo DAO, causa selezionata dalla community)
```

**Esempio su airdrop da 10.000 ARIA (€1.000):**
- Venditore: 6.799 ARIA → KAS
- Fondo Comune: 2.200 ARIA → €220 aggiunti a treasury
- AIROOBI: 1.000 ARIA → €100
- Charity: 1 ARIA → €0,10 (arrotondamento floor)

---

## 2. Condizioni di Successo / Fallimento Airdrop

### 2.1 Airdrop completato con successo
L'airdrop si chiude con successo se è verificata ALMENO UNA delle seguenti:

**Condizione A — Tutti i blocchi venduti:**
```
blocchi_venduti = total_blocks
```

**Condizione B — Deadline raggiunta + prezzo minimo coperto:**
```
(aria_incassato × 0,10) >= seller_min_price + fee_totali
```
dove `fee_totali = aria_incassato × 0,10 × (10% + 22% + 0,01%)`

In pratica: l'airdrop è viable se il venditore riceve almeno il suo `seller_min_price`.

### 2.2 Airdrop annullato
Se alla deadline `aria_incassato × 0,10 < seller_min_price`:
- Tutti gli ARIA spesi vengono rimborsati ai partecipanti
- NFT vengono distribuiti SOLO alla top 3 per ARIA spesi nell'airdrop (consolation NFT)
- Il Fondo Comune NON viene aggiornato
- Lo stato diventa `annullato`

### 2.3 Airdrop con blocchi invenduti (ma prezzo minimo raggiunto)
- L'airdrop si chiude ugualmente con successo
- I blocchi invenduti vengono ignorati
- Il calcolo della distribuzione usa solo `aria_incassato` reale

---

## 3. Trigger del Draw

### 3.1 Modalità manuale (default)
Il draw viene attivato dal founder dall'admin panel tramite pulsante
"Esegui Draw" nella gestione airdrop.

### 3.2 Modalità automatica (flag configurabile)
Colonna `auto_draw BOOLEAN DEFAULT false` in tabella `airdrops`.
Se `auto_draw = true`:
- Al raggiungimento del 100% blocchi → draw immediato
- Alla deadline → draw automatico (cron job sul Pi ogni 15 minuti)

### 3.3 Pre-draw checks
Prima di eseguire il draw il sistema verifica:
1. Airdrop in stato `sale` o `presale`
2. Almeno 1 blocco venduto
3. Nessun draw già eseguito (`draw_executed_at IS NULL`)
4. Se deadline: condizione di successo verificata

---

## 4. Algoritmo Selezione Vincitore

### 4.1 Principio
Determinismo puro. Il vincitore è chi ha lo score più alto.
Nessuna estrazione casuale — il risultato è verificabile e riproducibile.

### 4.2 Formula Score

```
score(utente) = (F1 × w1) + (F2 × w2) + (F3 × w3)
```

**F1 — Peso blocchi acquistati (chi partecipa di più):**
```
F1 = blocchi_utente_corrente / max_blocchi_singolo_utente_in_airdrop
```
Normalizzato 0→1. Chi ha il massimo dei blocchi ottiene F1=1.

**F2 — Fedeltà alla categoria (chi ha già speso in quella categoria):**
```
F2 = log(1 + aria_spesi_categoria_storico) /
     log(1 + max_aria_spesi_categoria_tra_tutti_partecipanti)
```
- `aria_spesi_categoria_storico` = totale ARIA spesi in airdrop della stessa categoria,
  ESCLUSO l'airdrop corrente, da tutti i tempi
- Usa logaritmo per evitare che chi ha speso 10.000 ARIA schiacci chi ne ha 100
- Normalizzato 0→1

**F3 — Seniority (chi è entrato prima e ha comprato prima):**
```
F3 = (α × rank_registrazione_norm) + (β × rank_primo_blocco_norm)
α = 0,4 (peso data registrazione)
β = 0,6 (peso data primo blocco nell'airdrop — più recente e rilevante)

rank_norm = 1 - ((rank - 1) / (n_partecipanti - 1))
```
- `rank_registrazione`: posizione dell'utente per data di registrazione (1 = primo)
- `rank_primo_blocco`: posizione per data/ora del primo blocco acquistato nell'airdrop (1 = primo)
- Chi si è registrato prima e ha comprato prima ottiene F3 più alto

**Pesi configurabili da admin (tabella `airdrop_config`):**
```
w1 = 0,50  (default — partecipazione diretta)
w2 = 0,30  (default — fedeltà categoria)
w3 = 0,20  (default — seniority)
```

### 4.3 Gestione parità
In caso di score identico (raro ma possibile):
1. Vince chi ha acquistato il primo blocco prima (timestamp)
2. Se ancora pari: vince chi si è registrato prima

### 4.4 Esempio pratico

| Utente | Blocchi | Storico cat. | Registrato | Primo blocco | Score |
|---|---|---|---|---|---|
| Alice | 50/100 | 500 ARIA | #1 | #3 | 0,50×1,0 + 0,30×0,8 + 0,20×0,7 = 0,88 |
| Bob | 30/100 | 2.000 ARIA | #5 | #1 | 0,50×0,6 + 0,30×1,0 + 0,20×1,0 = 0,80 |
| Carlo | 100/100 | 100 ARIA | #2 | #2 | 0,50×1,0 + 0,30×0,3 + 0,20×0,9 = 0,77 |

**Vincitore: Alice** — ha il miglior bilanciamento tra blocchi e fedeltà.
(Carlo ha più blocchi ma zero storico. Bob ha storico alto ma pochi blocchi.)

---

## 5. Distribuzione NFT ai Perdenti (Non-Vincitori)

### 5.1 Principio anti-inflazione
La distribuzione NFT non deve erodere il prezzo unitario della Tessera Rendimento.

**Vincolo matematico:**
```
prezzo_nft_attuale = treasury_balance / nft_circolante
max_nft_distribuibili = floor(contributo_fondo / prezzo_nft_attuale)
```
Se il numero di NFT calcolati supera `max_nft_distribuibili` → scala proporzionalmente.

Questo garantisce che dopo ogni airdrop il prezzo NFT rimanga stabile o cresca leggermente.

### 5.2 Regola a fasi (mining con halvings)

| Fase | NFT per perdente | Condizione minima |
|---|---|---|
| Alpha Brave | 1 NFT ogni 5 blocchi acquistati | Minimo 1 NFT garantito |
| Alpha Wise | 1 NFT ogni 10 blocchi acquistati | Minimo 1 NFT garantito |
| Beta | 1 NFT ogni 20 blocchi acquistati | Minimo 1 se ≥ 5 blocchi |
| Pre-Prod | 1 NFT ogni 50 blocchi acquistati | Solo top 10% per blocchi |
| Mainnet | Solo top 3 per ARIA spesi | 1 NFT ciascuno, nessun altro |

La fase viene letta da `airdrop_config.current_phase` (configurabile da admin).

### 5.3 Calcolo per airdrop annullato
Se l'airdrop è annullato (prezzo minimo non raggiunto):
- NFT distribuiti SOLO alla top 3 per ARIA spesi nell'airdrop
- 1 NFT ciascuno (consolation prize)
- Il Fondo Comune NON viene toccato

### 5.4 Processo di distribuzione
```
Per ogni perdente (ordinati per ARIA spesi DESC):
  1. Calcola nft_teorici = floor(blocchi_acquistati / divisore_fase)
  2. Applica minimo della fase
  3. Applica cap anti-inflazione proporzionale
  4. Inserisci in nft_rewards: nft_teorici record con
     nft_type = 'NFT_REWARD'
     source = 'airdrop_draw'
     airdrop_id = [id airdrop]
     metadata = {airdrop_title, draw_date, blocks_owned, score}
```

---

## 6. Processo Draw Completo (Step by Step)

```
STEP 1 — Pre-draw validation
  - Verifica stato airdrop (sale/presale)
  - Verifica draw_executed_at IS NULL
  - Calcola aria_incassato totale
  - Determina successo/fallimento (sezione 2)

STEP 2 — Calcola split economica
  - fondo_contributo = aria_incassato × 22% × 0,10
  - airoobi_fee = aria_incassato × 10% × 0,10
  - charity_contrib = aria_incassato × 0,01% × 0,10
  - venditore_payout = aria_incassato × 67,99% × 0,10

STEP 3 — Seleziona vincitore (se airdrop success)
  - Calcola score per ogni partecipante (sezione 4)
  - Ordina DESC per score
  - Winner = primo della lista

STEP 4 — Distribuisci NFT ai perdenti
  - Leggi fase corrente da airdrop_config
  - Calcola max_nft_distribuibili (sezione 5.1)
  - Per ogni non-vincitore: calcola e inserisci NFT (sezione 5.4)

STEP 5 — Aggiorna treasury
  - UPDATE treasury_stats: balance_eur += fondo_contributo
  - Inserisci record in treasury_transactions (storico)

STEP 6 — Aggiorna airdrop
  - winner_id = utente vincitore
  - status = 'completed' (o 'annullato')
  - draw_executed_at = NOW()
  - venditore_payout_eur = venditore_payout
  - airoobi_fee_eur = airoobi_fee
  - charity_contrib_eur = charity_contrib

STEP 7 — Notifiche
  - Vincitore: notifica "Hai vinto! [oggetto]"
  - Perdenti: notifica "Hai ricevuto [N] Tessere Rendimento"
  - Venditore: notifica "Il tuo airdrop è concluso. Riceverai €X in KAS"
  - Admin: email report draw completato

STEP 8 — Track events
  - Inserisci eventi in events table per analytics
```

---

## 7. Schema DB — Tabelle Nuove e Modifiche

### 7.1 Tabella `airdrop_config` (nuova)
```sql
CREATE TABLE airdrop_config (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key             TEXT UNIQUE NOT NULL,
  value           TEXT NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Valori iniziali
INSERT INTO airdrop_config (key, value, description) VALUES
  ('current_phase', 'alpha_brave', 'Fase attuale piattaforma'),
  ('score_w1', '0.50', 'Peso blocchi corrente nell algoritmo vincitore'),
  ('score_w2', '0.30', 'Peso fedeltà categoria'),
  ('score_w3', '0.20', 'Peso seniority'),
  ('score_alpha_f3', '0.40', 'Peso registrazione in F3'),
  ('score_beta_f3', '0.60', 'Peso primo blocco in F3'),
  ('split_fondo', '0.22', 'Percentuale Fondo Comune'),
  ('split_airoobi', '0.10', 'Percentuale fee piattaforma'),
  ('split_charity', '0.0001', 'Percentuale charity pool'),
  ('nft_divisor_alpha_brave', '5', 'Blocchi per NFT in Alpha Brave'),
  ('nft_divisor_alpha_wise', '10', 'Blocchi per NFT in Alpha Wise'),
  ('nft_divisor_beta', '20', 'Blocchi per NFT in Beta'),
  ('nft_divisor_preprod', '50', 'Blocchi per NFT in Pre-Prod'),
  ('auto_draw_cron_minutes', '15', 'Frequenza check cron auto-draw (minuti)');

-- RLS: solo admin può modificare, authenticated può leggere
ALTER TABLE airdrop_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_read" ON airdrop_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "config_write" ON airdrop_config FOR ALL TO service_role USING (true);
```

### 7.2 Modifiche tabella `airdrops`
```sql
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS auto_draw BOOLEAN DEFAULT false;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS draw_executed_at TIMESTAMPTZ;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES profiles(id);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS winner_score NUMERIC(10,6);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS venditore_payout_eur NUMERIC(10,2);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS airoobi_fee_eur NUMERIC(10,2);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS charity_contrib_eur NUMERIC(10,4);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS fondo_contributo_eur NUMERIC(10,2);
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS aria_incassato INTEGER DEFAULT 0;
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS draw_scores JSONB;
-- draw_scores: array [{user_id, score, f1, f2, f3, blocks, rank}] per audit
```

### 7.3 Tabella `treasury_transactions` (nuova)
```sql
CREATE TABLE treasury_transactions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  airdrop_id    UUID REFERENCES airdrops(id),
  amount_eur    NUMERIC(10,2) NOT NULL,
  type          TEXT NOT NULL, -- 'airdrop_contribution' | 'buyback' | 'manual'
  treasury_before NUMERIC(10,2),
  treasury_after  NUMERIC(10,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treasury_read_admin" ON treasury_transactions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
    AND email IN ('tommaso.pecorella+ceo@outlook.com','ceo@airoobi.com')
  ));
```

### 7.4 Modifiche tabella `airdrop_blocks`
```sql
ALTER TABLE airdrop_blocks ADD COLUMN IF NOT EXISTS is_winner_block BOOLEAN DEFAULT false;
-- Marca i blocchi appartenenti al vincitore per visualizzazione post-draw
```

### 7.5 Modifiche tabella `nft_rewards`
```sql
ALTER TABLE nft_rewards ADD COLUMN IF NOT EXISTS airdrop_id UUID REFERENCES airdrops(id);
ALTER TABLE nft_rewards ADD COLUMN IF NOT EXISTS metadata JSONB;
-- metadata: {airdrop_title, draw_date, blocks_owned, score, rank}
```

---

## 8. RPC Supabase — Funzioni da Implementare

### 8.1 `execute_draw(p_airdrop_id UUID)`
La funzione principale. Tutta la logica del draw in una transazione atomica.

```sql
CREATE OR REPLACE FUNCTION execute_draw(p_airdrop_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $
DECLARE
  v_airdrop RECORD;
  v_config RECORD;
  v_aria_incassato INTEGER;
  v_success BOOLEAN;
  v_winner_id UUID;
  v_winner_score NUMERIC;
  v_fondo_eur NUMERIC;
  v_airoobi_eur NUMERIC;
  v_charity_eur NUMERIC;
  v_venditore_eur NUMERIC;
  v_treasury_before NUMERIC;
  v_scores JSONB;
  v_phase TEXT;
  v_nft_divisor INTEGER;
  v_nft_max INTEGER;
  v_prezzo_nft NUMERIC;
BEGIN
  -- 1. Lock e load airdrop
  SELECT * INTO v_airdrop FROM airdrops
  WHERE id = p_airdrop_id FOR UPDATE;

  IF NOT FOUND THEN RETURN '{"ok":false,"error":"AIRDROP_NOT_FOUND"}'::JSONB; END IF;
  IF v_airdrop.draw_executed_at IS NOT NULL THEN
    RETURN '{"ok":false,"error":"DRAW_ALREADY_EXECUTED"}'::JSONB;
  END IF;
  IF v_airdrop.status NOT IN ('sale','presale') THEN
    RETURN '{"ok":false,"error":"INVALID_STATUS"}'::JSONB;
  END IF;

  -- 2. Calcola totale ARIA incassato
  SELECT COALESCE(SUM(aria_spent), 0) INTO v_aria_incassato
  FROM airdrop_blocks WHERE airdrop_id = p_airdrop_id;

  IF v_aria_incassato = 0 THEN
    RETURN '{"ok":false,"error":"NO_BLOCKS_SOLD"}'::JSONB;
  END IF;

  -- 3. Leggi config pesi
  -- (legge da airdrop_config, usa default se non trovato)

  -- 4. Verifica successo/fallimento
  v_success := (v_aria_incassato * 0.10) >= v_airdrop.seller_min_price;

  -- 5. Calcola split
  v_fondo_eur := ROUND(v_aria_incassato * 0.10 * 0.22, 2);
  v_airoobi_eur := ROUND(v_aria_incassato * 0.10 * 0.10, 2);
  v_charity_eur := ROUND(v_aria_incassato * 0.10 * 0.0001, 4);
  v_venditore_eur := ROUND(v_aria_incassato * 0.10 * 0.6799, 2);

  IF v_success THEN
    -- 6. Calcola scores e seleziona vincitore
    -- (logica complessa — vedi sezione 4)
    -- v_scores = JSON array di tutti gli score
    -- v_winner_id = utente con score massimo

    -- 7. Distribuisci NFT ai perdenti
    -- (vedi sezione 5)

    -- 8. Aggiorna treasury
    SELECT COALESCE(balance_eur, 0) INTO v_treasury_before
    FROM treasury_stats ORDER BY created_at DESC LIMIT 1;

    INSERT INTO treasury_transactions
      (airdrop_id, amount_eur, type, treasury_before, treasury_after)
    VALUES
      (p_airdrop_id, v_fondo_eur, 'airdrop_contribution',
       v_treasury_before, v_treasury_before + v_fondo_eur);

    UPDATE treasury_stats SET
      balance_eur = balance_eur + v_fondo_eur,
      updated_at = NOW()
    WHERE id = (SELECT id FROM treasury_stats ORDER BY created_at DESC LIMIT 1);

    -- 9. Aggiorna airdrop come completed
    UPDATE airdrops SET
      status = 'completed',
      draw_executed_at = NOW(),
      winner_id = v_winner_id,
      winner_score = v_winner_score,
      venditore_payout_eur = v_venditore_eur,
      airoobi_fee_eur = v_airoobi_eur,
      charity_contrib_eur = v_charity_eur,
      fondo_contributo_eur = v_fondo_eur,
      aria_incassato = v_aria_incassato,
      draw_scores = v_scores
    WHERE id = p_airdrop_id;

  ELSE
    -- Airdrop annullato: rimborso ARIA
    -- (logica rimborso + NFT top 3)

    UPDATE airdrops SET
      status = 'annullato',
      draw_executed_at = NOW(),
      aria_incassato = v_aria_incassato
    WHERE id = p_airdrop_id;
  END IF;

  -- 10. Notifiche
  -- (insert in notifications per vincitore e perdenti)

  RETURN jsonb_build_object(
    'ok', true,
    'success', v_success,
    'winner_id', v_winner_id,
    'aria_incassato', v_aria_incassato,
    'fondo_contributo_eur', v_fondo_eur,
    'venditore_payout_eur', v_venditore_eur
  );
END;
$;
```

### 8.2 `calculate_winner_score(p_airdrop_id UUID)`
Funzione separata per il calcolo degli score (chiamata da execute_draw).
Restituisce JSONB array con tutti i partecipanti ordinati per score.

### 8.3 `refund_airdrop(p_airdrop_id UUID)`
Rimborso ARIA a tutti i partecipanti in caso di annullamento.

### 8.4 `get_draw_preview(p_airdrop_id UUID)`
**Funzione di simulazione — solo admin.**
Calcola gli score e mostra la classifica SENZA eseguire il draw.
Utile per verificare prima di confermare.

### 8.5 `check_auto_draw()`
Chiamata dal cron ogni 15 minuti.
Trova tutti gli airdrop con `auto_draw = true` e deadline scaduta → esegue draw.

---

## 9. Interfaccia Admin — Draw Panel

Nel pannello admin, nella sezione gestione airdrop, aggiungere:

### 9.1 Per ogni airdrop in stato `sale`/`presale`:
- Bottone **"Anteprima Draw"** → chiama `get_draw_preview`, mostra classifica score
- Bottone **"Esegui Draw"** → confirm dialog → chiama `execute_draw`
- Toggle **"Auto Draw"** → aggiorna flag `auto_draw` sull'airdrop

### 9.2 Post-draw — sezione risultati:
- Vincitore con score, blocchi, rank
- Distribuzione NFT ai perdenti (riepilogo)
- Split economica: fondo, fee, charity, venditore
- Pulsante "Invia notifiche" (se non inviate automaticamente)

### 9.3 Config pesi (nuova tab "Engine Config"):
- Form per modificare tutti i valori in `airdrop_config`
- Preview in tempo reale dell'effetto dei pesi su un airdrop simulato

---

## 10. Casi Edge

| Caso | Comportamento |
|---|---|
| 1 solo partecipante | Vince automaticamente, NFT non distribuiti |
| Tutti i blocchi a 1 utente | Vince quell'utente, F1=1, altri fattori irrilevanti |
| Nessuno storico categoria | F2=0 per tutti → non influenza il risultato |
| Draw in corso contemporaneo | Lock a livello DB (FOR UPDATE) previene race condition |
| Treasury a 0 al draw | Max NFT distribuibili = 0, nessun NFT distribuito |
| Arrotondamenti split | Floor su charity, resto a venditore |

---

## 11. Note Evolutive

**Alpha Brave (ora):**
- I pesi sono fissi ma configurabili
- L'algoritmo è deterministico e auditabile
- Il draw è manuale — il founder controlla tutto

**Verso Mainnet:**
- I pesi possono essere votati dalla community (DAO governance)
- Il draw può diventare provably fair on-chain con Kaspa VRF
- La distribuzione NFT segue la regola drastica (solo top 3)
- Ogni draw genera un hash on-chain verificabile

---

*Documento generato da Claude (general manager AIROOBI) il 19 Marzo 2026*
*Da aggiornare ad ogni modifica delle regole di business prima di implementare*
