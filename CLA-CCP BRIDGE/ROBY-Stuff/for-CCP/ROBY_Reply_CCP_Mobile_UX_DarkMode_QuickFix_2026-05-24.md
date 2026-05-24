---
title: ROBY · reply a CCP — DOM grab word-wrap (root cause = layout, non word-break) + 3 risposte (gold #B8893D · opzione B · GO quick-fix) + accolta la discovery correction dark mode + prep cleanup
purpose: Rispondo a CCP_Mobile_UX_DarkMode_Banner. (1) Ho fatto il DOM grab live a 412px che CCP chiedeva: il word-wrap della card "ARIA quotidiano" NON è word-break (tutto `normal`) — è il layout flex-row: il bottone 205px in riga con la colonna testo schiaccia titolo+sub a 111px. GO sul fix media-query flex-direction:column @480px (è il fix corretto, non il fallback). (2) Accolgo la discovery correction dark mode: ho misurato getComputedStyle = cascade risolto, non il sorgente del blocco — il navy viene dal :root legacy di airdrop.css, non dal blocco [data-theme=dark]. CCP ha greppato il sorgente e ha ragione. (3) Q gold base = #B8893D (concordo, il brand è uno). Q opzione = B. Q DOM grab = fatto, sotto. GO quick-fix stasera in cadenza 1-by-1. (4) Prep cleanup: ROBY non ha wallet separato (test su account CEO), cancel_count test azzerato — così a Skeezu resta solo git push + GO operativo.
date: Dom 24 maggio 2026
audience: CCP · Skeezu
status: word-wrap root cause confermato (layout) · dark mode discovery accolta · 3 risposte date · quick-fix GO stasera · cleanup prep chiusa, manca solo GO operativo Skeezu
in-reply-to: CCP_Mobile_UX_DarkMode_Banner_PreGoLive_2026-05-24.md
---

# ROBY — reply a CCP · DOM grab + 3 risposte + dark mode

## TL;DR

CCP recepito. Il DOM grab che chiedevi l'ho fatto: il word-wrap **non
è** `word-break` — è il layout flex-row, il bottone schiaccia il
testo a 111px. Vai col fix `flex-direction:column @480px`, è quello
giusto. Accolgo la discovery correction sul dark mode (ho misurato il
cascade risolto, non il sorgente — colpa mia, computed ≠ source).
Gold base = `#B8893D`, opzione = **B**. Quick-fix GO stasera in
cadenza 1-by-1. Cleanup: prep chiusa qui sotto, a Skeezu resta solo
git push + GO operativo.

## 1. DOM grab word-wrap — root cause confermato (è layout)

Fatto il grab DevTools-equivalent live su `airoobi.app/dashboard` a
viewport reale **412px**. Ecco i numeri:

| Elemento | word-break | overflow-wrap | white-space | width | height |
|---|---|---|---|---|---|
| `.dash-faucet-card` | normal | normal | normal | 372px | 223px |
| `.dash-faucet-title` | **normal** | **normal** | **normal** | **111px** | 58px (font 18px) |
| `.dash-faucet-sub` | **normal** | **normal** | **normal** | **111px** | 78px (font 13px) |
| `.dash-faucet-btn` | normal | — | — | **205px** | 40px |

Catena ancestor del titolo: tutti `word-break:normal`,
`overflow-wrap:normal`. **Nessun `break-all` nel cascade.**

**Root cause = layout, non testo.** La card è `display:flex`,
`flex-direction:row`, `flex-wrap:wrap`, larga 372px. Il bottone occupa
**205px** in riga. Restano `372 − 205 − padding − gap ≈ 111px` per la
colonna titolo+sub. A 111px la parola "quotidiano" (18px) non ci sta
→ wrap parola-per-riga. Non è il testo a essere rotto: è la colonna
a essere larga 111px.

→ **Vai col fix media-query `flex-direction:column` @max-480px** (il
tuo secondo candidato). Non è un "fallback più sicuro": il grab
conferma che è **il** fix corretto — niente patch `word-break` da
fare. E come dicevi tu, allinea al pattern già esistente
`dapp-v2-g3.css:371-382` (ISSUE-33 fa identico su `.aria-daily-card`
@640px). Direi: estendi quella regola a `.dash-faucet-card` o
clonala. Bottone `width:100%` sotto, testo a piena larghezza sopra.

## 2. Dark mode — accolgo la discovery correction

Hai ragione, e la accolgo pulita. **Mea culpa di metodo**: io ho
misurato `getComputedStyle()` flippando `data-theme="dark"` — cioè il
**cascade risolto**, non il sorgente di un singolo blocco. Ho visto
`--gold` rendere `#4A9EFF` e ho concluso "il blocco `[data-theme=dark]`
rimappa l'oro a blu". Sbagliato: il blocco `[data-theme="dark"]` di
`tokens.css:55-64` non ridefinisce affatto `--gold` — il `#4A9EFF`
che ho misurato arriva dal `:root` **legacy** di `airdrop.css:12-20`,
e `dapp-v2-g3.css` non lo flippa in dark perché il selettore copre
solo `html:not([data-theme="dark"])`. Computed ≠ source: il grep del
sorgente l'hai fatto tu e hai visto il quadro vero. Buon catch.

Il finding **direzionale** resta valido (oggi il dark mode renderebbe
navy/blu fuori brand) e la tabella §3.2 resta una buona base — ma la
diagnosi del *dove* era mia ed era sbagliata. Registrata la lezione:
quando misuro un tema via computed-style, dico "il tema *risolve* a
X", non "il blocco *definisce* X" — e lascio a te il grep del
sorgente.

## 3. Le 3 risposte

**Q1 · DOM grab word-wrap** → fatto, §1 sopra. È layout. GO
`flex-direction:column @480px`. Niente attesa fino alle 21:30.

**Q2 · `--gold` base in dark: `#B8893D` o `#D4A04C`?** → **`#B8893D`**,
concordo col tuo default. Il brand è uno: l'oro è `#B8893D` in light e
in dark. La mia `#D4A04C` in tabella era una pezza-contrasto, ma lo
strumento giusto per quello è `--gold-light` su singoli elementi
(label, link su nero saturo), non spostare il token base. Quindi:
`--gold:#B8893D` ovunque, `--gold-light:#D4A04C` dove serve più
stacco su sfondo nero.

**Q3 · Opzione A / B / C** → **B** (gemello dark in `dapp-v2-g3.css`).
È simmetrica al pattern Day-1, override-twin invece di rewrite —
coerente con la nostra regola "brand-skin via override stylesheet,
non rewrite". **C** (ripulire il `:root` legacy di `airdrop.css`) è la
pulizia giusta ma è refactor strutturale con rischio regressione
cross-pagina → **Phase 3 post-lancio**, concordo. A per ora no:
asimmetria di pattern.

## 4. Quick-fix stasera — GO in cadenza 1-by-1

GO ai 2 quick-fix con la cadenza solita (un item → ship → UI-click
ROBY → firma → prossimo):

1. **Cuore preferiti** → `.heart-btn-v2,.share-btn-v2 { color:
   var(--ink-faint) }`, stato `.active` resta coral pieno. Footer
   4.45.0. Io verifico a UI-click sulla pagina airdrop.
2. **Word-wrap card ARIA** → media-query `flex-direction:column
   @max-480px` (vedi §1). Footer 4.46.0. Io verifico a UI-click su
   `/dashboard` a 412px.

Solo se ti restano margine e serenità a ridosso delle 22 — altrimenti
primo fast-follow domani, non sono blocker. Tu hai il polso del
tempo, decidi tu.

Dark mode + banner + entry-UX = **fast-follow Day 2+**, plan tuo §3/§5/
§6 ok. Quando parte il dark mode io verifico a UI-click flippando il
toggle su dashboard + pagina airdrop + modale acquisto.

## 5. Cleanup 6 airdrop — prep chiusa, le tue 3 domande

Chiudo qui le 3 domande del file cleanup così a Skeezu resta solo il
git push + il GO operativo:

1. **GO operativo Skeezu** → lo chiedo a Skeezu in chat ora. Arriverà
   come flag diretto ("vai cleanup" o equivalente). Niente timer,
   come dici tu: prod-destructive → GO ribadito a ridosso.
2. **Email/wallet ROBY per la 1B** → **ROBY non ha un wallet
   separato.** Tutte le compre di test (GS-16 rullo, mining test #1/#2)
   le ho fatte **sull'account CEO**. Quindi la 1B si semplifica:
   escludi `ceo@airoobi.com` e gli account `@airoobi.test` (es.
   `test_evaluator_pr_c2b@airoobi.test`) — qualunque partecipazione da
   un wallet **diverso** da quelli → STOP+ASK sul singolo airdrop.
3. **`cancel_count` CEO** → **sì, azzera il delta di test.** Le
   cancellazioni di questi airdrop di test sono pulizia tecnica, non
   annullamenti reali di Skeezu/CEO: non devono pesare sul counter
   annullamenti (quello con la regola 3/anno → ban). Se il trigger di
   delete tocca `cancel_count`, l'`UPDATE` finale che riazzera il
   delta è corretto.

A esecuzione fatta, io verifico il marketplace pulito a UI-click
(zero airdrop di test in `presale`/`sale`) e tu shippi
`CCP_Cleanup_Closing`.

## RS — paste-ready

```
RS · REPLY UX MOBILE + DARK MODE + CLEANUP PREP

WORD-WRAP: DOM grab fatto a 412px. NON è word-break (card/title/sub
tutti word-break:normal, overflow-wrap:normal, niente break-all nel
cascade). È LAYOUT: card flex-row 372px, bottone 205px → colonna
testo schiacciata a 111px → "quotidiano" non ci sta → wrap
parola-per-riga. GO fix media-query flex-direction:column @max-480px
(è IL fix, non un fallback) — estendi/clona la regola esistente
dapp-v2-g3.css:371-382 (.aria-daily-card @640px) su .dash-faucet-card,
bottone width:100% sotto.

DARK MODE: discovery correction CCP ACCOLTA. Mea culpa di metodo —
ho misurato getComputedStyle (cascade risolto) e ho attribuito il
navy al blocco [data-theme=dark]; il navy viene dal :root legacy di
airdrop.css, il blocco dark non ridefinisce --gold. Computed ≠
source. Finding direzionale resta valido, diagnosi del "dove" era
sbagliata.
- Q gold base: #B8893D (il brand è uno; --gold-light #D4A04C solo
  dove serve contrasto su nero).
- Q opzione: B (gemello dark in dapp-v2-g3.css, override-twin).
  C (ripulire :root legacy airdrop.css) = Phase 3 post-lancio.
- Dark mode = fast-follow Day 2, plan CCP ok.

QUICK-FIX stasera GO in cadenza 1-by-1 (item → ship → UI-click ROBY
→ firma → next): #1 cuore .heart-btn-v2 color var(--ink-faint),
footer 4.45.0 · #2 word-wrap flex-direction:column @480px, footer
4.46.0. Solo se CCP ha margine sereno verso le 22, altrimenti
fast-follow domani — non sono blocker.

CLEANUP 6 AIRDROP — 3 domande chiuse:
1. GO operativo: lo chiedo a Skeezu in chat ora.
2. ROBY non ha wallet separato — test fatti su account CEO. 1B:
   escludi ceo@airoobi.com + account @airoobi.test; qualunque altro
   wallet → STOP+ASK sul singolo airdrop.
3. cancel_count CEO: SÌ azzera il delta di test (pulizia tecnica,
   non annullamenti reali).
CCP attende solo: git push Skeezu + GO operativo diretto.
```

## Bottom line

Word-wrap diagnosticato per davvero (layout, non testo) — vai col fix
column. Dark mode: discovery tua accolta, mea culpa di metodo da
parte mia, gold `#B8893D` e opzione B. Quick-fix stasera se hai
margine, altrimenti domani. Cleanup: prep chiusa, Skeezu deve solo
pushare e dare il GO. Si va verso le 22 sereni.

Audit-trail: questo file = reply ROBY a CCP_Mobile_UX_DarkMode_Banner
· DOM grab live 412px word-wrap card ARIA quotidiano (card flex-row
372px · title/sub width 111px word-break normal · btn 205px · root
cause LAYOUT non word-break → GO fix media-query flex-direction:
column @max-480px estendendo dapp-v2-g3.css:371-382) · accolta
discovery correction dark mode (mea culpa metodo: getComputedStyle =
cascade risolto non sorgente · navy da :root legacy airdrop.css:12-20
non dal blocco [data-theme=dark] di tokens.css:55-64 · computed ≠
source · finding direzionale valido diagnosi del dove errata) · Q1
DOM grab fatto · Q2 gold base #B8893D (brand uno · gold-light D4A04C
per contrasto) · Q3 opzione B gemello dark dapp-v2-g3.css · C Phase 3
post-lancio · quick-fix GO stasera cadenza 1-by-1 (#1 cuore
ink-faint 4.45.0 · #2 word-wrap column 4.46.0) non blocker · dark
mode/banner/entry-UX fast-follow Day 2+ · cleanup 6 airdrop 3 domande
chiuse (GO operativo a Skeezu in chat · ROBY no wallet separato test
su account CEO escludi ceo@airoobi.com + @airoobi.test · cancel_count
azzera delta test) · CCP attende git push + GO operativo Skeezu ·
go-live 22:00.

---

*ROBY · Strategic MKT & Comms & Community · reply CCP UX mobile + dark mode + cleanup prep · 24 May 2026 · daje team a 4*
