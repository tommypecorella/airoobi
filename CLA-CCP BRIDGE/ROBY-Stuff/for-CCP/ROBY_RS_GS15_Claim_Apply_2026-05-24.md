---
title: ROBY · RS · GS-15 parte 1 — applicare il claim "corsa in salita" (lockato Skeezu, diffusione ampia)
purpose: Skeezu ha lockato il claim "corsa in salita" e ha detto "diffondilo" — diffusione ampia. Claim primario approvato. Questo RS dice a CCP dove applicarlo: pagina airdrop (microcopy aggancio soglia), come-funziona-airdrop, EDU. NON tocca lo slogan hero immutabile della home. Solo testo, niente logica.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: GS-15 parte 1 · claim lockato Skeezu · RS applicazione copy · diffusione ampia
in-reply-to: ROBY_Copy_Claim_Corsa_In_Salita_GS15_2026-05-24.md
---

# ROBY — RS · GS-15 p1 · applicare il claim "corsa in salita"

## TL;DR

Skeezu ha lockato — claim primario approvato, "**diffondilo**":
diffusione ampia. CCP applica il testo nelle surface qui sotto.
È **solo copy**, nessuna logica.

## 1. Claim lockato

> **Una corsa in salita. Resta in pista solo chi può ancora vincere.**

## 2. Narrativa breve (explainer)

> AIROOBI non è fortuna. È una corsa in salita verso l'oggetto, e la
> salita è onesta: prima che tu spenda un ARIA in più, il sistema ti
> dice esattamente fino a che punto puoi ancora arrivare primo. Chi
> non può più vincere lascia la salita — senza illusioni. Chi è
> ancora in corsa, ci è per davvero. Quando corri su AIROOBI, corri
> per qualcosa di reale.

## 3. Dove applicarlo — diffusione ampia

| Surface | Cosa va |
|---|---|
| **Pagina airdrop** `/dapp/airdrop/:id` | microcopy aggancio sopra la riga soglia GS-15p2: intestazione **"La tua salita"** + stato **"Sei ancora in corsa."** (verde) / **"La salita si sta chiudendo."** (amber, vicino soglia) |
| **come-funziona-airdrop.html** | il claim come intestazione di sezione + la narrativa breve §2 nel corpo |
| **EDU** (pagina educational) | la narrativa breve §2, dove si spiega la fairness/competizione |

**NON toccare** lo slogan hero della home (`home.html` — "Non
venderlo! Airdroppalo su AIROOBI." è IMMUTABILE). Il claim
"corsa in salita" è un claim **secondario** ricorrente, non
sostituisce lo slogan brand-defining.

## 4. Note

- Bilingue: se le surface hanno la versione EN, serve la traduzione
  EN del claim — se vuoi te la passo, dimmelo (non l'ho inclusa qui
  per non bloccare; l'IT è quello lockato).
- Cache-bust `?v=` + footer sui file toccati (lezione
  `feedback_cache_bust_v_bump`).
- Voice 04: il claim è già verificato (zero vocabolario gambling).

## RS — paste-ready

```
RS · GS-15 p1 — applica il claim "corsa in salita" (diffusione ampia)

Skeezu ha lockato il claim. Applicalo (solo testo, no logica):

CLAIM: "Una corsa in salita. Resta in pista solo chi può ancora
vincere."

NARRATIVA breve: "AIROOBI non è fortuna. È una corsa in salita
verso l'oggetto, e la salita è onesta: prima che tu spenda un ARIA
in più, il sistema ti dice esattamente fino a che punto puoi ancora
arrivare primo. Chi non può più vincere lascia la salita — senza
illusioni. Chi è ancora in corsa, ci è per davvero. Quando corri su
AIROOBI, corri per qualcosa di reale."

DOVE:
- pagina airdrop /dapp/airdrop/:id → microcopy sopra la riga soglia
  GS-15p2: intestazione "La tua salita" + stato "Sei ancora in
  corsa." (verde) / "La salita si sta chiudendo." (amber).
- come-funziona-airdrop.html → claim come intestazione sezione +
  narrativa nel corpo.
- EDU → narrativa breve nella parte fairness/competizione.

NON toccare lo slogan hero home.html ("Non venderlo! Airdroppalo")
— è IMMUTABILE. Il claim corsa-in-salita è secondario, non lo
sostituisce.

Cache-bust ?v= + footer sui file toccati. Se le surface hanno
versione EN, flagga: la traduzione EN la passa ROBY.
```

## Bottom line

GS-15 parte 1 chiusa lato decisione: claim lockato, RS di
applicazione pronto. CCP applica il testo su 3 surface, niente
logica. Con questo la parte narrativa di GS-15 è completa (la riga
soglia, parte 2, è già live).

Audit-trail: questo file = RS applicazione claim GS-15p1 "corsa in
salita" lockato Skeezu ("diffondilo" = diffusione ampia) · claim
primario + narrativa breve · surface: pagina airdrop (microcopy
soglia) + come-funziona-airdrop + EDU · slogan hero home IMMUTABILE
non toccato · solo copy no logica · cache-bust + footer · traduzione
EN da ROBY se servono surface EN.

---

*ROBY · Strategic MKT & Comms & Community · RS applica claim GS-15p1 · 24 May 2026 · daje team a 4*
