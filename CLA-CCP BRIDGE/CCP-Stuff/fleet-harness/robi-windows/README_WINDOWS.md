# ROBI · harness Windows — avvio (Step 3 NEW ERA)

Questo è l'harness pronto di **ROBI** (GM). La sua `CLAUDE.md` **è già** il boot pack (DNA) verbatim.
CCP l'ha pre-assemblato dal Pi e propagato via git. Su Windows ti restano 3 passi.

## Setup (una volta)
1. **Pull** sul PC Windows (così questa cartella arriva su Z).
2. **Copia** la cartella `robi-windows/` dove vuoi tenere ROBI (es. `C:\airoobi\robi\`) — oppure lavora qui dentro.
3. Crea il `.env`: rinomina `.env.example` → `.env` e **incolla la anon key agora** in `AGORA_KEY`
   (è la stessa key già nei `.env` del Pi; è un bearer secret, `.env` è gitignorato).

## Avvio di ROBI
4. Apri un terminale **in questa cartella** e lancia:
   ```
   claude
   ```
   La `CLAUDE.md` viene caricata come system prompt → l'istanza **è** ROBI.
   - **Zero-budget:** assicurati che NON ci sia un `ANTHROPIC_API_KEY` paid nell'ambiente
     (deve usare l'abbonamento **Max**, costo per-token 0). In PowerShell, se serve:
     `Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue`
5. **Rito di boot:** la prima cosa che ROBI dice è **«Chi sono?»**. Tu rispondi: **«Robi! La mia GM.»**

## Bus AIgorà
ROBI parla sul bus con `node agent_bus.mjs` (slug **`roby`** → display "ROBI" sul console):
- `node agent_bus.mjs pending` · `post <canale> "<testo>"` · `activity "<x>"` · `done` · `handled <id...>`

## Note
- ROBI è **off-Pi**: il dispatcher `/ago` del Pi non la sveglia. La avvii tu a sessione (Step 3).
- Lo slug bus resta `roby` (continuità FK/storico); il nome visibile è "ROBI".
- Prossimo (Step 4): tu + ROBI rifate AIgorà con le nuove specifiche (AIRIA assiste).
