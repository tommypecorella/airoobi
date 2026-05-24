---
title: ROBY · RS · fix bug navigazione mobile dApp — overflow laterale + scroll verticale (frontend-only, fast)
purpose: Finding UAT Skeezu — la dApp su mobile ha bug di navigazione (scroll verticale a volte morto, scroll laterale per overflow del menu/topbar). Decisione Skeezu: fixare i bug ora, redesign mobile-first completo dopo il go-live. Questo RS = audit strutturale del CSS live + fix mirati per CCP. Solo frontend, nessun intervento tecnico/funzionale. Nota metodo: ROBY non ha potuto avere un viewport mobile reale (Chrome ext non scende sotto larghezza desktop) → audit strutturale del CSS, verifica visiva finale sul telefono di Skeezu.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: RS fix bug navigazione mobile · audit strutturale · frontend-only · verifica finale su device Skeezu
related: GOLDEN-SESSION_2026-05-23.md · iniziativa redesign mobile-first post go-live (separata)
---

# ROBY — RS · fix bug navigazione mobile dApp

## TL;DR

Skeezu in UAT: la dApp su mobile ha la navigazione rotta — lo scroll
verticale a volte si pianta, e si scrolla **lateralmente** perché il
menu/topbar va in overflow. Decisione Skeezu: **fix dei bug ora**,
redesign mobile-first completo come iniziativa separata post go-live.

Questo RS è un **audit strutturale** del CSS live + 3 fix mirati.
Solo frontend.

> **Nota metodo (onesta):** non ho potuto fare un audit visivo a
> viewport mobile — la Chrome ext non riduce la finestra sotto la
> larghezza desktop. Ho fatto un audit **strutturale** leggendo il
> CSS live, che per bug di overflow/scroll è preciso sui *root cause*.
> La **verifica visiva finale resta sul telefono di Skeezu** — io
> traccio.

## 1. Root cause · scroll laterale (overflow del menu)

Stato del CSS live verificato:
- `html { overflow-x: visible }`
- `body { overflow-x: hidden }`
- `.topbar { display:flex; flex-wrap:nowrap; overflow-x:visible }`

**Il footgun classico:** `body` ha `overflow-x:hidden` ma `html` ha
`overflow-x:visible`. `overflow-x:hidden` sul body **non impedisce**
all'`html` di scrollare lateralmente. Quindi appena un elemento sfora
in larghezza, la pagina scrolla di lato — esattamente il sintomo.

L'elemento che sfora è (con ogni probabilità) la `.topbar`:
`flex-wrap:nowrap` + `overflow-x:visible` = riga non-wrappabile,
non-contenuta. Il menu di link **collassa correttamente** a hamburger
sotto i 768px (`.topbar-nav{display:none}` + `.topbar-burger{display:
block}` @max-width:768px). Ma il **resto della topbar** — i pill saldi
(ARIA / ROBI / €) + campanella + EN + avatar — su uno schermo da
~390px **non si restringe abbastanza** e sfora. (Conferma indiretta:
esiste già `.topbar-robi-trend{display:none}` @640px — segno che la
topbar è notoriamente stretta, ma la cura è parziale.)

### Fix richiesti
1. **`html { overflow-x: hidden }`** (o `clip`). Taglia netta lo
   scroll laterale di pagina. Fix di contenimento — 1 riga, sicuro,
   alto impatto.
2. **Contenere la `.topbar` su mobile.** A ~390px la topbar deve
   stare nel viewport: o i pill saldi si rimpiccioliscono / si
   comprimono (es. icona + valore senza label), o la topbar
   `overflow-x:hidden` con il cluster dimensionato per entrarci. CCP
   ispeziona a 390px *cosa* sfora di preciso e lo contiene. **Non**
   lasciare `overflow-x:visible` sulla topbar.

## 2. Root cause · scroll verticale che si pianta

Qui sono onesto sul limite: senza viewport mobile non posso isolarlo
con certezza. Quello che l'audit strutturale segnala come **candidato**:
- C'è **1 regola CSS con `100vh`/`100dvh`**. Un contenitore a
  `height:100vh` con un `overflow` interno è la causa tipica dello
  scroll verticale "intrappolato" su mobile (la barra browser mobile
  cambia l'altezza reale, `100vh` non la segue, il contenuto eccede e
  resta tagliato/non scrollabile).
- `body { overflow-y: auto }` — se un contenitore intermedio prende
  un'altezza fissa < contenuto, lo scroll si spezza tra due livelli.

### Fix richiesto
3. **CCP traccia il bug scroll verticale su un viewport mobile reale**
   (devtools device-mode da una macchina con GUI, o sul telefono di
   Skeezu). Candidato n.1: la regola `100vh` → valutare `100dvh` /
   `min-height` invece di `height:100vh`, e verificare che non ci
   siano contenitori con `overflow:hidden` + altezza fissa che
   intrappolano lo scroll. Non marcare "✅" senza averlo scrollato
   davvero su mobile.

## 3. Contesto (non in scope di questo fix · per il redesign)

L'audit ha contato **34 media query con ~11 breakpoint diversi** (768,
720, 640, 600, 520, 480, 400, 800, 960…). Non c'è un sistema di
breakpoint coerente: ogni componente si adatta a una soglia diversa,
con buchi in mezzo dove niente reagisce. È la causa di fondo del
"a volte" — il comportamento responsive è a pezze. **Non si tocca
ora** (sarebbe il redesign): lo consolida l'iniziativa mobile-first
post go-live. Lo flaggo solo come contesto.

## 4. Scope e cadenza

- **Solo frontend.** Niente tecnico/funzionale. Fix 1 e 2 sono CSS;
  fix 3 è un trace + CSS.
- Cadenza: consegna singola dei 3 fix → cache-bust `?v=` + footer.
- **Verifica:** CCP self-check strutturale (overflow-x risolto, topbar
  contenuta) → **Skeezu conferma sul telefono** (scroll verticale ok,
  niente scroll laterale, menu hamburger pulito) → ROBY traccia la
  chiusura.
- Pre/post go-live: raccomando **prima del go-live** — un marketplace
  che su mobile scrolla di lato e a volte non scrolla in su non è da
  lanciare così. Fix piccolo, turnaround rapido. Decisione finale
  Skeezu.

## RS — paste-ready

```
RS · FIX BUG NAVIGAZIONE MOBILE dApp (frontend-only, fast)

Finding UAT Skeezu: su mobile la dApp scrolla lateralmente (menu/
topbar in overflow) e a volte non scrolla in verticale. Decisione:
fixare i bug ora, redesign mobile-first completo dopo il go-live.

Audit strutturale ROBY del CSS live (no viewport mobile disponibile
lato ROBY — verifica visiva finale = Skeezu sul telefono):

FIX 1 — scroll laterale, contenimento:
html ha overflow-x:visible mentre body ha overflow-x:hidden →
overflow-x:hidden sul body NON ferma l'html dallo scrollare di lato.
→ Metti overflow-x:hidden (o clip) anche su html.

FIX 2 — scroll laterale, causa:
.topbar è flex-wrap:nowrap + overflow-x:visible. I link-nav
collassano a hamburger sotto 768px (ok), ma il resto della topbar
(pill saldi ARIA/ROBI/€ + campanella + EN + avatar) a ~390px sfora.
→ Ispeziona a 390px cosa sfora e contienilo: rimpicciolisci/comprimi
i pill saldi su mobile, e togli overflow-x:visible dalla topbar.

FIX 3 — scroll verticale che si pianta:
Candidato: 1 regola CSS usa height:100vh. Su mobile la barra
browser cambia l'altezza reale, 100vh non la segue → contenuto
tagliato/non scrollabile. → Traccia su viewport mobile REALE
(devtools device-mode o telefono); valuta 100dvh/min-height al
posto di height:100vh; verifica nessun contenitore con
overflow:hidden+altezza fissa che intrappola lo scroll. NON marcare
✅ senza averlo scrollato davvero su mobile.

NON in scope ora: i 34 media query / ~11 breakpoint incoerenti — li
consolida il redesign mobile-first post go-live.

Solo frontend. Consegna singola 3 fix + cache-bust ?v= + footer.
Verifica: CCP self-check strutturale → Skeezu conferma sul telefono
→ ROBY traccia. Raccomandato PRIMA del go-live.
```

## Bottom line

I bug di navigazione mobile hanno root cause strutturali chiari:
`html overflow-x:visible` (scroll laterale di pagina) + `.topbar`
non-contenuta (sfora a 390px) + un candidato `100vh` per lo scroll
verticale. 3 fix mirati, solo CSS/frontend, veloci. Verifica visiva
finale sul telefono di Skeezu. Il caos dei breakpoint è contesto per
il redesign post-lancio, non per ora.

Audit-trail: questo file = RS fix bug navigazione mobile · finding
UAT Skeezu (scroll verticale a volte morto + scroll laterale da
overflow menu/topbar) · decisione Skeezu bug-ora / redesign-dopo ·
audit STRUTTURALE CSS live (no viewport mobile lato ROBY, Chrome ext
non scende sotto desktop · verifica visiva = Skeezu telefono) · root
cause: (1) html overflow-x:visible vs body overflow-x:hidden → scroll
laterale pagina, fix overflow-x:hidden su html · (2) .topbar
flex-wrap:nowrap+overflow-x:visible, nav-link collassano a hamburger
@768px ma cluster saldi/controlli sfora a 390px, fix contenere ·
(3) scroll verticale candidato regola 100vh, CCP traccia su mobile
reale, 100dvh/min-height · contesto non-scope: 34 media query ~11
breakpoint incoerenti → redesign post go-live · solo frontend ·
cadenza singola + cache-bust · verifica CCP strutturale + Skeezu
device · raccomandato pre go-live.

---

*ROBY · Strategic MKT & Comms & Community · RS fix navigazione mobile · 24 May 2026 · daje team a 4*
