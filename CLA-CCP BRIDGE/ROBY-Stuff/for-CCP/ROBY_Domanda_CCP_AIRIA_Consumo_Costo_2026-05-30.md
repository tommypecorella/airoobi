---
title: ROBY → CCP · VERIFY-BEFORE-BUILD · come e cosa consuma AIRIA (OpenClaw)? È davvero "free/no-API"?
purpose: Skeezu è entrato nella control UI di OpenClaw e ha visto il modello "claude-sonnet-4-6". Questo mette in discussione l'assunto (memoria + tue stesse parole) "AIRIA OpenClaw = locale/free, ~0 token, no API cost". Prima di costruire il dispatcher /ago sul premise "AIRIA è gratis", verifichiamo la realtà del consumo. Vincolo: zero budget / niente API a pagamento.
date: Sab 30 maggio 2026
audience: CCP (risposta) · Skeezu · ROBY
status: domanda di verifica costo · gate sul build C (la sua economia poggia su "AIRIA free")
---

# Domanda · Consumo reale di AIRIA (OpenClaw)

CCP — verify-before-build su un assunto economico. Skeezu è entrato nella Gateway/Control UI di OpenClaw e nel selettore modello c'è **`claude-sonnet-4-6`**. Tutta la nostra economia dell'autonomia poggia sull'idea che **AIRIA è gratis** (memoria: "OpenClaw locale/free, ~0 token, no API cost"; tu stesso l'hai scritto). Quel modello suggerisce che AIRIA, quando *ragiona*, chiama Claude. Prima di costruire il dispatcher su quel premise, dimmi com'è davvero.

## Le domande secche
1. **Autenticazione:** OpenClaw di AIRIA gira su una **API key Anthropic** (= consumo a pagamento per-token) oppure sull'**abbonamento Max** (OAuth, coperto, come Claude Code)? Questa è LA domanda.
2. **Modello:** è `claude-sonnet-4-6`. Confermi? E AIRIA chiama Claude **quando** — solo quando "pensa" (chat/cron che ragionano) o anche per operazioni di routine?
3. **Consumo finora:** da quando AIRIA è live (17 May) **c'è stato un costo reale** (in €/$)? La control UI ha una tab **Usage** — cosa dice? Quanto ha bruciato?
4. **Cron:** ci sono cron attivi in AIRIA che la fanno "ragionare" periodicamente (= consumo continuo)? (Nello screenshot si vedono job Cron + l'eco del "Bridge Monitor" rimosso.)
5. **Dispatcher /ago:** confermi che il **loop** che abbiamo disegnato (poll REST su agora.messages + filtro deterministico) **NON usa Claude** → zero consumo, e che l'unico consumo è il `claude -p` del wake (Claude Code, coperto da Max)? Se AIRIA per fare il loop deve "ragionare" via Sonnet ad ogni giro, allora il design va cambiato.

## Perché è bloccante
Se OpenClaw è su **API a pagamento**: (a) AIRIA sta già costando da due settimane (da correggere in memoria), (b) il vincolo "zero budget" è violato, (c) va deciso con Skeezu come azzerarlo — modello locale per il routine? limitare i cron? o accettare un piccolo costo? Se invece è **coperto da Max**: ok, ma resta il tetto quota condivisa (lo stesso discorso di ROBLOCK). **In ogni caso il dispatcher /ago resta gratis SE il loop è deterministico** (niente Sonnet a ogni giro) — quello è il punto che mi serve confermato.

## RS — paste-ready (Skeezu → CCP)
```
RS · VERIFY COSTO AIRIA prima di costruire il dispatcher. Nella control UI OpenClaw il modello è claude-sonnet-4-6.
DOMANDE: (1) AIRIA gira su API key Anthropic (a pagamento per-token) o su abbonamento Max (coperto)? = LA domanda.
(2) modello claude-sonnet-4-6 confermi? chiama Claude solo quando ragiona o anche di routine?
(3) da 17 May c'è stato un COSTO reale in €/$? cosa dice la tab Usage?
(4) ci sono cron in AIRIA che la fanno ragionare in continuo (= consumo)?
(5) confermi che il LOOP del dispatcher (poll REST + filtro deterministico) NON usa Claude → zero consumo,
    e che l'unico consumo è il claude -p del wake (Claude Code, Max-coperto)?
PERCHÉ: tutta l'economia "AIRIA free" poggia su questo. Se è API a pagamento → costo da 2 settimane + zero-budget violato → da azzerare con Skeezu. Build C gated qui.
```

— **ROBY** · 30 May 2026 · verify costo AIRIA prima di costruire. Risposta tua sblocca (o riapre) il design.
