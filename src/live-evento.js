// AIROOBI Live Evento UX · W4 Atto 3 cross-atto layer
// Self-bootstrapping component · auto-mounts on /airdrops/:id pages
// Italian Voice Principle 04 LOCKED v0.4-3: "Evento/esclusi/attivi" · BANNED "maratona/race/agonismo"

(function(){
  'use strict';

  const SB_URL = 'https://vuvlmlpuhovipfwtquux.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dmxtbHB1aG92aXBmd3RxdXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTUyMjEsImV4cCI6MjA1NjY5MTIyMX0.7Hd6JsB4PfcoIaSepW0DkmpzlxFhcz4eMpqo4lr8KX0';

  function getAirdropId() {
    const m = location.pathname.match(/\/airdrops\/([0-9a-f-]+)/i);
    if (m) return m[1];
    const qs = new URLSearchParams(location.search);
    return qs.get('airdrop_id') || qs.get('id') || null;
  }

  function getSession() {
    try {
      const k = Object.keys(localStorage).find(x => x.startsWith('sb-') && x.endsWith('-auth-token'));
      if (!k) return null;
      const parsed = JSON.parse(localStorage.getItem(k));
      return parsed?.access_token ? parsed : null;
    } catch { return null; }
  }

  async function sbRpc(name, body, token) {
    const headers = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + (token || SB_KEY), 'Content-Type': 'application/json' };
    const r = await fetch(SB_URL + '/rest/v1/rpc/' + name, { method:'POST', headers, body: JSON.stringify(body || {}) });
    if (!r.ok) throw new Error(name + ' ' + r.status);
    return r.json();
  }

  function fmtCountdown(deadline) {
    if (!deadline) return '—';
    const d = new Date(deadline) - new Date();
    if (d <= 0) return 'scaduto';
    const days = Math.floor(d / 86400000);
    const h = Math.floor((d % 86400000) / 3600000);
    const m = Math.floor((d % 3600000) / 60000);
    if (days > 0) return days + 'gg ' + h + 'h ' + m + 'm';
    if (h >= 1)   return h + 'h ' + m + 'm';
    return m + 'm';
  }
  function countdownColor(deadline) {
    if (!deadline) return '#999';
    const ms = new Date(deadline) - new Date();
    if (ms <= 3600000)   return '#f87171';  // < 1h: red
    if (ms <= 86400000)  return '#FFB74D';  // < 24h: orange
    return '#B8960C';                        // > 24h: gold
  }

  function render(airdrop, scoreboard, counts, checkmate, currentUserId) {
    const remaining = (airdrop.total_blocks || 0) - (airdrop.blocks_sold || 0);
    const soldPct = airdrop.total_blocks > 0 ? (airdrop.blocks_sold / airdrop.total_blocks * 100).toFixed(1) : 0;
    const colorCd = countdownColor(airdrop.deadline);
    const inWaitAck = airdrop.status === 'waiting_seller_acknowledge';

    let userRow = null;
    if (currentUserId && Array.isArray(scoreboard)) {
      userRow = scoreboard.find(r => r.user_id === currentUserId);
    }

    const scoreboardHtml = (Array.isArray(scoreboard) ? scoreboard : []).slice(0, 10).map(r => {
      const isYou = r.user_id === currentUserId;
      const badge = r.is_leader ? '<span class="le-badge le-badge-gold">👑 Leader</span>' : (isYou ? '<span class="le-badge le-badge-aria">⚡ TU</span>' : '');
      const stateBadge = r.is_attivo ? '' : '<span class="le-badge le-badge-gray" title="Esclusi: math fairness · non può più superare il leader anche acquistando tutti i blocchi rimanenti">🔒 escluso</span>';
      return `<tr ${isYou ? 'class="le-row-you"' : ''}>
        <td>#${r.rank}</td>
        <td>@${r.username || '—'}</td>
        <td style="text-align:right">${Number(r.score).toFixed(2)}</td>
        <td style="text-align:right">${r.blocks_count}</td>
        <td>${badge}${stateBadge}</td>
      </tr>`;
    }).join('');

    const checkmateHtml = (checkmate && !inWaitAck) ? `
      <div class="le-checkmate">
        <div class="le-checkmate-title">⚡ Le tue mosse</div>
        ${checkmate.blocks_to_overtake_leader > 0 ? `
          <div class="le-checkmate-row">
            <div class="le-cm-label">Per superare il leader</div>
            <div class="le-cm-value">+${checkmate.blocks_to_overtake_leader} blocchi <span class="le-cm-cost">(${checkmate.aria_cost_to_overtake} ARIA)</span></div>
          </div>` : '<div class="le-checkmate-row le-cm-leader">Sei in testa al momento</div>'}
        ${checkmate.blocks_to_checkmate_field > 0 && checkmate.blocks_to_checkmate_field <= remaining ? `
          <div class="le-checkmate-row">
            <div class="le-cm-label">Per scacco matto al campo</div>
            <div class="le-cm-value">+${checkmate.blocks_to_checkmate_field} blocchi <span class="le-cm-cost">(${checkmate.aria_cost_to_checkmate} ARIA)</span></div>
          </div>` : ''}
        ${checkmate.scacco_matto_active ? '<div class="le-scacco-active">🔒 Scacco matto attivo · campo matematicamente chiuso</div>' : ''}
      </div>
    ` : '';

    const ackHtml = inWaitAck ? `
      <div class="le-wait-ack">
        <div class="le-wait-title">🏁 Evento terminato</div>
        <div class="le-wait-sub">In attesa di conferma del venditore. Il vincitore sarà annunciato solo dopo la finalizzazione.</div>
      </div>
    ` : '';

    return `
    <style>
    .live-evento { background:linear-gradient(135deg,rgba(184,150,12,.06),transparent); border:1px solid rgba(184,150,12,.4); border-radius:12px; padding:24px; margin:24px 0; font-family:'Instrument Sans',system-ui,sans-serif; color:#fff }
    .le-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:500; color:#B8960C; margin:0 0 4px }
    .le-sub { font-size:12px; color:#999; margin-bottom:18px }
    .le-counters { display:flex; gap:16px; flex-wrap:wrap; margin-bottom:18px; font-size:12px }
    .le-counter { padding:8px 14px; background:rgba(255,255,255,.04); border-radius:6px; border:1px solid #2a2a2a }
    .le-counter-label { font-size:9px; letter-spacing:1.5px; color:#666; text-transform:uppercase; display:block; margin-bottom:2px }
    .le-counter-val { font-family:'Cormorant Garamond',serif; font-size:18px; color:#fff }
    .le-countdown { font-family:'DM Mono',monospace; font-size:14px; letter-spacing:1px }
    .le-sold-bar { width:100%; height:10px; background:#1a1a1a; border-radius:6px; overflow:hidden; margin-bottom:16px }
    .le-sold-fill { height:100%; background:linear-gradient(90deg,#B8960C,#d4ad30); transition:width .3s }
    .le-tbl { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:12px }
    .le-tbl th { text-align:left; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:1.5px; color:#666; text-transform:uppercase; padding:8px 10px; border-bottom:1px solid #2a2a2a }
    .le-tbl td { padding:10px; border-bottom:1px solid #1a1a1a }
    .le-row-you td { background:rgba(74,158,255,.08) }
    .le-badge { display:inline-block; padding:2px 8px; margin-left:6px; border-radius:10px; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.8px }
    .le-badge-gold { background:rgba(184,150,12,.15); color:#B8960C; border:1px solid rgba(184,150,12,.4) }
    .le-badge-aria { background:rgba(74,158,255,.15); color:#4A9EFF; border:1px solid rgba(74,158,255,.4) }
    .le-badge-gray { background:rgba(255,255,255,.04); color:#888; border:1px solid #333 }
    .le-checkmate { background:#0a0a0a; border:1px solid #2a2a2a; border-radius:8px; padding:16px; margin-top:14px }
    .le-checkmate-title { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:1.5px; color:#B8960C; text-transform:uppercase; margin-bottom:10px }
    .le-checkmate-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:13px }
    .le-cm-label { color:#bbb }
    .le-cm-value { color:#B8960C; font-weight:600 }
    .le-cm-cost { color:#666; font-family:'DM Mono',monospace; font-size:11px; font-weight:400; margin-left:6px }
    .le-cm-leader { color:#49EACB; font-weight:600 }
    .le-scacco-active { background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.3); color:#f87171; border-radius:6px; padding:10px 14px; margin-top:10px; font-size:12px }
    .le-wait-ack { background:rgba(255,180,80,.06); border:1px solid rgba(255,180,80,.3); border-radius:8px; padding:18px; margin-top:12px }
    .le-wait-title { font-family:'Cormorant Garamond',serif; font-size:20px; color:#FFB74D; margin-bottom:6px }
    .le-wait-sub { font-size:13px; color:#bbb }
    .le-refresh { font-size:10px; color:#666; font-family:'DM Mono',monospace; letter-spacing:1px; text-align:right; margin-top:8px }
    </style>
    <div class="live-evento">
      <h3 class="le-title">Live Evento</h3>
      <div class="le-sub">Posizioni e scacco matto · aggiornamento ogni 10s</div>

      <div class="le-counters">
        <div class="le-counter"><span class="le-counter-label">Scadenza</span><span class="le-counter-val le-countdown" style="color:${colorCd}">${fmtCountdown(airdrop.deadline)}</span></div>
        <div class="le-counter"><span class="le-counter-label">Blocchi</span><span class="le-counter-val">${airdrop.blocks_sold||0}/${airdrop.total_blocks||0}</span></div>
        <div class="le-counter"><span class="le-counter-label">Attivi</span><span class="le-counter-val" style="color:#49EACB">${counts?.attivi || 0}</span></div>
        <div class="le-counter"><span class="le-counter-label">Esclusi</span><span class="le-counter-val" style="color:#666">${counts?.esclusi || 0}</span></div>
        <div class="le-counter"><span class="le-counter-label">Totale</span><span class="le-counter-val">${counts?.total || 0}</span></div>
      </div>

      <div class="le-sold-bar"><div class="le-sold-fill" style="width:${soldPct}%"></div></div>

      ${ackHtml}

      ${userRow ? `
        <div style="margin-bottom:10px;font-size:13px;color:#bbb">
          La tua posizione: <strong style="color:#fff">#${userRow.rank}</strong> · score <strong style="color:#B8960C">${Number(userRow.score).toFixed(2)}</strong> · ${userRow.blocks_count} blocchi · <span style="color:${userRow.is_attivo?'#49EACB':'#888'}">${userRow.is_attivo?'attivo':'escluso (math fairness)'}</span>
        </div>
      ` : ''}

      ${checkmateHtml}

      <table class="le-tbl" style="margin-top:14px">
        <thead><tr><th>#</th><th>User</th><th style="text-align:right">Score</th><th style="text-align:right">Blocchi</th><th></th></tr></thead>
        <tbody>${scoreboardHtml || '<tr><td colspan="5" style="text-align:center;color:#666;padding:20px">Nessun partecipante</td></tr>'}</tbody>
      </table>
      <div class="le-refresh">Auto-refresh · prossimo ciclo in <span id="le-next-tick">10</span>s</div>
    </div>`;
  }

  async function update(airdropId, mount, currentUserId, sessionToken) {
    try {
      const airdropResp = await fetch(SB_URL + '/rest/v1/airdrops?id=eq.' + airdropId + '&select=id,status,blocks_sold,total_blocks,deadline', {
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + (sessionToken || SB_KEY) }
      });
      const airdrop = (await airdropResp.json())[0];
      if (!airdrop) return false;

      const [scoreboard, countsArr, checkmate] = await Promise.all([
        sbRpc('get_airdrop_scoreboard_live', { p_airdrop_id: airdropId, p_top_n: 10 }, sessionToken).catch(()=>[]),
        sbRpc('get_airdrop_active_excluded_counts', { p_airdrop_id: airdropId }, sessionToken).catch(()=>null),
        currentUserId ? sbRpc('compute_checkmate_blocks', { p_user_id: currentUserId, p_airdrop_id: airdropId }, sessionToken).catch(()=>null) : Promise.resolve(null)
      ]);
      const counts = Array.isArray(countsArr) && countsArr[0] ? countsArr[0] : countsArr;
      mount.innerHTML = render(airdrop, scoreboard, counts, checkmate, currentUserId);
      return true;
    } catch (e) { console.warn('live-evento update', e); return false; }
  }

  function mount() {
    const airdropId = getAirdropId();
    if (!airdropId) return;
    let host = document.getElementById('live-evento-host');
    if (!host) {
      const apContent = document.getElementById('ap-content') || document.body;
      host = document.createElement('div');
      host.id = 'live-evento-host';
      apContent.appendChild(host);
    }

    const session = getSession();
    const token = session?.access_token || null;
    const uid = session?.user?.id || null;

    let countdown = 10;
    update(airdropId, host, uid, token);
    setInterval(() => {
      countdown -= 1;
      const tick = document.getElementById('le-next-tick');
      if (tick) tick.textContent = countdown;
      if (countdown <= 0) { countdown = 10; update(airdropId, host, uid, token); }
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    setTimeout(mount, 100);
  }
})();
