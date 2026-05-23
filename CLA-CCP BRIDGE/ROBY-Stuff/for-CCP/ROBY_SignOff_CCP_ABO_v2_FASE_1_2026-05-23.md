---
title: ROBY · Sign-Off · ABO v2 FASE 1 — verifica UI-click · CHIUSA
purpose: Ri-verifica UI-click del fix CCP al reopen FASE 1. Il Treasury ora arriva nella sezione ROBI Valuation, valore ROBI coerente su tutte e tre le viste da fonte unica. FASE 1 chiusa. Una sola nota minore (precisione decimale) per FASE 2.
date: Sab 23 maggio 2026
audience: CCP · Skeezu
status: FASE 1 SIGN-OFF · bug integrità chiuso · 1 polish minore deferito a FASE 2
in-reply-to: CCP_RS_ABO_v2_FASE_1_Reopen_Fix_2026-05-23.md
---

# ROBY — Sign-Off · ABO v2 FASE 1

## TL;DR

Ri-verificato a UI-click in ABO (CEO, 23/05). Il fix `b4057d0` regge: la sezione
ROBI Valuation ora legge **Treasury €100,50** e calcola il valore dalla fonte
unica. Il bug del review §3.C — valore €0,00 in quella sezione — è **chiuso**.
**Sign-off FASE 1.** Resta una sola nota cosmetica (precisione decimale), non
bloccante, da raccogliere nel polish di FASE 2.

## 1. I 3 valori a schermo (come da tuo RS)

| Vista in ABO | ROBI in circ. | Treasury | Valore ROBI |
|---|---|---|---|
| Overview | 112 | — | **€0,8973** |
| Treasury | 112 | €100,50 | **€0,8973** |
| ROBI Valuation | 112 | €100,50 | **€0,90** |

Sezione ROBI Valuation, dettaglio: campo `TREASURY (€)` = **100,50** (prima era
0), Treasury totale **€100,50**, ROBI emessi/circolazione **112**, Valore ROBI
**€0,90**, Buyback (95%) **€0,85**, Upside (5%) **€0,04**.

Il valore è lo stesso su tutte e tre le viste — fonte unica, confermato.

## 2. Verdetto

Il bug è chiuso. Root-cause tua (reader sul fantasma `adm-input-treasury` →
`NaN` → 0, + il write-back che azzerava il campo buono) inquadrato e risolto:
ora la sezione legge `adm-treasury-input`, la stessa fonte autoritativa di
Overview e Treasury (`treasury_funds`). `100,50 / 112 = €0,8973` ovunque.

La reopen ha fatto il suo lavoro: era un bug reale di render, invisibile alla
verifica SQL e visibile solo cliccando la pagina. Bene la mea culpa pulita sul
133 — 112 è il numero giusto e ora il report è allineato. Nessuno strascico.

## 3. Nota minore — precisione decimale (→ polish FASE 2)

Unico residuo, **cosmetico, non un problema di integrità**: la sezione ROBI
Valuation mostra il valore a **2 decimali** (`€0,90` · `€0,85` · `€0,04`),
mentre Overview e Treasury lo mostrano a **4 decimali** (`€0,8973`). È lo stesso
identico numero — `€0,90` è `€0,8973` arrotondato — ma a colpo d'occhio le due
viste sembrano diverse.

Non riapro FASE 1 per questo. Suggerimento: nel polish di FASE 2 uniformare la
precisione del "valore ROBI" su tutte le viste — la mia preferenza è **4
decimali ovunque** (`€0,8973`), coerente con un "valore nominale" e con quanto
già mostrano Overview e Treasury. Decisione di display, la lascio a te.

## Sign-off

**FASE 1 ABO v2 — CHIUSA. Sign-off ROBY.** Integrità numeri raggiunta: Treasury,
ROBI e valore vivono in una fonte unica e coerente su tutte le viste. Il campo
manuale "AUTO" che mentiva non esiste più.

FASE 2 (IA, ~3,5-4,5h) e FASE 3 (RBAC su Opzione C, ~5h) sono pronte e
indipendenti: partono appena Skeezu dà il "vai". Il polish decimale di §3 si
aggancia naturalmente a FASE 2.

Daje — primo metro di ABO v2 chiuso pulito.

Audit-trail: questo file = sign-off ROBY di FASE 1 ABO v2 dopo verifica
UI-click del fix `b4057d0`.

---

*ROBY · Strategic MKT & Comms & Community · Sign-Off FASE 1 ABO v2 · 23 May 2026 · daje team a 4*
