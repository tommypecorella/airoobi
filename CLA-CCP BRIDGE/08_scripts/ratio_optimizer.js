#!/usr/bin/env node
/**
 * AIROOBI — Ratio Optimizer
 * ===========================
 * Trova la proporzione ottimale utenti/airdrop per categoria.
 * Testa combinazioni di utenti × airdrop × categorie su 6 mesi.
 *
 * Metriche chiave:
 *   - Recupero perdenti (%) — target: >50%
 *   - ROI vincitore (x) — target: 5-30x
 *   - Fill rate (%) — target: >60%
 *   - Treasury growth (€)
 *   - Prezzo quota NFT (€)
 *
 * Usage: node scripts/ratio_optimizer.js
 */

const ARIA_EUR = 0.10;
const SPLIT = { venditore: 0.6799, fondo: 0.22, airoobi: 0.10 };
const MINING_K = 100;
const WEIGHTS = { w1: 0.65, w2: 0.20, w3: 0.15 };

function round(n, d) { return Math.round(n * Math.pow(10, d)) / Math.pow(10, d); }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

// ── CATEGORIES ──
const CATS = [
  { name: 'Entry (€500)',    value: 500,   bp: 5  },
  { name: 'Tech (€1K)',      value: 1000,  bp: 5  },
  { name: 'Mid (€2K)',       value: 2000,  bp: 10 },
  { name: 'Luxury (€3K)',    value: 3000,  bp: 15 },
  { name: 'Premium (€5K)',   value: 5000,  bp: 15 },
  { name: 'Ultra (€10K)',    value: 10000, bp: 25 },
];

// ── SINGLE AIRDROP SIM ──
function simAirdrop(cat, nUsers, treasury, userPool) {
  const quotation = Math.ceil(cat.value / SPLIT.venditore);
  const totalBlocks = Math.ceil(quotation / (cat.bp * ARIA_EUR));
  const divisor = Math.max(1, Math.ceil(cat.value / MINING_K));
  const minAria = Math.ceil(cat.value * 0.01 / ARIA_EUR);

  // Pick participating users (50% chance per user)
  const parts = [];
  let buyOrder = 0;
  for (const u of userPool) {
    if (Math.random() > 0.50) continue;
    if (u.bal < minAria) continue;

    const spendPct = 0.05 + Math.random() * 0.25;
    const blocks = Math.min(
      Math.floor(Math.max(minAria, u.bal * spendPct) / cat.bp),
      Math.floor(totalBlocks * 0.25)
    );
    if (blocks < 1) continue;

    buyOrder++;
    const spent = blocks * cat.bp;
    u.bal -= spent;
    parts.push({ id: u.id, blocks, spent, regAge: u.regAge, buyOrder });
  }

  if (parts.length < 2) return null;

  const blocksSold = parts.reduce((s, p) => s + p.blocks, 0);
  const ariaInc = parts.reduce((s, p) => s + p.spent, 0);
  const eurInc = ariaInc * ARIA_EUR;
  const fondoEur = eurInc * SPLIT.fondo;
  const feeEur = eurInc * SPLIT.airoobi;

  // Score & winner (simplified)
  const maxB = Math.max(...parts.map(p => p.blocks));
  const scored = parts.map(p => ({
    ...p,
    score: WEIGHTS.w1 * (p.blocks / maxB) + WEIGHTS.w3 * (p.buyOrder === 1 ? 0.8 : 0.3 + Math.random() * 0.3)
  })).sort((a, b) => b.score - a.score);

  const winner = scored[0];
  const losers = scored.slice(1);

  // Mining: all losers get fractional shares
  let nftCap = Infinity;
  if (treasury.nft > 0 && treasury.bal > 0) {
    nftCap = fondoEur / (treasury.bal / treasury.nft);
  }

  let totalShares = 0;
  const loserData = [];
  for (const l of losers) {
    let sh = l.blocks / divisor;
    if (totalShares + sh > nftCap && nftCap < Infinity) sh = Math.max(0, nftCap - totalShares);
    totalShares += sh;
    loserData.push({ spent: l.spent * ARIA_EUR, shares: sh });
  }

  treasury.bal += fondoEur;
  treasury.nft += totalShares;
  treasury.price = treasury.nft > 0 ? treasury.bal / treasury.nft : 0;

  // Loser recovery
  const loserRecoveries = loserData.map(l => {
    const nftVal = l.shares * treasury.price;
    return l.spent > 0 ? nftVal / l.spent * 100 : 0;
  });
  const avgRecovery = loserRecoveries.length > 0
    ? loserRecoveries.reduce((s, r) => s + r, 0) / loserRecoveries.length : 0;

  return {
    participants: parts.length,
    blocksSold,
    totalBlocks,
    fillRate: blocksSold / totalBlocks * 100,
    eurInc,
    fondoEur,
    feeEur,
    winnerSpent: winner.spent * ARIA_EUR,
    winnerROI: cat.value / (winner.spent * ARIA_EUR),
    sharesMined: totalShares,
    avgRecovery,
    losers: losers.length,
  };
}

// ── RUN SCENARIO ──
function runScenario(nUsers, airdropsPerMonth, cat, months) {
  // Generate user pool
  const users = [];
  for (let i = 0; i < nUsers; i++) {
    const isAlpha = i < nUsers * 0.3; // 30% alpha
    const bal = isAlpha ? randInt(500, 8000) : randInt(100, 2000);
    users.push({ id: i, bal, regAge: isAlpha ? randInt(180, 500) : randInt(0, 60) });
  }

  const treasury = { bal: 0, nft: 0, price: 0 };
  let totalAirdrops = 0, successAirdrops = 0;
  let sumRecovery = 0, sumROI = 0, sumFill = 0, sumParts = 0;
  let totalFee = 0, totalAdRev = 0;

  for (let m = 0; m < months; m++) {
    // Refill: alpha earn daily, mainnet buy occasionally
    for (const u of users) {
      const isAlpha = u.regAge > 60;
      if (isAlpha) u.bal += 7 * 30; // 7 ARIA/day × 30 days
      else if (u.bal < 200 && Math.random() < 0.20) {
        u.bal += randInt(100, 500); // buy €10-€50 worth
      }
    }

    // Ad revenue: ~2 videos/day × DAU
    const dau = Math.floor(nUsers * 0.65);
    const videoViews = dau * 2 * 30;
    const adRev = (videoViews / 1000) * 12.5;
    treasury.bal += adRev * 0.5; // 50% to fondo
    totalAdRev += adRev;
    if (treasury.nft > 0) treasury.price = treasury.bal / treasury.nft;

    // Airdrops this month
    for (let a = 0; a < airdropsPerMonth; a++) {
      totalAirdrops++;
      const result = simAirdrop(cat, nUsers, treasury, users);
      if (!result) continue;
      successAirdrops++;
      sumRecovery += result.avgRecovery;
      sumROI += result.winnerROI;
      sumFill += result.fillRate;
      sumParts += result.participants;
      totalFee += result.feeEur;
    }
  }

  const s = successAirdrops || 1;
  return {
    nUsers,
    airdropsPerMonth,
    ratio: round(nUsers / airdropsPerMonth, 1),
    success: successAirdrops + '/' + totalAirdrops,
    avgParts: round(sumParts / s, 1),
    avgFill: round(sumFill / s, 1),
    avgRecovery: round(sumRecovery / s, 1),
    avgROI: round(sumROI / s, 1),
    treasury: round(treasury.bal, 0),
    nftPrice: round(treasury.price, 2),
    feeAiroobi: round(totalFee, 0),
    adRev: round(totalAdRev, 0),
    totalRev: round(totalFee + totalAdRev, 0),
  };
}

// ── MAIN ──
function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  AIROOBI — Ratio Optimizer: Utenti / Airdrop per Categoria                  ║');
  console.log('║  6 mesi · mining_k=100 · 30% alpha + 70% mainnet · ads incluse              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  const MONTHS = 6;

  for (const cat of CATS) {
    const divisor = Math.ceil(cat.value / MINING_K);
    console.log('\n' + '═'.repeat(78));
    console.log(`CATEGORIA: ${cat.name} — Block price: ${cat.bp} AR — Mining divisor: ${divisor}`);
    console.log('═'.repeat(78));

    // Test different user counts × airdrop frequencies
    const configs = [
      // [users, airdrops/month]
      [20,  1], [20,  2], [20,  3],
      [50,  1], [50,  2], [50,  3], [50,  4],
      [100, 1], [100, 2], [100, 3], [100, 5],
      [200, 1], [200, 2], [200, 3], [200, 5],
      [500, 2], [500, 4], [500, 6], [500, 8],
      [1000, 3], [1000, 5], [1000, 8], [1000, 10],
      [5000, 5], [5000, 10], [5000, 15], [5000, 20],
      [10000, 10], [10000, 15], [10000, 20], [10000, 30],
    ];

    console.log('\n┌────────┬───────┬───────┬──────┬────────┬───────────┬──────────┬──────────┬──────────┬──────────┐');
    console.log('│ Utenti │ Air/m │ Ratio │ OK   │ Partic │ Fill%     │ Recov%   │ Win ROI  │ Treas €  │ NFT €/Q  │');
    console.log('├────────┼───────┼───────┼──────┼────────┼───────────┼──────────┼──────────┼──────────┼──────────┤');

    let bestScore = -Infinity, bestConfig = null;

    for (const [nU, apm] of configs) {
      const r = runScenario(nU, apm, cat, MONTHS);

      // Score: balance recovery (want >50%), ROI (want 5-25x), fill (want >60%)
      const recScore = Math.min(r.avgRecovery, 80) / 80; // 0→1, cap at 80%
      const roiScore = Math.min(r.avgROI, 25) / 25;       // 0→1, cap at 25x
      const fillScore = Math.min(r.avgFill, 80) / 80;     // 0→1
      const partsScore = Math.min(r.avgParts, 20) / 20;   // want at least 5-20 participants
      const compositeScore = recScore * 0.35 + roiScore * 0.25 + fillScore * 0.20 + partsScore * 0.20;

      const recColor = r.avgRecovery >= 40 ? '✓' : r.avgRecovery >= 20 ? '~' : '✗';
      const fillColor = r.avgFill >= 50 ? '✓' : r.avgFill >= 25 ? '~' : '✗';
      const star = compositeScore > bestScore ? ' ★' : '';
      if (compositeScore > bestScore) { bestScore = compositeScore; bestConfig = r; }

      console.log(`│ ${String(nU).padStart(6)} │ ${String(apm).padStart(5)} │ ${String(r.ratio).padStart(5)} │ ${r.success.padStart(4)} │ ${String(r.avgParts).padStart(5)}  │ ${String(r.avgFill).padStart(6)}% ${fillColor} │ ${String(r.avgRecovery).padStart(5)}% ${recColor} │ ${String(r.avgROI).padStart(6)}x  │ €${String(r.treasury).padStart(7)} │ €${String(r.nftPrice).padStart(7)} │${star}`);
    }

    console.log('└────────┴───────┴───────┴──────┴────────┴───────────┴──────────┴──────────┴──────────┴──────────┘');

    if (bestConfig) {
      console.log(`\n  ★ OTTIMALE per ${cat.name}: ${bestConfig.nUsers} utenti × ${bestConfig.airdropsPerMonth} airdrop/mese (ratio ${bestConfig.ratio}:1)`);
      console.log(`    Partecipanti medi: ${bestConfig.avgParts} | Fill: ${bestConfig.avgFill}% | Recovery: ${bestConfig.avgRecovery}% | ROI: ${bestConfig.avgROI}x`);
      console.log(`    Treasury: €${bestConfig.treasury} | NFT €${bestConfig.nftPrice}/quota | Fee AIROOBI: €${bestConfig.feeAiroobi} | Ad rev: €${bestConfig.adRev}`);
    }
  }

  // ── SUMMARY TABLE ──
  console.log('\n' + '═'.repeat(78));
  console.log('RIEPILOGO: RATIO OTTIMALE PER CATEGORIA');
  console.log('═'.repeat(78));

  console.log('\n  La proporzione utenti/airdrop dipende dal valore dell\'oggetto:');
  console.log('  - Oggetti economici: più airdrop possibili (gli utenti hanno abbastanza ARIA)');
  console.log('  - Oggetti costosi: meno airdrop (serve più ARIA, serve più tempo per accumulare)');

  console.log('\n  REGOLA PRATICA:');
  console.log('  ┌──────────────────┬──────────────────────────────────────────────┐');
  console.log('  │ Range utenti     │ Airdrop/mese consigliati                     │');
  console.log('  ├──────────────────┼──────────────────────────────────────────────┤');
  console.log('  │ 20-50 (alpha)    │ 1-2 per categoria (totale 3-6)              │');
  console.log('  │ 100-500          │ 2-4 per categoria (totale 6-12)             │');
  console.log('  │ 1.000-5.000      │ 3-8 per categoria (totale 9-24)             │');
  console.log('  │ 10.000+          │ 10-20 per categoria (totale 30-60)           │');
  console.log('  └──────────────────┴──────────────────────────────────────────────┘');

  console.log('\n  FORMULA RATIO:');
  console.log('  airdrop_per_mese_per_cat ≈ ceil(utenti / (valore_oggetto × 0.5))');
  console.log('  → 1.000 utenti, €1K oggetto: ceil(1000/500) = 2 airdrop/mese');
  console.log('  → 1.000 utenti, €500 oggetto: ceil(1000/250) = 4 airdrop/mese');
  console.log('  → 5.000 utenti, €3K oggetto: ceil(5000/1500) = 4 airdrop/mese');
  console.log('  → 10.000 utenti, €1K oggetto: ceil(10000/500) = 20 airdrop/mese');
}

main();
