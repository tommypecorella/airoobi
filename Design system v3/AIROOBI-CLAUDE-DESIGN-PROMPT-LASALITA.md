# LA SALITA — prompt per Claude Design (componente sostitutivo del "rullo")

> **Header operativo (non fa parte del prompt).**
> Origine: brainstorming Skeezu + CCP, 9 lug 2026, ~01:00. Decisioni firmate Skeezu via AskUserQuestion:
> (1) metafora = **salita verso la vetta** · (2) finestra corridori = **top 3 + i 5 davanti a te + TU + ultimi 3** ·
> (3) ROBI nascosti = **traguardi volanti sul percorso** · (4) tono = **spinta** (sorpassi, boost, volata finale).
> Una **v1 funzionante è già live** su airoobi.app (dapp.js `renderSalita`, commit 9 lug): usarla come base
> funzionale/dati; a Claude Design chiediamo la versione visivamente definitiva.
> Estende il prompt madre `AIROOBI-CLAUDE-DESIGN-PROMPT.md` (ROBI, 8 lug) — §1 leggi brand, §2 palette-lock,
> §3 tipografia, §4 token: TUTTO invariato e vincolante anche qui.

=== INIZIO PROMPT ===

Sei un product designer senior. Devi disegnare **LA SALITA**, il componente-cuore della pagina airdrop di AIROOBI (marketplace di airdrop equi, ecommerce-first). Sostituisce la vecchia visualizzazione a griglia ("rullo", vietata: richiamava la slot machine).

## Concetto
**L'airdrop è una corsa in salita.** Più blocchi di partecipazione compri, più il tuo punteggio sale, più sei vicino alla vetta. In vetta c'è **l'oggetto** (foto reale del prodotto). La posizione è **deterministica** (punteggio = √blocchi × moltiplicatore fedeltà + boost di garanzia): la Salita rende VISIBILE questa trasparenza — è sport, non azzardo. Chi è in vetta alla chiusura ottiene l'oggetto; tutti gli altri guadagnano comunque ROBI Reward.

## Leggi inviolabili (dal prompt madre, §1)
- **ANTI-GAMBLING anche estetico**: MAI slot/rulli/ruote/dadi/luci jackpot/coriandoli. La corsa è metafora SPORT (ciclismo/alpinismo/trail): fatica, distacchi, sorpassi, skill.
- Lessico vietato: azzardo, lotteria, scommessa, sorteggio, jackpot, puntata, vinci/vincitore (usare: «1ª posizione», «in vetta», «ottiene l'oggetto»).
- **ZERO ORO**. Palette v3: rosso #EF3E4F (primary), ardesia #33404F, bluette #2F6BFF (link), ARIA #4A9EFF, KAS #49EACB. Light + dark completi.
- Font: Space Grotesk (display) · Inter (body) · JetBrains Mono (dati/numeri tabellari).
- MiCA: mai promesse di prezzo/apprezzamento ROBI.

## Anatomia del componente
1. **Il sentiero**: percorso che sale (zigzag/tornanti) dal fondovalle alla vetta. Tratteggiato, discreto — è la scenografia, non il protagonista. Considerare curve di livello / quote (100m…1104m = quotazione oggetto in €? valutare) come texture editoriale.
2. **La vetta**: foto reale dell'oggetto (thumb 52-64px, radius, bordo primary) + micro-label «VETTA». È il traguardo emotivo: deve essere l'elemento più desiderabile del componente.
3. **I corridori**: avatar circolari degli utenti posizionati sul sentiero in base al punteggio relativo al leader. **Fallback avatar**: simbolo AIROOBI «OO» monocromo, tinta deterministica dall'id utente (hash → hue HSL, così ogni utente ha sempre il suo colore).
4. **Finestra corridori (regola Skeezu)**: si vedono sempre **top 3 assoluti + i 5 immediatamente davanti a te + TU + gli ultimi 3 assoluti**. I tratti compressi mostrano una pillola «+N» sul sentiero. Il TUO avatar: più grande, anello primary, label «TU · N°».
5. **Traguardi volanti (ROBI nascosti)**: bandierine lungo il sentiero = i ROBI nascosti nei blocchi. Trovati = bandierina piena rossa; ancora nascosti = tratteggiata. Contatore «X/Y ROBI trovati sul percorso». MAI rivelare in quali blocchi (no spoiler).
6. **Boost di garanzia** (pity attivo): fiammella/badge sul TUO avatar — metafora «scia/gambe buone», non fortuna.
7. **VOLATA FINALE**: chip pulsante quando mancano <24h alla chiusura.

## Comportamenti (tono «spinta»)
- Al buy: il tuo avatar **avanza con transizione morbida** lungo il sentiero (curva emphasized ~900ms) + micro-step scale. L'esito ROBI resta all'unboxing (componente separato già esistente).
- **Sorpassi live**: quando la tua posizione cambia (polling 30s) → toast «Sorpasso! Ora sei N°» / «Ti hanno superato — riprenditi la posizione!».
- Stato vetta: se sei 1° → «Sei in vetta — difendi la posizione» (mai «stai vincendo»).
- Empty state: «Il sentiero è libero — parti per primo».
- `prefers-reduced-motion`: tutto statico. Focus ring 2px, contrasto AA, hit-target ≥44px, alt/aria per ogni avatar.

## Output attesi
1. Mockup light + dark del componente nella pagina airdrop (colonna ~480px desktop, full-width mobile).
2. Stati: gara affollata (50+ corridori) · gara a 2 · empty · io in vetta · io ultimo con Boost attivo · volata finale.
3. Micro-interazioni chiave (buy-avanzamento, sorpasso) descritte o in motion-spec.
4. Variante compatta per la card airdrop nel marketplace (mini-salita sparkline con 3 avatar).

=== FINE PROMPT ===

— CCP · v1 live come base: `src/dapp.js` → `renderSalita()` · dati: `calculate_winner_score` (rank/score/pity) + `profiles.avatar_url` + `get_airdrop_rullo_count` (contatori ROBI, no posizioni)
