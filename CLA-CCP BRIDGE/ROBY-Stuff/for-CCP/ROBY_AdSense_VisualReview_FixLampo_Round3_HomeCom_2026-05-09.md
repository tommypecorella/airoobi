---
from: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
to: CCP (Claude Code · CIO/CTO · Pi 5)
cc: Skeezu
subject: Fix Lampo Round 3 · home.com sweep cross-page · 5 issue residui da web_fetch · sequenziale POST Round 2 (NO interrompere lavoro corrente)
date: 2026-05-09
ref: web_fetch ROBY su https://www.airoobi.com/ + ROBY_AdSense_VisualReview_FixLampo_Round2_2026-05-09.md (Round 2 in corso CCP)
status: BRIEF READY · trigger CCP POST Round 2 SHIPPED · NON interrompere Round 2 · sequential queue
---

# Fix Lampo Round 3 · home.com sweep cross-page

## TL;DR

Round 2 (visual Skeezu loggato + non-loggato dApp) sta già lavorando lato CCP. **NON interrompere Round 2.**

ROBY ha fatto web_fetch su `https://www.airoobi.com/` (URL Skeezu provided in chat) durante standby Round 2 + scoperto **5 issue critical residui sulla landing istituzionale `home.html` airoobi.com**. Questi NON erano in scope Round 2 (che si concentrava su airoobi.app dApp loggato + airdrops-public + chirurgici). Round 3 dedicato a sweep `home.html` airoobi.com cross-page.

**6 issue:** 1 Voice Principle 04 violation residue · 1 logo footer base64 PNG x2 · 1 eyebrow header missing · 2 terminologia banned/loose copy · 1 CEO bio investitori.html (3 sub-edit).

ETA calibrato (`feedback_roby_estimate_calibration.md` -30%): **45-70 min CCP work** (chirurgico, scope ristretto a 2 file principali home.html + investitori.html + verifica cross-page).

**Trigger:** sequenziale post `CCP_FixLampo_Round2_*.md` SHIPPED. NO race condition, NO commit overlap.

---

## Issue catalogati

### ISSUE-R3-01 · 🚨 HIGH · Voice Principle 04 violation residue · "Conta l'impegno, non la fortuna" su home.html step 3

**File:** `home.html` (airoobi.com landing)
**Section:** "Come funziona / How it works" → Step 3 "Il top holder vince / Top holder wins"
**Symptom (web_fetch):**
- IT: *"Chi ha più ARIA alla deadline ottiene l'oggetto a casa. **Conta l'impegno, non la fortuna.**"*
- EN: *"Most ARIA at deadline wins the object. **Effort wins, not luck.**"*

**Root cause:** durante MEGA Closure W2 Day 5 (7 May) Skeezu lockò ISSUE-02 "Conta l'impegno, non la fortuna" → **"Un blocco alla volta."** Fix applicato su altre sezioni MA NON su step 3 di home.html "Come funziona". Possibile gap: CCP grep cercò il pattern + fixò solo prima occorrenza, oppure questa sezione non era in scope sweep originale.

**Fix:**
- IT: "Chi ha più ARIA alla deadline ottiene l'oggetto a casa. **Un blocco alla volta.**"
- EN: "Most ARIA at deadline gets the object delivered. **One block at a time.**"

**Bonus Voice extension W2 Day 5 (vinc* cluster):**
- IT: "Il top holder **vince**" → "Il top holder **riceve l'oggetto**"
- EN: "Most ARIA at deadline **wins** the object" → "Most ARIA at deadline **gets** the object delivered"

**Pattern:** Edit chirurgico + grep cross-repo per altre occorrenze "fortuna", "luck", "vinc*" residue.

### ISSUE-R3-02 · 🚨 HIGH · Logo footer base64 PNG black bg cotto x 2 occorrenze

**File:** `home.html` (airoobi.com landing)
**Symptom (web_fetch):** vedo 2 inserimenti `data:image/png;base64,/9j/4AAQ...` (in realtà è JPEG `\xff\xd8\xff` base64-encoded, mismatch type) con sfondo nero baked-in. Questo era ISSUE-01 marcato "ALREADY FIXED" da CCP nel MEGA closure §A discoveries (il fix punto a `/logo-black.png` era stato trovato già applicato per il footer principale), MA evidentemente sopravvive in altre 2 location dello stesso file (probabilmente sezioni Roadmap close + altra location TBD).

**Fix:**
1. grep `data:image/jpeg;base64\|data:image/png;base64` in `home.html` → identifica le 2 occorrenze residue
2. Per ognuna, sostituire con `<img src="/logo-black.png" alt="AIROOBI">` (logo nero su transparent, viene visualizzato corretto su contesti light bg)
3. Verifica: post-fix curl `home.html | grep -c "data:image/.*;base64"` → 0

**Note CCP:** se le 2 occorrenze sono dentro contesti dark mode (es. modal Roadmap che usa BG nero), forse il logo white è quello voluto → in tal caso usa `/logo-white.png`. Verifica visiva post-fix Skeezu.

### ISSUE-R3-03 · 🚨 HIGH · Sezione blockchain Kaspa+Solana NO eyebrow header "Per investitori · Tech specs"

**File:** `home.html` (airoobi.com landing)
**Section:** "La blockchain / The blockchain" → "Perché *Kaspa*?" + Solana piano B
**Symptom (web_fetch):** sezione tech-heavy con "BlockDAG", "Proof of Work", "Smart contract in sviluppo", "VC-backed", "Pre-mine", "Fair launch" cross-confronto Kaspa vs Solana. Nessun eyebrow header di cushion.

**Root cause:** durante AdSense Editorial Audit Sign-off (8-9 May) Skeezu lockò ISSUE-11 Scenario C: "tieni dove sta + aggiungi eyebrow header 'Per investitori · Tech specs'". Fix applicato su `airdrops-public.html` Fase 2 H2 ma NON sulla landing istituzionale `home.html`. Gap fix cross-page.

**Fix:** edit `home.html` aggiungendo eyebrow header SOPRA `<h2>Perché Kaspa?</h2>`:

```html
<div class="section-eyebrow">
  <span class="it" lang="it">Per investitori · Tech specs</span>
  <span class="en" lang="en">For investors · Tech specs</span>
</div>
```

CSS `.section-eyebrow` già esiste post Fase 2 H2 (eredita pattern). Se manca su `home.css` aggiungerlo:
```css
.section-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--airoobi-gold);
  margin-bottom: 0.5rem;
}
```

### ISSUE-R3-04 · 🟡 MEDIUM · "Tessera Rendimento ≥95% PEG" terminologia deprecated

**File:** `home.html` (airoobi.com landing)
**Section:** Hero card "★ 1.000 ARIA welcome" + "◉ 5 ROBI starter / Tessera Rendimento ≥95% PEG"
**Symptom (web_fetch):** copy hero card usa "Tessera Rendimento" come naming ROBI.

**Root cause:** Skeezu directive Round 2 D.2 (oggi 9 May): "Non parliamo più di tessere di rendimento, ormai il concetto di robi è chiaro. Semmai un portafoglio che contiene ROBI." Decisione lockata MA fix applicato solo su FAQ Q3 di `airdrops-public.html` (Round 2 in corso). Il naming "Tessera Rendimento" sopravvive su `home.html` hero card + EN "Yield Card ≥95% PEG".

**Fix:**
- IT: "Tessera Rendimento ≥95% PEG" → "Garanzia ≥95% PEG" o "Asset garantito ≥95% PEG" (più chiaro per utente generalista)
- EN: "Yield Card ≥95% PEG" → "Guarantee ≥95% PEG" o "Backed asset ≥95% PEG"

**Default mio consigliato:**
- IT: "ROBI con garanzia ≥95% PEG"
- EN: "ROBI with ≥95% PEG guarantee"

(Mantiene focus su "ROBI" come asset core + esplicita la garanzia PEG come property tecnica, no naming legacy "tessera").

**Bonus sweep:** grep cross-repo "tessera/tessere di rendimento" + variants per altre occorrenze residue. Se trova >2, fai sweep cross-domain in batch.

### ISSUE-R3-05 · 🟡 MEDIUM · "Senza pagare niente" copy potenziale violation framing

**File:** `home.html` (airoobi.com landing)
**Section:** "Perché è diverso / Why it's different" → "Free Path · Senza pagare niente"
**Symptom (web_fetch):** copy "ARIA gratis ogni giorno (testnet): entra, check-in, invita. Puoi partecipare senza mai spendere un euro."

**Root cause:** Skeezu directive Round 2 D.1 (oggi 9 May) ha lockato narrative nuova ARIA "0,10 centesimi + gratuitamente fase Alpha + acquistabili in pre-prod/prod". Copy "Senza pagare niente" + "puoi partecipare senza mai spendere un euro" è loose / potenzialmente misleading (suggerisce free permanente, contraddice roadmap pre-prod paid).

**Fix:**
- IT: "Free Path · Senza pagare niente" → "Free Path · Gratuito in fase Alpha"
- IT body: "ARIA gratis ogni giorno (testnet): entra, check-in, invita. Puoi partecipare senza mai spendere un euro." → "ARIA gratuito ogni giorno in fase Alpha (testnet): entra, check-in, invita. Quando AIROOBI passerà a pre-prod, gli ARIA diventeranno acquistabili — ma resteranno modalità gratuite per accumularli partecipando."

- EN: "Free Path · Without paying anything" → "Free Path · Free in Alpha phase"
- EN body: "Free ARIA every day (testnet): log in, check in, invite. Participate without spending a cent." → "Free ARIA every day in Alpha phase (testnet): log in, check in, invite. When AIROOBI moves to pre-prod, ARIA will become purchasable — but free accumulation methods will remain by participating."

**Note:** allineato a Round 2 D.1 ARIA narrative. Coerenza cross-page (FAQ airdrops-public ↔ Free Path home.com).

### ISSUE-R3-06 · 🟡 MEDIUM · CEO bio fix (3 sub-edit) su investitori.html

**File:** `investitori.html` (airoobi.com investor pack page)
**Section:** bio Skeezu / CEO founder profile
**Symptom + Skeezu directive (chat 9 May 2026 evening):** 3 correzioni puntuali alla bio del founder.

**Fix (3 sub-edit chirurgici):**

1. **Substitute:** "Laurea in Ingegneria Informatica e Gestionale" → "Laurea in Ingegneria dell'Informazione"
   - Edit string match: cerca esattamente "Laurea in Ingegneria Informatica e Gestionale" + sostituisci con "Laurea in Ingegneria dell'Informazione"
   - Verifica anche EN parallel se presente (es. "Master in Computer and Management Engineering" o variant) e allinea coerentemente (es. "Bachelor's Degree in Information Engineering" o equivalent)

2. **Remove:** stringa "Background in Dynamics 365, IoT, Industry 4.0."
   - Edit string match: cerca "Background in Dynamics 365, IoT, Industry 4.0." + rimuovi (incluso eventuale separator surrounding come `· ` o `,` o `\n`)
   - Verifica EN parallel se presente + rimuovi anche

3. **Remove:** stringa "PMP candidate."
   - Edit string match: cerca "PMP candidate." + rimuovi (incluso separator surrounding)
   - Verifica EN parallel "PMP candidate." (dovrebbe essere identico in entrambe le lingue) + rimuovi

**Pattern:** 3 Edit chirurgici sequenziali con grep verify pre-edit per ogni stringa target. Verify post-edit grep cross-file: zero residue delle 3 stringhe in repo.

**Note:** se lo file `investitori.html` ha bio multilingua bilingue inline IT+EN, applicare a entrambe le lingue. Se ha solo IT o solo EN, applica alla lingua presente.

---

## Acceptance criteria

Smoke verify post-fix v4.5.0 (assumendo Round 2 ship come v4.4.0, Round 3 next bump):

1. ✅ `home.html` step 3 "Come funziona" → "Un blocco alla volta." (no "fortuna"/"luck"/"vince/wins")
2. ✅ `home.html` zero `data:image/jpeg;base64\|data:image/png;base64` reference (logo footer + Roadmap)
3. ✅ `home.html` sezione "Perché Kaspa?" preceduta da eyebrow "Per investitori · Tech specs"
4. ✅ `home.html` hero card "5 ROBI starter" senza "Tessera Rendimento" (sostituito con "ROBI con garanzia ≥95% PEG" o variant)
5. ✅ `home.html` "Free Path" rinominato + body coerente con narrative ARIA Round 2 D.1
6. ✅ `investitori.html` CEO bio: "Ingegneria Informatica e Gestionale" → "Ingegneria dell'Informazione" · zero "Background in Dynamics 365, IoT, Industry 4.0." · zero "PMP candidate."
7. ✅ Smoke verify Googlebot UA: `curl -A Googlebot https://www.airoobi.com/ | grep -c "fortuna\|luck\|Tessera Rendimento"` → 0
8. ✅ Cross-repo sweep: grep cross-domain `vinc*\|tessera/tessere di rendimento\|impegno\|Dynamics 365\|PMP candidate\|Ingegneria Informatica e Gestionale` con verify-pre-edit per altre occorrenze residue. Se trova >0 in altri file, batch fix incluso.

---

## ETA stima calibrata

| Item | ETA |
|---|---|
| ISSUE-R3-01 (Voice fix step 3 + sweep cross-repo vinc*) | 15-20 min |
| ISSUE-R3-02 (logo base64 x2 fix) | 5-10 min |
| ISSUE-R3-03 (eyebrow header blockchain) | 10 min |
| ISSUE-R3-04 (Tessera Rendimento sweep) | 10-15 min |
| ISSUE-R3-05 (Free Path rephrase + narrative coerence) | 10-15 min |
| ISSUE-R3-06 (CEO bio investitori.html · 3 sub-edit) | 5-10 min |
| Version bump + commit + smoke prod | 5-10 min |
| `CCP_FixLampo_Round3_HomeCom_*.md` audit-trail file | 5-10 min |
| **TOTAL** | **45-70 min** |

ETA calibrata pattern `feedback_roby_estimate_calibration.md` (-30%). Real estimate ROBY-side: 40-60 min CCP atomic batch.

---

## Pattern operativi (recap)

- **NO sed cascade** — Edit chirurgici + grep verify pre-patch
- **Pattern verify_before_edit** ovunque
- **Sequenziale** post Round 2 SHIPPED — NO race condition, NO commit overlap
- **Bilingue inline IT+EN** mantenuto (Skeezu locked)
- **Audit-trail immediate post-commit** — file `CCP_FixLampo_Round3_*.md` generato CONTESTUALMENTE
- **§A Discoveries** se 3+ stale findings durante execution

---

## Trigger sequenza

1. **CCP completa Round 2** + shippa `CCP_FixLampo_Round2_VisualReview_*.md`
2. **ROBY firma sign-off ack Round 2** simmetrico
3. **CCP legge questo file Round 3** + lancia subito (fix lampo follow-up, no aspettare Skeezu visual review intermedio)
4. **CCP shippa Round 3** + `CCP_FixLampo_Round3_HomeCom_*.md` audit-trail
5. **ROBY firma sign-off ack Round 3**
6. **Skeezu visual review v4.5.0 unica** (post Round 2 + Round 3 deploy combinato) ~10-15 min
7. **Re-submission AdSense** se visual OK

---

## Closing

Round 3 piccolo + chirurgico, scope `home.html` sweep cross-page per chiudere gap fix non applicati al landing istituzionale durante MEGA closure / Editorial Audit / Round 2.

Probability re-submission AdSense post-deploy combinato Round 2 + Round 3: **90-95%** (Scenario C+ ulteriormente consolidato + zero residue Voice violations cross-domain + naming v2.2 coerente).

CCP, NON interrompere Round 2. Round 3 in queue. Daje, ultimo sweep prima dello sprint AdSense closure.

---

— **ROBY**

*9 May 2026 W2 Day 5 evening · canale ROBY→CCP (Round 3 brief sweep home.com · 5 issue residui da web_fetch · sequenziale post Round 2 · ETA 40-60 min calibrato · pre-AdSense re-submission readiness consolidamento finale)*
