#!/usr/bin/env node
/**
 * AIROOBI Airdrop Engine — Stress Test & Fairness Simulator
 * ==========================================================
 * Simula scenari reali di airdrop per validare:
 * - Fairness dell'algoritmo di scoring
 * - Costo effettivo per il vincitore
 * - Compenso perdenti (NFT)
 * - Rapporto quotazione/prezzo venditore
 * - Tempo di accumulo ARIA necessario
 *
 * Usage: node scripts/stress_test_engine.js [--verbose]
 */

const VERBOSE = process.argv.includes('--verbose');

// ── CONFIG (specchia airdrop_config defaults) ──────────────────
const CONFIG = {
  // Pesi attuali (v1 — pre-fix)
  v1: { w1: 0.50, w2: 0.30, w3: 0.20, alpha_f3: 0.40, beta_f3: 0.60 },
  // Pesi proposti (v2 — post-fix)
  v2: { w1: 0.65, w2: 0.20, w3: 0.15, alpha_f3: 0.40, beta_f3: 0.60 },

  split: { venditore: 0.6799, fondo: 0.22, airoobi: 0.10, charity: 0.0001 },
  aria_eur: 0.10,
  nft_divisor_alpha_brave: 5,
  daily_aria_max: 7,   // login + check-in + 5 video
  welcome_bonus: 10,
};

// ── FORMULE DI SCORING ─────────────────────────────────────────

function calcF1(userBlocks, maxBlocks) {
  return maxBlocks > 0 ? userBlocks / maxBlocks : 0;
}

function calcF2(userCatHistory, maxCatHistory) {
  if (maxCatHistory <= 0) return 0;
  return Math.log(1 + userCatHistory) / Math.log(1 + maxCatHistory);
}

function calcF3(rankReg, rankBlock, nParticipants, alphaF3, betaF3) {
  if (nParticipants <= 1) return 1.0;
  const normReg = 1 - (rankReg - 1) / (nParticipants - 1);
  const normBlock = 1 - (rankBlock - 1) / (nParticipants - 1);
  return alphaF3 * normReg + betaF3 * normBlock;
}

function calcScore(f1, f2, f3, weights) {
  return weights.w1 * f1 + weights.w2 * f2 + weights.w3 * f3;
}

// ── HELPER: genera partecipanti ────────────────────────────────

function generateParticipants(count, totalBlocks, distribution, options = {}) {
  const participants = [];
  const {
    catHistoryRange = [0, 500],
    regDaysRange = [30, 365],
  } = options;

  let blocksLeft = totalBlocks;

  for (let i = 0; i < count; i++) {
    let blocks;
    if (distribution === 'even') {
      blocks = Math.floor(totalBlocks / count);
    } else if (distribution === 'whale') {
      // Primo partecipante prende 40%, resto distribuito
      blocks = i === 0
        ? Math.floor(totalBlocks * 0.40)
        : Math.floor((totalBlocks * 0.60) / (count - 1));
    } else if (distribution === 'competitive') {
      // Top 3 si contendono, resto piccoli
      if (i < 3) blocks = Math.floor(totalBlocks * 0.25);
      else blocks = Math.floor((totalBlocks * 0.25) / (count - 3));
    } else if (distribution === 'realistic') {
      // Power law: pochi comprano molto, molti comprano poco
      const weight = Math.pow(count - i, 1.5);
      blocks = Math.max(1, Math.floor(weight));
    } else if (typeof distribution === 'function') {
      blocks = distribution(i, count, totalBlocks);
    }

    blocks = Math.min(blocks, blocksLeft);
    blocksLeft -= blocks;

    participants.push({
      id: `user_${String(i + 1).padStart(3, '0')}`,
      blocks,
      catHistory: catHistoryRange[0] + Math.floor(Math.random() * (catHistoryRange[1] - catHistoryRange[0])),
      regDaysAgo: regDaysRange[0] + Math.floor(Math.random() * (regDaysRange[1] - regDaysRange[0])),
      buyOrder: i + 1, // ordine di acquisto del primo blocco
      isNew: i === 0 && options.firstIsNew,
    });
  }

  // Normalizza: se firstIsNew, il primo è nuovo (no history, registrato ieri)
  if (options.firstIsNew && participants.length > 0) {
    participants[0].catHistory = 0;
    participants[0].regDaysAgo = 1;
    participants[0].buyOrder = 1; // ha comprato per primo (era motivato)
  }

  // Se specificato, marca il veterano
  if (options.veteranIndex !== undefined) {
    const v = participants[options.veteranIndex];
    v.catHistory = catHistoryRange[1] * 2;
    v.regDaysAgo = 730; // 2 anni
    v.buyOrder = participants.length; // ha comprato per ultimo (era sicuro di sé)
  }

  return participants;
}

// ── SIMULAZIONE SINGOLA ────────────────────────────────────────

function simulate(airdropConfig, participants, weights) {
  const n = participants.length;
  const maxBlocks = Math.max(...participants.map(p => p.blocks));
  const maxCatHistory = Math.max(...participants.map(p => p.catHistory));

  // Ordina per regDaysAgo DESC per rank registrazione (più vecchio = rank 1)
  const regSorted = [...participants].sort((a, b) => b.regDaysAgo - a.regDaysAgo);
  const regRanks = {};
  regSorted.forEach((p, i) => { regRanks[p.id] = i + 1; });

  // Ordina per buyOrder ASC per rank primo blocco (primo a comprare = rank 1)
  const blockSorted = [...participants].sort((a, b) => a.buyOrder - b.buyOrder);
  const blockRanks = {};
  blockSorted.forEach((p, i) => { blockRanks[p.id] = i + 1; });

  const results = participants.map(p => {
    const f1 = calcF1(p.blocks, maxBlocks);
    const f2 = calcF2(p.catHistory, maxCatHistory);
    const f3 = calcF3(regRanks[p.id], blockRanks[p.id], n, weights.alpha_f3, weights.beta_f3);
    const score = calcScore(f1, f2, f3, weights);

    return {
      id: p.id,
      blocks: p.blocks,
      ariaSpent: p.blocks * airdropConfig.blockPrice,
      eurSpent: p.blocks * airdropConfig.blockPrice * CONFIG.aria_eur,
      catHistory: p.catHistory,
      regDaysAgo: p.regDaysAgo,
      f1: round(f1, 4),
      f2: round(f2, 4),
      f3: round(f3, 4),
      score: round(score, 6),
      isNew: p.isNew,
    };
  });

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => { r.rank = i + 1; });

  const winner = results[0];
  const totalAria = results.reduce((s, r) => s + r.ariaSpent, 0);
  const totalEur = totalAria * CONFIG.aria_eur;

  // Split economica
  const venditoreEur = round(totalEur * CONFIG.split.venditore, 2);
  const fondoEur = round(totalEur * CONFIG.split.fondo, 2);
  const airoobiEur = round(totalEur * CONFIG.split.airoobi, 2);

  // NFT per perdenti
  const losers = results.filter(r => r.rank > 1);
  let totalNft = 0;
  const loserNfts = losers.map(l => {
    const nft = Math.max(1, Math.floor(l.blocks / CONFIG.nft_divisor_alpha_brave));
    totalNft += nft;
    return { id: l.id, blocks: l.blocks, eurSpent: l.eurSpent, nft };
  });

  // Valore NFT post-draw (semplificato: solo contributo di questo airdrop)
  const treasuryBefore = airdropConfig.treasuryBefore || 0;
  const nftCircBefore = airdropConfig.nftCircBefore || 0;
  const treasuryAfter = treasuryBefore + fondoEur;
  const nftCircAfter = nftCircBefore + totalNft;
  const nftValueAfter = nftCircAfter > 0 ? treasuryAfter / nftCircAfter : 0;

  // Perdita media perdenti
  const loserStats = losers.map(l => {
    const nft = loserNfts.find(x => x.id === l.id).nft;
    const nftValue = nft * nftValueAfter;
    const loss = l.eurSpent - nftValue;
    const lossPercent = l.eurSpent > 0 ? (loss / l.eurSpent) * 100 : 0;
    return { ...l, nft, nftValue: round(nftValue, 2), loss: round(loss, 2), lossPercent: round(lossPercent, 1) };
  });

  const avgLossPercent = loserStats.length > 0
    ? round(loserStats.reduce((s, l) => s + l.lossPercent, 0) / loserStats.length, 1)
    : 0;

  return {
    airdropConfig,
    weightsUsed: weights,
    participants: results,
    winner,
    totalAria,
    totalEur: round(totalEur, 2),
    venditoreEur,
    fondoEur,
    airoobiEur,
    totalNft,
    nftValueAfter: round(nftValueAfter, 4),
    loserStats,
    avgLossPercent,
    winnerRoi: round(((airdropConfig.objectValue - winner.eurSpent) / winner.eurSpent) * 100, 1),
    // Tempo accumulo ARIA per il vincitore
    winnerDaysToAccumulate: Math.ceil((winner.ariaSpent - CONFIG.welcome_bonus) / CONFIG.daily_aria_max),
  };
}

function round(n, d) { return Math.round(n * Math.pow(10, d)) / Math.pow(10, d); }

// ── SCENARI ────────────────────────────────────────────────────

const SCENARIOS = [
  {
    name: '1. Base: €1.000, 20 partecipanti, distribuzione uniforme',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2000, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => generateParticipants(20, 2000, 'even'),
  },
  {
    name: '2. Whale: 1 utente compra 40% dei blocchi',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2000, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => generateParticipants(20, 2000, 'whale'),
  },
  {
    name: '3. Nuovo vs Veterano: nuovo compra 500 blocchi, veterano 250',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2000, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => {
      const ps = generateParticipants(10, 2000, (i, n, total) => {
        if (i === 0) return 500; // nuovo utente, compra di più
        if (i === 1) return 250; // veterano, compra la metà
        return Math.floor(1250 / 8); // altri
      }, { firstIsNew: true, veteranIndex: 1, catHistoryRange: [0, 1000] });
      return ps;
    },
  },
  {
    name: '4. Nuovo vs Veterano: nuovo compra 500, veterano 375 (75%)',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2000, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => {
      const ps = generateParticipants(10, 2000, (i, n, total) => {
        if (i === 0) return 500;
        if (i === 1) return 375; // 75% del nuovo
        return Math.floor(1125 / 8);
      }, { firstIsNew: true, veteranIndex: 1, catHistoryRange: [0, 1000] });
      return ps;
    },
  },
  {
    name: '5. Estremo: nuovo compra TUTTI 2000 blocchi, veterano 1 blocco',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2001, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => {
      return [
        { id: 'nuovo', blocks: 2000, catHistory: 0, regDaysAgo: 1, buyOrder: 1, isNew: true },
        { id: 'veterano', blocks: 1, catHistory: 5000, regDaysAgo: 730, buyOrder: 2, isNew: false },
      ];
    },
  },
  {
    name: '6. Treasury matura: €5.000 treasury, 500 NFT, 5° airdrop',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2000, treasuryBefore: 5000, nftCircBefore: 500 },
    participants: () => generateParticipants(30, 2000, 'competitive', { catHistoryRange: [100, 3000] }),
  },
  {
    name: '7. Pochi partecipanti: solo 3 utenti',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2000, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => generateParticipants(3, 2000, 'competitive'),
  },
  {
    name: '8. Categoria nuova: F2=0 per tutti (nessuno storico)',
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2000, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => generateParticipants(15, 2000, 'realistic', { catHistoryRange: [0, 0] }),
  },
  {
    name: '9. Seller pricing: quotazione corretta per garantire €1.000 al venditore',
    // quotazione = 1000 / 0.6799 = €1.471 → 2.942 blocchi
    airdrop: { objectValue: 1000, blockPrice: 5, totalBlocks: 2942, treasuryBefore: 0, nftCircBefore: 0 },
    participants: () => generateParticipants(20, 2942, 'even'),
  },
  {
    name: '10. Luxury: oggetto €5.000, 15 ARIA/blocco',
    airdrop: { objectValue: 5000, blockPrice: 15, totalBlocks: 4906, treasuryBefore: 2000, nftCircBefore: 200 },
    participants: () => generateParticipants(50, 4906, 'realistic', { catHistoryRange: [50, 2000] }),
  },
];

// ── SELLER PRICING ANALYSIS ────────────────────────────────────

function sellerPricingAnalysis() {
  console.log('\n' + '═'.repeat(72));
  console.log('ANALISI PRICING VENDITORE');
  console.log('═'.repeat(72));

  const objectValues = [500, 1000, 2000, 5000, 10000];
  const blockPrices = [5, 10, 15, 25];

  console.log('\n┌─────────────┬──────────┬──────────────┬──────────┬────────────┬────────────┐');
  console.log('│ Valore Ogg. │ Prezzo/B │ Quot. Giusta │ N° Bloc. │ Vend. EUR  │ Gap EUR    │');
  console.log('├─────────────┼──────────┼──────────────┼──────────┼────────────┼────────────┤');

  for (const objVal of objectValues) {
    const bp = objVal <= 1500 ? 5 : objVal <= 3000 ? 10 : objVal <= 15000 ? 15 : 25;
    // Quotazione ERRATA (v1): quotazione = valore oggetto
    const quotV1 = objVal;
    const blocksV1 = Math.ceil(quotV1 / (bp * CONFIG.aria_eur));
    const venditoreV1 = round(blocksV1 * bp * CONFIG.aria_eur * CONFIG.split.venditore, 2);
    const gapV1 = round(objVal - venditoreV1, 2);

    // Quotazione CORRETTA (v2): quotazione = valore / split_venditore
    const quotV2 = round(objVal / CONFIG.split.venditore, 2);
    const blocksV2 = Math.ceil(quotV2 / (bp * CONFIG.aria_eur));
    const venditoreV2 = round(blocksV2 * bp * CONFIG.aria_eur * CONFIG.split.venditore, 2);

    console.log(`│ €${String(objVal).padStart(9)} │ ${String(bp).padStart(5)} AR │ €${String(quotV2).padStart(10)} │ ${String(blocksV2).padStart(8)} │ €${String(venditoreV2).padStart(8)} │ ✓ OK       │`);
    console.log(`│  (se quot=val)    │          │ €${String(quotV1).padStart(10)} │ ${String(blocksV1).padStart(8)} │ €${String(venditoreV1).padStart(8)} │ -€${String(gapV1).padStart(7)} ✗ │`);
  }
  console.log('└─────────────┴──────────┴──────────────┴──────────┴────────────┴────────────┘');
  console.log('\n⚠ Se quotazione = valore oggetto, il venditore perde il 32% (1 - 0.6799)');
  console.log('✓ Quotazione corretta: object_value_eur = seller_target / 0.6799');
}

// ── ARIA ACCUMULATION TIME ─────────────────────────────────────

function ariaAccumulationAnalysis() {
  console.log('\n' + '═'.repeat(72));
  console.log('TEMPO ACCUMULO ARIA (per partecipare competitivamente)');
  console.log('═'.repeat(72));

  const scenarios = [
    { blocks: 100, bp: 5, label: '100 blocchi (piccola partecipazione)' },
    { blocks: 300, bp: 5, label: '300 blocchi (partecipazione media)' },
    { blocks: 500, bp: 5, label: '500 blocchi (partecipazione forte, €1K obj)' },
    { blocks: 200, bp: 15, label: '200 blocchi × 15 ARIA (luxury €5K obj)' },
  ];

  console.log('\n┌──────────────────────────────────────────┬───────────┬──────────┬──────────┐');
  console.log('│ Scenario                                 │ ARIA tot  │ Giorni   │ Mesi     │');
  console.log('├──────────────────────────────────────────┼───────────┼──────────┼──────────┤');

  for (const s of scenarios) {
    const ariaNeeded = s.blocks * s.bp;
    const days = Math.ceil((ariaNeeded - CONFIG.welcome_bonus) / CONFIG.daily_aria_max);
    const months = round(days / 30, 1);
    console.log(`│ ${s.label.padEnd(40)} │ ${String(ariaNeeded).padStart(7)} AR │ ${String(days).padStart(6)} gg │ ${String(months).padStart(6)} m │`);
  }
  console.log('└──────────────────────────────────────────┴───────────┴──────────┴──────────┘');

  console.log('\nReferral boost (10 ARIA per referral):');
  const ariaFor500 = 500 * 5;
  for (const refs of [0, 5, 10, 25, 50]) {
    const bonus = refs * 10 + CONFIG.welcome_bonus;
    const remaining = ariaFor500 - bonus;
    const days = Math.ceil(remaining / CONFIG.daily_aria_max);
    console.log(`  ${refs} referral → ${days} giorni (${round(days/30,1)} mesi) per 2.500 ARIA`);
  }
}

// ── SUCCESS CHECK BUG ANALYSIS ─────────────────────────────────

function successCheckBugAnalysis() {
  console.log('\n' + '═'.repeat(72));
  console.log('BUG: SUCCESS CHECK — seller_min_price vs totale vs quota venditore');
  console.log('═'.repeat(72));

  const cases = [
    { sellerMin: 800, ariaCollected: 10000, label: 'All sold (€1K airdrop, min €800)' },
    { sellerMin: 800, ariaCollected: 8000, label: '80% sold (€800 totali)' },
    { sellerMin: 500, ariaCollected: 6000, label: '60% sold (€600 totali, min €500)' },
  ];

  console.log('\n┌────────────────────────────────────┬───────────┬───────────┬────────────┬────────────┐');
  console.log('│ Caso                               │ Tot. EUR  │ Min. EUR  │ SQL v1 ✗   │ SQL v2 ✓   │');
  console.log('├────────────────────────────────────┼───────────┼───────────┼────────────┼────────────┤');

  for (const c of cases) {
    const totalEur = round(c.ariaCollected * CONFIG.aria_eur, 2);
    const venditoreEur = round(totalEur * CONFIG.split.venditore, 2);

    // v1 (bug): confronta totale vs seller_min
    const v1Pass = totalEur >= c.sellerMin;
    // v2 (fix): confronta quota venditore vs seller_min
    const v2Pass = venditoreEur >= c.sellerMin;

    const v1Label = v1Pass ? 'PASS (' + totalEur + ')' : 'FAIL';
    const v2Label = v2Pass ? 'PASS (' + venditoreEur + ')' : 'FAIL';

    console.log(`│ ${c.label.padEnd(34)} │ €${String(totalEur).padStart(7)} │ €${String(c.sellerMin).padStart(7)} │ ${v1Label.padEnd(10)} │ ${v2Label.padEnd(10)} │`);

    if (v1Pass && !v2Pass) {
      console.log(`│  ⚠ BUG: airdrop passa ma venditore riceve solo €${venditoreEur} < €${c.sellerMin}      │`);
    }
  }
  console.log('└────────────────────────────────────┴───────────┴───────────┴────────────┴────────────┘');
}

// ── MAIN ───────────────────────────────────────────────────────

function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║    AIROOBI Airdrop Engine — Stress Test & Fairness Report           ║');
  console.log('║    ' + new Date().toISOString().slice(0, 10) + '                                                        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  // ── Confronto pesi v1 vs v2 per ogni scenario ──
  for (const scenario of SCENARIOS) {
    console.log('\n' + '─'.repeat(72));
    console.log(`SCENARIO: ${scenario.name}`);
    console.log('─'.repeat(72));

    const participants = scenario.participants();

    for (const [label, weights] of [['v1 (attuale)', CONFIG.v1], ['v2 (proposto)', CONFIG.v2]]) {
      const result = simulate(scenario.airdrop, participants, weights);

      console.log(`\n  ▸ Pesi ${label}: w1=${weights.w1} w2=${weights.w2} w3=${weights.w3}`);
      console.log(`    Vincitore: ${result.winner.id} — score ${result.winner.score} — ${result.winner.blocks} blocchi — €${result.winner.eurSpent} spesi`);
      console.log(`    ROI vincitore: ${result.winnerRoi}% (oggetto €${scenario.airdrop.objectValue} per €${result.winner.eurSpent})`);
      console.log(`    Giorni accumulo ARIA vincitore: ${result.winnerDaysToAccumulate}`);
      console.log(`    Revenue: €${result.totalEur} | Venditore: €${result.venditoreEur} | Fondo: €${result.fondoEur} | Fee: €${result.airoobiEur}`);
      console.log(`    NFT distribuiti: ${result.totalNft} — valore unitario: €${result.nftValueAfter}`);
      console.log(`    Perdita media perdenti: ${result.avgLossPercent}%`);

      if (VERBOSE) {
        console.log('    Classifica:');
        for (const p of result.participants.slice(0, 5)) {
          const marker = p.rank === 1 ? ' ★ WINNER' : '';
          const newTag = p.isNew ? ' [NUOVO]' : '';
          console.log(`      #${p.rank} ${p.id}${newTag}: score=${p.score} (F1=${p.f1} F2=${p.f2} F3=${p.f3}) blocks=${p.blocks} €${p.eurSpent}${marker}`);
        }
        if (result.participants.length > 5) {
          console.log(`      ... +${result.participants.length - 5} partecipanti`);
        }
      }
    }
  }

  // ── Analisi specifiche ──
  sellerPricingAnalysis();
  ariaAccumulationAnalysis();
  successCheckBugAnalysis();

  // ── Riepilogo fairness ──
  console.log('\n' + '═'.repeat(72));
  console.log('RIEPILOGO FAIRNESS — CONFRONTO v1 vs v2');
  console.log('═'.repeat(72));

  // Test chiave: scenario 5 (estremo nuovo vs veterano)
  const extremeParticipants = SCENARIOS[4].participants();
  const r1 = simulate(SCENARIOS[4].airdrop, extremeParticipants, CONFIG.v1);
  const r2 = simulate(SCENARIOS[4].airdrop, extremeParticipants, CONFIG.v2);

  console.log('\nTest estremo: nuovo (2000 blocchi) vs veterano (1 blocco)');
  console.log(`  v1: vincitore = ${r1.winner.id} (score ${r1.winner.score})`);
  console.log(`  v2: vincitore = ${r2.winner.id} (score ${r2.winner.score})`);

  // Calcola soglia break-even
  for (const [label, weights] of [['v1', CONFIG.v1], ['v2', CONFIG.v2]]) {
    // Trova il rapporto minimo Y/X dove il veterano batte il nuovo
    let threshold = 0;
    for (let pct = 1; pct <= 100; pct++) {
      const vetBlocks = Math.floor(500 * pct / 100);
      const testPs = [
        { id: 'nuovo', blocks: 500, catHistory: 0, regDaysAgo: 1, buyOrder: 1, isNew: true },
        { id: 'veterano', blocks: vetBlocks, catHistory: 5000, regDaysAgo: 730, buyOrder: 2, isNew: false },
      ];
      const r = simulate(SCENARIOS[4].airdrop, testPs, weights);
      if (r.winner.id === 'veterano') {
        threshold = pct;
        break;
      }
    }
    console.log(`  ${label}: veterano vince se compra >=${threshold}% dei blocchi del nuovo`);
  }

  console.log('\n' + '═'.repeat(72));
  console.log('RACCOMANDAZIONI');
  console.log('═'.repeat(72));
  console.log(`
  1. PRICING: Adottare formula quotazione = seller_target / 0.6799
     → Garantisce prezzo di mercato al venditore

  2. PESI: Passare a v2 (w1=0.65, w2=0.20, w3=0.15)
     → Veterano deve comprare ~74% dei blocchi del nuovo (era 48%)
     → Chi compra di più ha vantaggio reale

  3. SQL FIX: Correggere success check
     → v_venditore_eur >= seller_min_price (non totale >= min)

  4. ARIA FLOW: Considerare ARIA acquistabili o boost events
     → 5+ mesi per una partecipazione competitiva è troppo lungo
     → Alternativa: airdrop con blocchi più economici (2-3 ARIA)

  5. LOSER COMPENSATION: Nei primi airdrop le perdite sono ~77%
     → Mitigazione: bonus NFT fase Alpha Brave (min 2 per partecipante?)
     → O: divisore 3 invece di 5 nella fase alpha
`);

  console.log('Test completato. Usa --verbose per dettagli per partecipante.');
}

main();
