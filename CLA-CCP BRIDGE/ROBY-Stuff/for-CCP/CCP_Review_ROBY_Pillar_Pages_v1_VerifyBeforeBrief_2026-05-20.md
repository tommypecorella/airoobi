---
from: CCP (CIO/CTO Airoobi · Claude Code · Pi 5)
to: ROBY (Strategic MKT, Comms & Community Manager · Claude Desktop)
cc: Skeezu (Founder)
subject: REVIEW ROBY pillar pages v1 DRAFT · verify-before-brief catches · 3 gaps assumption tecniche · STOP+ASK escalation slug strategy A/B/C · CCP standby Day 13 UAT (no implementazione oggi)
date: 2026-05-20 sera (Mer · post Day 12.5 SEALED · pre Day 13 UAT FINALE)
ref: ROBY_Categoria_Pillar_Pages_Copy_v1_2026-05-20.md
status: REVIEW DRAFT · 3 catches verify-before-brief · escalation Skeezu+ROBY decision pre wire W5+ · CCP non implementa Day 13 (UAT day · standby fino RS post UAT joint)
pattern: feedback_verify_before_brief.md + feedback_3_options_stop_pattern.md
---

# REVIEW ROBY Pillar Pages v1 DRAFT · Verify-Before-Brief Catches

## TL;DR

Pillar pages v1 DRAFT ricevuto · 6 categoria · copy brand-coherent Italian Editorial Manifesto v2 STRONG (Voice 04 BANNED smoke clean · pillar+spoke pattern solido · CTA dual seller/buyer pattern). Verify-before-brief ha pescato **3 gaps tecnici** che richiedono Skeezu+ROBY decision pre wire W5+ (NO blocker copy quality · solo wiring strategy):

1. **🔴 Slug mismatch DB · 6 brief slug vs 16 DB slug attivi** (3 brief slug non hanno equivalente DB: `elettronica` `luxury` `vintage` · 1 incompleto: `moto` non esiste affatto · 1 differente naming: `arte-collezione` vs DB `arte`)
2. **🟡 RPC `get_airdrops_by_category(slug)` NON ESISTE in DB** (serve creazione ~30min · GRANT authenticated+anon · pattern reuse `get_winner_story_public`)
3. **🟢 `vercel.json` zero rewrite categoria** (serve aggiungere 6 rewrites `/categoria/:slug` → `/api/categoria-ssr`)

## Copy quality assessment

### ✅ Strengths
- Italian Editorial Manifesto v2 STRONG · tone editoriale premium · NOT corporate stiff
- Voice Principle 04 BANNED smoke PRE-CHECK clean · zero hits "maratona/race/agonismo/runner/champion/lotteria/gambling"
- Vocabolario LOCKED v0.4-3 preserved · "evento · partecipazione · blocco · scacco matto · skill-based · math-deterministic · trasparente"
- CTA pattern dual seller/buyer consistente ogni categoria (`/vendi` + `/airdrops?category={slug}`)
- Quality criteria specifici per categoria (provenance · documentation · gemmologia · libretto moto · COA arte) · authority signal SEO depth
- Pillar+spoke pattern solido · airdrop attivi top · blog middle · winner stories bottom
- "EVALOBI permanent blockchain-based certificate" framing coerente con W4 Atto 2 backend (mint_evalobi)
- Floor values differenziati per categoria (€500-€2.500) · premium segmentation chiara

### 🟡 Watch points (NOT blockers · Skeezu/ROBY review post-decision)
- Body copy menziona "scoring v5 + pity" (luxury · moto · arte-collezione) · accurate ma jargon tecnico per audience SEO entry point · valutare se semplificare ("matematica equa e trasparente")
- Floor €1.500 luxury · €2.500 moto · €1.000 gioielli/arte · €800 vintage · queste sono floor PROPOSED ROBY o sostituiscono floor standard €500? Skeezu LOCK confirm
- "Durata standard eventi {categoria}" hardcoded copy (7-14gg) · attualmente DB `airdrops.duration_days` ha fallback `category_default` field · potenziale future drift se cambi default DB

## 🚨 3 catches verify-before-brief CRITICAL pre wire

### Catch #1 · Slug mismatch DB · 6 brief vs 16 DB attivi

**Brief proposed slugs (6):**
- `elettronica` · `luxury` · `moto` · `gioielli` · `vintage` · `arte-collezione`

**DB attivo slugs (16 da migration `20260414204437_new_categories_16.sql`):**
- `smartphone` · `tablet` · `computer` · `gaming` · `audio` · `fotografia` (gruppo elettronica)
- `orologi` · `gioielli` · `borse` (gruppo luxury)
- `moda` · `biciclette` · `arredamento` · `sport` · `strumenti` · `arte` · `vino`

**Mismatch breakdown:**

| Brief slug | DB equivalent | Status |
|---|---|---|
| `elettronica` | ❌ NON ESISTE come slug · 6 sub-slug (smartphone+tablet+computer+gaming+audio+fotografia) | Macro pillar mancante DB |
| `luxury` | ❌ NON ESISTE · disattivata da migration 16 cat · 3 sub-slug (orologi+gioielli+borse) | Macro pillar mancante DB |
| `moto` | ❌ NON ESISTE · `biciclette` esiste ma è diverso · zero match motociclistico | Categoria mancante DB · serve add OR drop |
| `gioielli` | ✅ ESISTE 1:1 match | OK |
| `vintage` | ❌ NON ESISTE come slug · vintage è trasversale (può essere watch/jewel/electronics) | Strategia TAG non category |
| `arte-collezione` | 🟡 PARZIALE · DB ha `arte` (Arte & Collezionismo) · slug diverso · serve normalize | Mismatch naming |

**Decision tree pre wire (STOP+ASK Skeezu+ROBY):**

#### Opzione A · Pillar+spoke macro-grouping (RACCOMANDATA per SEO authority)
- 6 brief URLs `/categoria/{macro-slug}` aggregano sub-categories DB via mapping
- Mapping mantenuto in `06_public_assets/copy/categorie/_mapping.json`:
  ```json
  {
    "elettronica": ["smartphone","tablet","computer","gaming","audio","fotografia"],
    "luxury": ["orologi","gioielli","borse"],
    "gioielli": ["gioielli"],
    "arte-collezione": ["arte"]
  }
  ```
- ❌ ELIMINA `moto` (zero match DB · brief over-promise · serve drop categoria pillar OR add `moto` a DB con migration W5+)
- 🟡 ELIMINA `vintage` (cross-category · serve TAG strategy `/tag/vintage` filtered grid non pillar page)
- RPC `get_airdrops_by_macro_category(macro_slug TEXT)` con WHERE category = ANY(child_slugs_for_macro)
- Pro: zero touch DB schema · brief copy STRONG mantenuto 4/6 categoria · pillar+spoke SEO depth preserved
- Contro: 2 categoria brief (moto+vintage) droppate · ROBY ricomponi copy se Skeezu vuole add macro nuove (es. veicoli? vino? sport?)

#### Opzione B · ROBY ridraft copy per 16 slug DB attivi
- 16 pillar pages micro-targeted (`/categoria/smartphone` · `/categoria/orologi` · etc.)
- ETA ROBY redraft: ~16 × 30min = ~8h copy effort
- Pro: 1:1 match DB · ogni categoria ha pillar dedicata · max SEO surface
- Contro: ROBY effort 8h non in W5+ window stretto · pillar+spoke depth diluita (16 pillar = thinner authority per pagina) · pre-launch comms focus su FASE A go-live prioritario

#### Opzione C · Hybrid · 6 macro brief + 16 micro DB · BOTH
- `/categoria/{macro}` (6 pillar pages aggregati) + `/categoria/{slug}` (16 thin pages auto-generated da DB metadata)
- ROBY effort: 6 macro copy v1 OK · 16 micro brief shorter (~100 parole each = ~2h)
- CCP effort: 2 RPC + 2 SSR pattern + mapping JSON + sitemap dynamic = ~6h (vs ~4h originale brief)
- Pro: max coverage SEO authority + granularity
- Contro: dilution authority macro · maintenance double · scope creep W5+ → W6

**CCP recommend: Opzione A** (pragmatica · brief STRONG 4/6 mantenuto · zero DB touch · pillar+spoke SEO authority preserved · post-FASE-A ROBY può ridrappare copy v2 per `moto` (add DB migration W6) e `vintage` (TAG strategy)).

### Catch #2 · RPC `get_airdrops_by_category(slug)` NON ESISTE

**Verify:** `find supabase/migrations -name "*.sql" -exec grep -l "get_airdrops_by_category" {} \;` → zero match.

**Serve creazione RPC nuova:**
```sql
CREATE OR REPLACE FUNCTION get_airdrops_by_category(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'title', a.title,
    'category', a.category,
    'value_eur', a.value_eur,
    'status', a.status,
    'duration_days', a.duration_days,
    'image_url', a.image_url,
    'starts_at', a.starts_at,
    'ends_at', a.ends_at
  ) ORDER BY a.starts_at DESC), '[]'::jsonb)
  INTO v_result
  FROM airdrops a
  WHERE a.category = p_slug
    AND a.status IN ('active', 'presale', 'scheduled')
    AND a.is_public = true
  LIMIT 12;
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_airdrops_by_category(TEXT) TO authenticated, anon;
```

Per Opzione A macro-grouping, signature variante:
```sql
CREATE OR REPLACE FUNCTION get_airdrops_by_macro_category(p_macro_slug TEXT, p_child_slugs TEXT[])
-- WHERE a.category = ANY(p_child_slugs)
```

ETA migration: ~30min · grant include · pattern reuse `get_winner_story_public` (Day 1 W4 Atto 6).

### Catch #3 · `vercel.json` zero rewrite categoria

**Verify:** `grep -c "categoria" vercel.json` → 0.

Serve aggiungere 6 rewrites (Opzione A · macro slugs):
```json
{ "source": "/categoria/elettronica", "destination": "/api/categoria-ssr?slug=elettronica" },
{ "source": "/categoria/luxury", "destination": "/api/categoria-ssr?slug=luxury" },
{ "source": "/categoria/gioielli", "destination": "/api/categoria-ssr?slug=gioielli" },
{ "source": "/categoria/arte-collezione", "destination": "/api/categoria-ssr?slug=arte-collezione" }
```
(+ moto+vintage se Skeezu LOCK includes)

OPPURE pattern wildcard (più semplice, scope ALL slugs whitelist nell'SSR):
```json
{ "source": "/categoria/:slug", "destination": "/api/categoria-ssr?slug=:slug" }
```

ETA: ~10min.

## ETA stima CCP revisited (Opzione A + 3 catches addressed)

| Step | Original brief ETA | Revised ETA con catches |
|---|---|---|
| SSR function `/api/categoria-ssr.js` | 2h | 2h (pattern winner-story-ssr.js reuse) |
| 4 markdown extraction copy → repo | 1h | 30min (4 invece di 6 · `moto`+`vintage` dropped) |
| `vercel.json` rewrites | 30min | 10min (wildcard) |
| Sitemap dynamic regen include macro URLs | 30min | 30min |
| **🆕 RPC `get_airdrops_by_macro_category` migration** | NOT in brief | 30min (catch #2) |
| **🆕 `_mapping.json` macro→child slugs** | NOT in brief | 15min (catch #1A) |
| **🆕 Audit-trail post-commit + closing bridge** | NOT in brief | 30min |
| **TOTALE revised** | ~4h | **~4.5-5h** |

W5+ window post-FASE-A go-live · Cuscinetto preserved per implementation push.

## Pattern operativi · CCP standby commitment Day 13

- ✅ **Day 13 UAT FINALE Gio 21/05** · CCP standby fino RS post UAT joint · NO implementazione pillar pages oggi
- ✅ **W5+ window:** quando Skeezu+ROBY LOCK slug strategy (A/B/C), CCP fire pillar pages atomic con:
  - GRANT preserved · migration include EXECUTE grant
  - Verify-before-edit · curl prod + MCP schema lookup pre-edit
  - STOP+ASK pre-COMMIT se Opzione B (16 pillar) o Opzione C (hybrid · scope creep significant)
  - Audit-trail post-commit `CCP_Sprint_W5_..._Closing_*.md`
  - Mini integration test PR (RPC test + SSR endpoint curl + Schema.org validate)
  - Tech ownership · enhance existing `/api/winner-story-ssr.js` pattern · zero rebuild
  - BANNED terms smoke pre-commit (zero hits expected · ROBY copy v1 already clean)
  - Footer bump appropriato
  - Bilingual it/en preserved (brief è IT-only · valutare EN copy parallelo W6+)

## STOP+ASK Skeezu+ROBY · 3 decisioni pre wire W5+

1. **Slug strategy LOCK:** A (macro-grouping 4 slug · CCP recommend) vs B (16 micro slug · ROBY redraft 8h) vs C (hybrid 6+16 · CCP 6h)
2. **Moto + Vintage fate:** drop (Opzione A pure) · add DB migration W6+ (moto) + TAG strategy (vintage) · vs ROBY redraft 14 categoria altri DB slugs?
3. **Floor values brief vs DB:** floor differenziati €500/€1.000/€1.500/€2.500 sostituiscono floor standard €500 (richiede DB schema add `categories.value_floor_eur` column)? OR sono copy-only target audience (no enforcement)?

## Closing peer-tone

ROBY · copy v1 DRAFT brand-coherent STRONG · Italian Editorial Manifesto v2 preserved · Voice 04 BANNED smoke clean · pillar+spoke pattern solido · CTA dual seller/buyer pattern coerente. **NO copy quality blocker** · solo 3 gaps tecnici wiring strategy che richiedono Skeezu+ROBY decision pre wire W5+.

Skeezu · 3 decisioni pendenti (slug strategy + moto/vintage fate + floor values DB enforcement) · CCP recommend Opzione A pragmatica (4 macro slug · zero DB touch · brief copy STRONG 4/6 mantenuto · ROBY post-go-live ridraft moto+vintage v2 con TAG/migration strategy).

CCP · Day 13 UAT FINALE Gio 21/05 standby fino RS post UAT joint bug list compile · pillar pages wire post-FASE-A-go-live W5+ window quando Skeezu+ROBY LOCK strategy.

AIRIA · SysReport Pre-Day13 CRITICAL pre-UAT Gio mattina preserved priority.

Pattern verify-before-brief WORKING preserved (3 catches Day 12.5 sera · pattern feedback_verify_before_brief.md mea culpa W2 Round 6 lesson preserved · STOP+ASK escalation Skeezu pattern feedback_3_options_stop_pattern.md).

Daje team a 4 · UAT FINALE Gio + GO-LIVE Ven 22/05 priorità · pillar pages W5+ window quando LOCK slug strategy 🚀

— **CCP** · 20 May 2026 Mer sera (post Day 12.5 SEALED · review pillar pages v1 DRAFT · 3 catches verify-before-brief · STOP+ASK Skeezu+ROBY)

*Pillar pages v1 review · copy quality STRONG · 3 catches tecnici (slug mismatch DB · RPC missing · vercel rewrite missing) · STOP+ASK 3 decisioni Skeezu+ROBY pre wire W5+ · CCP recommend Opzione A macro-grouping pragmatica · standby Day 13 UAT · daje*
