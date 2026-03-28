#!/usr/bin/env node
/**
 * AIROOBI D-Day Simulator v2 — Mainnet Launch Economic Model
 * ============================================================
 * Modello economico corretto:
 *
 *   ARIA = stablecoin €0.10 fisso. Si guadagna o si compra (min €1).
 *   ROBI = quota del Fondo Comune (come ETF).
 *     valore_quota = treasury / nft_circolanti
 *   Partecipare = minare quote:
 *     - Vincitore → ottiene l'oggetto
 *     - TUTTI gli altri → ricevono NFT frazionari proporzionali alla spesa
 *     - Nessuno escluso
 *   Difficoltà mining = basata sul prezzo dell'oggetto (non sulla fase):
 *     divisore = ceil(valore_oggetto / 100)
 *   Treasury alimentato da: airdrop (22%) + video ads (50%) + sponsor + altro
 *
 * Usage: node scripts/dday_simulator.js [--verbose]
 */

const VERBOSE = process.argv.includes('--verbose');

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════

const ARIA_EUR = 0.10;     // stablecoin fisso
const ARIA_MIN_BUY = 10;   // min €1 = 10 ARIA

const SPLIT = { venditore: 0.6799, fondo: 0.22, airoobi: 0.10, charity: 0.0001 };

const WEIGHTS = { w1: 0.65, w2: 0.20, w3: 0.15 };

// Mining difficulty: divisore = ceil(object_value / MINING_K)
const MINING_K = 100;
// → €500 = div 5, €1K = div 10, €3K = div 30, €5K = div 50, €10K = div 100

// Minimo ARIA per partecipare (% del valore oggetto in ARIA)
const MIN_PARTICIPATION_PCT = 0.01; // 1% del valore → es. €1K oggetto → min 100 ARIA (€10)

// Ads
const ADS = {
  video_cpm: 12.50,
  display_cpm: 3.00,
  display_pages_per_session: 5,
  video_split_fondo: 0.50,
  // Video triggers
  videos_per_login: 1,
  videos_per_block_purchase: 2,  // formula d'oro
  videos_per_daily_checkin: 1,
};

// Categorie D-Day
const CATEGORIES = [
  { name: 'Tech',      objectValue: 1000,  blockPrice: 5  },
  { name: 'Lifestyle',  objectValue: 750,   blockPrice: 5  },
  { name: 'Luxury',     objectValue: 3000,  blockPrice: 15 },
];

// ══════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════

function round(n, d) { return Math.round(n * Math.pow(10, d)) / Math.pow(10, d); }
function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

// ══════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════

function generateUsers() {
  const users = [];

  // 10 Alpha — ARIA guadagnati (100-10.000 random)
  for (let i = 0; i < 10; i++) {
    users.push({
      id: `alpha_${i + 1}`,
      type: 'alpha',
      ariaBalance: randInt(100, 10000),
      eurSpentOnAria: 0,  // gratis
      eurSpentTotal: 0,
      regDaysAgo: randInt(180, 540),
      catHistory: {},
      nftShares: 0,       // NFT frazionari accumulati
      objectsWon: [],
      totalEurWon: 0,
      videosWatched: 0,
    });
  }

  // 10 Mainnet — comprano ARIA a €0.10
  for (let i = 0; i < 10; i++) {
    const budget = randInt(10, 200); // €10-€200
    const ariaBought = Math.floor(budget / ARIA_EUR);
    users.push({
      id: `mainnet_${i + 1}`,
      type: 'mainnet',
      ariaBalance: ariaBought,
      eurSpentOnAria: budget,
      eurSpentTotal: budget,
      regDaysAgo: randInt(0, 30),
      catHistory: {},
      nftShares: 0,
      objectsWon: [],
      totalEurWon: 0,
      videosWatched: 0,
    });
  }

  return users;
}

// ══════════════════════════════════════════════════════════════
// SCORING (semplificato)
// ══════════════════════════════════════════════════════════════

function scoreParticipants(participants) {
  const n = participants.length;
  if (n === 0) return [];

  const maxBlocks = Math.max(...participants.map(p => p.blocks));
  const maxCatHist = Math.max(...participants.map(p => p.catHist || 0));
  const regSorted = [...participants].sort((a, b) => b.regDaysAgo - a.regDaysAgo);
  const buySorted = [...participants].sort((a, b) => a.buyOrder - b.buyOrder);

  return participants.map(p => {
    const f1 = maxBlocks > 0 ? p.blocks / maxBlocks : 0;
    const f2 = maxCatHist > 0 ? Math.log(1 + (p.catHist || 0)) / Math.log(1 + maxCatHist) : 0;
    const regRank = regSorted.findIndex(x => x.id === p.id) + 1;
    const buyRank = buySorted.findIndex(x => x.id === p.id) + 1;
    const f3 = n === 1 ? 1.0 :
      0.40 * (1 - (regRank - 1) / (n - 1)) +
      0.60 * (1 - (buyRank - 1) / (n - 1));
    const score = WEIGHTS.w1 * f1 + WEIGHTS.w2 * f2 + WEIGHTS.w3 * f3;
    return { ...p, f1: round(f1, 4), f2: round(f2, 4), f3: round(f3, 4), score: round(score, 6) };
  }).sort((a, b) => b.score - a.score);
}

// ══════════════════════════════════════════════════════════════
// MINING DIFFICULTY
// ══════════════════════════════════════════════════════════════

function miningDivisor(objectValue) {
  return Math.max(1, Math.ceil(objectValue / MINING_K));
}

function calcNftShares(blocks, objectValue) {
  const div = miningDivisor(objectValue);
  return blocks / div; // frazionario, nessun floor
}

// ══════════════════════════════════════════════════════════════
// SIMULATE AIRDROP
// ══════════════════════════════════════════════════════════════

function simulateAirdrop(cat, users, treasury, label) {
  const { name: catName, objectValue, blockPrice } = cat;

  // Quotazione corretta
  const quotation = Math.ceil(objectValue / SPLIT.venditore);
  const totalBlocks = Math.ceil(quotation / (blockPrice * ARIA_EUR));

  // Minimo ARIA per partecipare
  const minAria = Math.ceil(objectValue * MIN_PARTICIPATION_PCT / ARIA_EUR);
  // In blocchi
  const minBlocks = Math.ceil(minAria / blockPrice);

  // Difficulty
  const divisor = miningDivisor(objectValue);

  // Partecipazione
  const participants = [];
  let buyOrder = 0;

  for (const u of users) {
    const prob = u.type === 'alpha' ? 0.60 : 0.40;
    if (Math.random() > prob) continue;
    if (u.ariaBalance < minAria) continue;

    // Spende 5-30% del bilancio
    const spendPct = 0.05 + Math.random() * 0.25;
    const ariaToSpend = Math.max(minAria, Math.floor(u.ariaBalance * spendPct));
    const blocks = Math.min(
      Math.floor(ariaToSpend / blockPrice),
      Math.floor(totalBlocks * 0.30)
    );

    if (blocks < minBlocks) continue;

    buyOrder++;
    const ariaSpent = blocks * blockPrice;

    participants.push({
      id: u.id, type: u.type, blocks, ariaSpent,
      eurSpent: round(ariaSpent * ARIA_EUR, 2),
      catHist: u.catHistory[catName] || 0,
      regDaysAgo: u.regDaysAgo, buyOrder,
    });

    u.ariaBalance -= ariaSpent;
    u.eurSpentTotal += ariaSpent * ARIA_EUR;
    u.videosWatched += ADS.videos_per_block_purchase;
  }

  if (participants.length < 2) {
    return { skipped: true, catName, reason: '<2 partecipanti' };
  }

  // Revenue
  const blocksSold = participants.reduce((s, p) => s + p.blocks, 0);
  const totalAria = participants.reduce((s, p) => s + p.ariaSpent, 0);
  const totalEur = round(totalAria * ARIA_EUR, 2);
  const venditoreEur = round(totalEur * SPLIT.venditore, 2);
  const fondoEur = round(totalEur * SPLIT.fondo, 2);
  const airoobiEur = round(totalEur * SPLIT.airoobi, 2);

  // Winner
  const scored = scoreParticipants(participants);
  const winner = scored[0];
  const losers = scored.slice(1);

  const winnerUser = users.find(u => u.id === winner.id);
  winnerUser.objectsWon.push({ cat: catName, value: objectValue, spent: winner.eurSpent });
  winnerUser.totalEurWon += objectValue;

  // ── NFT MINING: TUTTI i perdenti, frazionario ──
  // Anti-inflation cap
  let nftCap = Infinity;
  if (treasury.nftShares > 0 && treasury.balance > 0) {
    const currentPrice = treasury.balance / treasury.nftShares;
    nftCap = fondoEur / currentPrice;
  }

  let totalNewShares = 0;
  const loserMining = [];

  for (const l of losers) {
    let shares = calcNftShares(l.blocks, objectValue);
    // Cap proporzionale
    if (totalNewShares + shares > nftCap && nftCap < Infinity) {
      shares = Math.max(0, nftCap - totalNewShares);
    }
    totalNewShares += shares;

    const loserUser = users.find(u => u.id === l.id);
    loserUser.nftShares += shares;

    loserMining.push({
      id: l.id, blocks: l.blocks, eurSpent: l.eurSpent,
      sharesMined: round(shares, 4),
    });
  }

  // Update treasury
  treasury.balance += fondoEur;
  treasury.nftShares += totalNewShares;
  treasury.nftPrice = treasury.nftShares > 0 ? treasury.balance / treasury.nftShares : 0;

  // Update cat history
  for (const p of participants) {
    const pu = users.find(u => u.id === p.id);
    pu.catHistory[catName] = (pu.catHistory[catName] || 0) + p.ariaSpent;
  }

  return {
    skipped: false, label, catName, objectValue, quotation,
    totalBlocks, blocksSold, fillRate: round(blocksSold / totalBlocks * 100, 1),
    participants: participants.length, totalEur, venditoreEur, fondoEur, airoobiEur,
    divisor, minAria,
    winner: { id: winner.id, type: winner.type, blocks: winner.blocks, eurSpent: winner.eurSpent, score: winner.score },
    losers: losers.length, totalNewShares: round(totalNewShares, 4),
    loserMining,
  };
}

// ══════════════════════════════════════════════════════════════
// MONTHLY SIM
// ══════════════════════════════════════════════════════════════

function simulateMonth(month, users, treasury, results) {
  const dau = Math.floor(users.length * 0.70);

  let videoViews = 0, pageImpr = 0;

  for (let day = 0; day < 30; day++) {
    const active = [...users].sort(() => Math.random() - 0.5).slice(0, dau);
    for (const u of active) {
      u.videosWatched += ADS.videos_per_login + ADS.videos_per_daily_checkin;
      videoViews += ADS.videos_per_login + ADS.videos_per_daily_checkin;
      pageImpr += ADS.display_pages_per_session;

      // Alpha guadagnano 7 ARIA/giorno
      if (u.type === 'alpha') {
        u.ariaBalance += 7;
      }
      // Mainnet: 15% chance di ricaricare €20 se bilancio basso
      if (u.type === 'mainnet' && u.ariaBalance < 200 && Math.random() < 0.15) {
        u.ariaBalance += 200;
        u.eurSpentOnAria += 20;
        u.eurSpentTotal += 20;
      }
    }
  }

  // Ad revenue
  const videoRev = (videoViews / 1000) * ADS.video_cpm;
  const displayRev = (pageImpr / 1000) * ADS.display_cpm;
  const adToFondo = videoRev * ADS.video_split_fondo;
  const adToOps = videoRev * (1 - ADS.video_split_fondo) + displayRev;
  treasury.balance += adToFondo;
  treasury.adRevTotal = (treasury.adRevTotal || 0) + videoRev + displayRev;
  treasury.adToFondo = (treasury.adToFondo || 0) + adToFondo;
  if (treasury.nftShares > 0) treasury.nftPrice = treasury.balance / treasury.nftShares;

  // Airdrop: 1 per categoria
  const monthResults = [];
  for (const cat of CATEGORIES) {
    const r = simulateAirdrop(cat, users, treasury, `M${month}`);
    results.push(r);
    monthResults.push(r);
  }

  return {
    month, videoViews, pageImpr, dau,
    adRev: round(videoRev + displayRev, 2), adToFondo: round(adToFondo, 2), adToOps: round(adToOps, 2),
    monthResults,
  };
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  AIROOBI D-Day Simulator v2 — Modello Economico Corretto                    ║');
  console.log('║  ARIA=stablecoin · NFT=ETF quote · Mining per oggetto · Frazioni · Tutti    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  const users = generateUsers();
  const treasury = { balance: 0, nftShares: 0, nftPrice: 0, adRevTotal: 0, adToFondo: 0 };
  const results = [];
  const months = [];

  // ── Mostra setup iniziale ──
  console.log('\n── SETUP D-DAY ──');
  console.log(`  Mining difficulty: divisore = ceil(valore_oggetto / ${MINING_K})`);
  console.log(`  Min partecipazione: ${MIN_PARTICIPATION_PCT * 100}% del valore oggetto`);
  console.log(`  NFT frazionari: SÌ — tutti i perdenti ricevono quote`);
  console.log(`  Video: ${ADS.videos_per_login} login + ${ADS.videos_per_block_purchase} acquisto + ${ADS.videos_per_daily_checkin} check-in`);

  console.log('\n  Categorie:');
  for (const c of CATEGORIES) {
    const div = miningDivisor(c.objectValue);
    const minA = Math.ceil(c.objectValue * MIN_PARTICIPATION_PCT / ARIA_EUR);
    console.log(`    ${c.name}: €${c.objectValue} | ${c.blockPrice} AR/blocco | divisore mining: ${div} | min: ${minA} ARIA (€${round(minA * ARIA_EUR, 2)})`);
  }

  console.log('\n  Alpha users (ARIA earned):');
  for (const u of users.filter(u => u.type === 'alpha')) {
    console.log(`    ${u.id}: ${u.ariaBalance} ARIA (€${round(u.ariaBalance * ARIA_EUR, 0)}) — reg ${u.regDaysAgo}gg fa`);
  }
  console.log('  Mainnet users (ARIA bought):');
  for (const u of users.filter(u => u.type === 'mainnet')) {
    console.log(`    ${u.id}: ${u.ariaBalance} ARIA (€${round(u.eurSpentOnAria, 0)} spesi) — reg ${u.regDaysAgo}gg fa`);
  }

  // ── Simula 6 mesi ──
  console.log('\n' + '═'.repeat(78));
  console.log('SIMULAZIONE 6 MESI — 3 airdrop/mese (Tech €1K, Lifestyle €750, Luxury €3K)');
  console.log('═'.repeat(78));

  for (let m = 1; m <= 6; m++) {
    const mr = simulateMonth(m, users, treasury, results);
    months.push(mr);
  }

  // ── Monthly table ──
  console.log('\n┌──────┬─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐');
  console.log('│ Mese │ Airdrop │ Airdrop€ │ Ad Rev   │ Treasury │ NFT quot │ Prezzo/Q │');
  console.log('├──────┼─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤');
  for (const m of months) {
    const airdrops = m.monthResults.filter(a => !a.skipped);
    const airRev = airdrops.reduce((s, a) => s + a.totalEur, 0);
    console.log(`│ M${String(m.month).padStart(2)}  │ ${String(airdrops.length).padStart(5)}/3 │ €${String(round(airRev, 0)).padStart(7)} │ €${String(round(m.adRev, 0)).padStart(7)} │ €${String(round(treasury.balance, 0)).padStart(7)} │ ${String(round(treasury.nftShares, 1)).padStart(8)} │ €${String(round(treasury.nftPrice, 2)).padStart(7)} │`);
  }
  console.log('└──────┴─────────┴──────────┴──────────┴──────────┴──────────┴──────────┘');

  // ── Airdrop detail ──
  if (VERBOSE) {
    console.log('\n── DETTAGLIO AIRDROP ──');
    for (const r of results) {
      if (r.skipped) { console.log(`  [SKIP] ${r.catName}: ${r.reason}`); continue; }
      console.log(`\n  ${r.label} ${r.catName} (€${r.objectValue}) — div:${r.divisor} min:${r.minAria}AR`);
      console.log(`    ${r.participants} partecipanti, ${r.blocksSold}/${r.totalBlocks} blocchi (${r.fillRate}%)`);
      console.log(`    Revenue: €${r.totalEur} | Venditore: €${r.venditoreEur} | Fondo: +€${r.fondoEur}`);
      console.log(`    Winner: ${r.winner.id} (${r.winner.type}) — ${r.winner.blocks} blocchi, €${r.winner.eurSpent}, score ${r.winner.score}`);
      console.log(`    Mining: ${r.totalNewShares} quote NFT a ${r.losers} perdenti`);
      for (const l of r.loserMining) {
        console.log(`      ${l.id}: ${l.blocks} blocchi, €${l.eurSpent} → ${l.sharesMined} quote`);
      }
    }
  }

  // ── User final state ──
  console.log('\n── STATO UTENTI FINALE (6 mesi) ──');

  for (const type of ['alpha', 'mainnet']) {
    const group = users.filter(u => u.type === type);
    const label = type === 'alpha' ? 'ALPHA (ARIA gratis)' : 'MAINNET (ARIA comprati)';
    console.log(`\n${label}:`);
    console.log('┌──────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────────┐');
    console.log('│ ID           │ ARIA ora │ € spesi  │ NFT quot │ NFT val€ │ Ogg vint │ ROI totale           │');
    console.log('├──────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────────┤');
    for (const u of group) {
      const nftVal = round(u.nftShares * treasury.nftPrice, 2);
      const totalReturn = u.totalEurWon + nftVal;
      const roi = u.eurSpentTotal > 0 ? round((totalReturn / u.eurSpentTotal - 1) * 100, 0) : '∞';
      const objStr = u.objectsWon.length > 0 ? u.objectsWon.map(o => `€${o.value}`).join('+') : '—';
      const roiStr = typeof roi === 'number' ? `${roi}%` : roi;
      console.log(`│ ${u.id.padEnd(12)} │ ${String(u.ariaBalance).padStart(8)} │ €${String(round(u.eurSpentTotal, 0)).padStart(7)} │ ${String(round(u.nftShares, 2)).padStart(8)} │ €${String(nftVal).padStart(7)} │ ${String(u.objectsWon.length).padStart(8)} │ ${(roiStr + ' ' + objStr).substring(0, 20).padStart(20)} │`);
    }
    console.log('└──────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────────┘');
  }

  // ── Economics ──
  const completed = results.filter(r => !r.skipped);
  const skipped = results.filter(r => r.skipped);
  const totAirdropRev = completed.reduce((s, a) => s + a.totalEur, 0);
  const totVenditore = completed.reduce((s, a) => s + a.venditoreEur, 0);
  const totFeeAiroobi = completed.reduce((s, a) => s + a.airoobiEur, 0);
  const totFondo = completed.reduce((s, a) => s + a.fondoEur, 0);
  const mainnetSpent = users.filter(u => u.type === 'mainnet').reduce((s, u) => s + u.eurSpentOnAria, 0);
  const alphaSpent = users.filter(u => u.type === 'alpha').reduce((s, u) => s + u.eurSpentTotal, 0);
  const totalObjWon = users.reduce((s, u) => s + u.totalEurWon, 0);
  const totalNftVal = round(users.reduce((s, u) => s + u.nftShares, 0) * treasury.nftPrice, 2);
  const totalVideos = users.reduce((s, u) => s + u.videosWatched, 0);

  console.log('\n' + '═'.repeat(78));
  console.log('ECONOMICS SUMMARY');
  console.log('═'.repeat(78));
  console.log(`  Airdrop completati: ${completed.length}/${results.length} (${skipped.length} saltati)`);
  console.log(`  Revenue airdrop totale: €${round(totAirdropRev, 2)}`);
  console.log(`    → Venditori: €${round(totVenditore, 2)}`);
  console.log(`    → Fondo (22%): €${round(totFondo, 2)}`);
  console.log(`    → Fee AIROOBI (10%): €${round(totFeeAiroobi, 2)}`);
  console.log(`  Ad revenue totale: €${round(treasury.adRevTotal, 2)}`);
  console.log(`    → Al Fondo (50% video): €${round(treasury.adToFondo, 2)}`);
  console.log(`  Treasury finale: €${round(treasury.balance, 2)}`);
  console.log(`  NFT quote circolanti: ${round(treasury.nftShares, 2)}`);
  console.log(`  Prezzo per quota: €${round(treasury.nftPrice, 2)}`);
  console.log(`  Video totali guardati: ${totalVideos}`);
  console.log(`  € spesi utenti mainnet (ARIA): €${round(mainnetSpent, 0)}`);
  console.log(`  € "spesi" utenti alpha (in ARIA): €${round(alphaSpent, 0)} (ma gratis per loro)`);
  console.log(`  Valore oggetti vinti: €${round(totalObjWon, 0)}`);
  console.log(`  Valore NFT in mano utenti: €${round(totalNftVal, 0)}`);

  // ── Chi ha vinto cosa ──
  const winners = users.filter(u => u.objectsWon.length > 0);
  console.log(`\n  VINCITORI (${winners.length} utenti hanno vinto ${winners.reduce((s, u) => s + u.objectsWon.length, 0)} oggetti):`);
  for (const w of winners) {
    const objTotal = w.objectsWon.reduce((s, o) => s + o.value, 0);
    const spentOnWins = w.objectsWon.reduce((s, o) => s + o.spent, 0);
    console.log(`    ${w.id} (${w.type}): vinto €${objTotal} spendendo €${round(spentOnWins, 0)} — ROI ${round(objTotal / Math.max(spentOnWins, 0.01) - 1, 0)}x`);
  }

  // ── Perdenti: come se la cavano? ──
  const losersOnly = users.filter(u => u.objectsWon.length === 0 && u.nftShares > 0);
  console.log(`\n  PERDENTI (solo NFT, nessun oggetto — ${losersOnly.length} utenti):`);
  let totalLoserSpent = 0, totalLoserNftVal = 0;
  for (const l of losersOnly) {
    const nftVal = round(l.nftShares * treasury.nftPrice, 2);
    const netReturn = nftVal - l.eurSpentTotal;
    totalLoserSpent += l.eurSpentTotal;
    totalLoserNftVal += nftVal;
    const pct = l.eurSpentTotal > 0 ? round(nftVal / l.eurSpentTotal * 100, 0) : 0;
    console.log(`    ${l.id} (${l.type}): speso €${round(l.eurSpentTotal, 0)} → NFT €${nftVal} (${pct}% recupero) — net ${netReturn >= 0 ? '+' : ''}€${round(netReturn, 0)}`);
  }
  if (losersOnly.length > 0) {
    const avgRecovery = round(totalLoserNftVal / Math.max(totalLoserSpent, 0.01) * 100, 0);
    console.log(`    MEDIA: speso €${round(totalLoserSpent, 0)} → NFT €${round(totalLoserNftVal, 0)} (${avgRecovery}% recupero)`);
  }

  // ── La formula d'oro ──
  console.log('\n' + '═'.repeat(78));
  console.log('LA FORMULA D\'ORO — IL FLYWHEEL');
  console.log('═'.repeat(78));

  // Proiezione scaling
  const adPerUser6m = treasury.adRevTotal / 20;
  const fundPerUser6m = treasury.adToFondo / 20;

  console.log(`
  CON 20 UTENTI (D-Day):
    Treasury: €${round(treasury.balance, 0)} | NFT price: €${round(treasury.nftPrice, 2)}/quota
    Ad rev: €${round(treasury.adRevTotal, 0)} (€${round(adPerUser6m, 1)}/utente/6mesi)
    Fee AIROOBI: €${round(totFeeAiroobi, 0)} (da airdrop) + €${round(treasury.adRevTotal - treasury.adToFondo, 0)} (da ads)

  PROIEZIONE SCALING (stessi parametri, più utenti):

  ┌───────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Utenti    │ Ad Rev/m │ Fondo/m  │ Treasury │ NFT €/Q  │ Fee AIR  │
  ├───────────┼──────────┼──────────┼──────────┼──────────┼──────────┤`);

  const scales = [20, 100, 500, 1000, 5000, 10000, 50000];
  for (const n of scales) {
    const factor = n / 20;
    const adRevMonth = (treasury.adRevTotal / 6) * factor;
    const fondoMonth = (treasury.adToFondo / 6) * factor + (totFondo / 6) * Math.sqrt(factor);
    const treasury6m = fondoMonth * 6;
    const estNft = treasury.nftShares * Math.sqrt(factor);
    const nftPrice = estNft > 0 ? treasury6m / estNft : 0;
    const feeMonth = (totFeeAiroobi / 6) * Math.sqrt(factor) + adRevMonth * 0.5;
    console.log(`  │ ${String(n).padStart(7)}   │ €${String(round(adRevMonth, 0)).padStart(7)} │ €${String(round(fondoMonth, 0)).padStart(7)} │ €${String(round(treasury6m, 0)).padStart(7)} │ €${String(round(nftPrice, 2)).padStart(7)} │ €${String(round(feeMonth, 0)).padStart(7)} │`);
  }

  console.log(`  └───────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

  IL MODELLO ECONOMICO:

  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │  ARIA (stablecoin €0.10)                                        │
  │    ↓ compra o guadagna                                          │
  │  BLOCCHI (partecipa airdrop)                                    │
  │    ├→ VINCITORE: ottiene oggetto (ROI 5-25x)                    │
  │    └→ TUTTI GLI ALTRI: minano quote NFT                         │
  │         ↓                                                       │
  │       ROBI = quota Fondo Comune (come ETF)                      │
  │         valore = treasury / quote_circolanti                    │
  │         ↓                                                       │
  │       TREASURY cresce SEMPRE:                                   │
  │         +22% di ogni airdrop                                    │
  │         +50% di ogni video ad                                   │
  │         +sponsor aziende                                        │
  │         ↓                                                       │
  │       PREZZO QUOTA SALE → perdenti guadagnano nel tempo         │
  │         ↓                                                       │
  │       RETENTION → più utenti → più ads → più treasury → loop    │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘

  MINING DIFFICULTY (basata sul prezzo oggetto):
    €500  → div 5   → 1 quota ogni 5 blocchi   (mining facile)
    €1K   → div 10  → 1 quota ogni 10 blocchi
    €3K   → div 30  → 1 quota ogni 30 blocchi
    €5K   → div 50  → 1 quota ogni 50 blocchi  (mining medio)
    €10K  → div 100 → 1 quota ogni 100 blocchi (mining hard)

  PERCHÉ FUNZIONA:
    1. Chi vince → racconta a tutti (WOM gratuito)
    2. Chi perde → ha quote NFT che CRESCONO (non ha "perso")
    3. Le ads generano revenue AUTOMATICA che alimenta il Fondo
    4. Il Fondo cresce → le quote valgono di più → incentivo a restare
    5. ARIA acquistabili → revenue DIRETTA per la piattaforma
    6. Difficoltà per oggetto → oggetti costosi = quote più rare = più valore
`);
}

main();
