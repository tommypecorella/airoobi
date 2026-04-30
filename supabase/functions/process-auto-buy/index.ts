// ── AIROOBI — Process Auto-Buy Rules (Cron ogni ora) ──
// Processa tutte le regole auto_buy_rules attive:
// - Controlla se è passato l'intervallo dall'ultimo acquisto
// - Controlla saldo ARIA sufficiente
// - Controlla che l'airdrop sia ancora aperto
// - Esegue buy_blocks come service_role impersonando l'utente
// - Invia push notification

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type, Authorization" },
    });
  }

  try {
    const sb = createClient(SB_URL, SB_KEY);
    const now = new Date();

    // Fetch regole attive
    const { data: rules } = await sb
      .from("auto_buy_rules")
      .select("*, airdrops!inner(id, title, status, total_blocks, blocks_sold, block_price_aria)")
      .eq("active", true);

    if (!rules || rules.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let bought = 0;

    for (const rule of rules) {
      const airdrop = rule.airdrops;

      // Skip se airdrop non più aperto
      if (!["presale", "sale"].includes(airdrop.status)) {
        await sb.rpc("disable_auto_buy_admin", { p_user_id: rule.user_id, p_airdrop_id: airdrop.id });
        continue;
      }

      // Skip se max blocchi raggiunto
      if (rule.total_bought >= rule.max_blocks) {
        await sb.rpc("disable_auto_buy_admin", { p_user_id: rule.user_id, p_airdrop_id: airdrop.id });
        continue;
      }

      // Skip se non è passato l'intervallo
      if (rule.last_executed_at) {
        const lastExec = new Date(rule.last_executed_at);
        const diffHours = (now.getTime() - lastExec.getTime()) / (1000 * 60 * 60);
        if (diffHours < rule.interval_hours) continue;
      }

      // Controlla saldo ARIA
      const { data: profile } = await sb
        .from("profiles")
        .select("total_points")
        .eq("id", rule.user_id)
        .single();

      if (!profile) continue;

      const cost = rule.blocks_per_interval * airdrop.block_price_aria;
      if (profile.total_points < cost) continue;

      // Quanti blocchi comprare (rispetta max)
      const remaining = rule.max_blocks - rule.total_bought;
      const blocksAvailable = airdrop.total_blocks - airdrop.blocks_sold;
      const blocksToBuy = Math.min(rule.blocks_per_interval, remaining, blocksAvailable);
      if (blocksToBuy <= 0) continue;

      // ══ FAIRNESS GUARD SERVER-SIDE (Hole #2) ══
      // Se l'utente non può più raggiungere il leader-score nemmeno comprando
      // tutti i blocchi residui, disabilita la regola e logga in events.
      const { data: fairCheck } = await sb.rpc("check_fairness_can_buy", {
        p_airdrop_id: airdrop.id,
        p_user_id: rule.user_id,
        p_extra_blocks: blocksToBuy,
      });
      if (fairCheck && fairCheck.can_buy === false) {
        await sb.rpc("disable_auto_buy_admin", { p_user_id: rule.user_id, p_airdrop_id: airdrop.id });
        await sb.from("events").insert({
          event: "auto_buy_disabled_fairness",
          user_id: rule.user_id,
          props: {
            airdrop_id: airdrop.id,
            reason: fairCheck.reason ?? "math_impossible",
            my_max_score: fairCheck.my_max_score ?? null,
            leader_score: fairCheck.leader_score ?? null,
          },
        });
        continue;
      }

      // Trova blocchi disponibili
      const { data: takenBlocks } = await sb
        .from("airdrop_blocks")
        .select("block_number")
        .eq("airdrop_id", airdrop.id);

      const takenSet = new Set((takenBlocks || []).map((b: { block_number: number }) => b.block_number));
      const available: number[] = [];
      for (let i = 1; i <= airdrop.total_blocks && available.length < blocksToBuy; i++) {
        if (!takenSet.has(i)) available.push(i);
      }

      if (available.length === 0) continue;

      // Esegui acquisto diretto (service_role)
      const actualCost = available.length * airdrop.block_price_aria;

      // Deduci ARIA
      await sb.from("profiles").update({
        total_points: profile.total_points - actualCost,
      }).eq("id", rule.user_id);

      // Ledger
      await sb.from("points_ledger").insert({
        user_id: rule.user_id,
        amount: -actualCost,
        reason: "auto_buy:" + airdrop.id,
      });

      // Insert blocks
      const blockRows = available.map((bn) => ({
        airdrop_id: airdrop.id,
        block_number: bn,
        owner_id: rule.user_id,
        purchased_phase: airdrop.status,
      }));
      await sb.from("airdrop_blocks").insert(blockRows);

      // Update blocks_sold
      await sb.from("airdrops").update({
        blocks_sold: airdrop.blocks_sold + available.length,
      }).eq("id", airdrop.id);

      // Participation record
      await sb.from("airdrop_participations").insert({
        user_id: rule.user_id,
        airdrop_id: airdrop.id,
        blocks_count: available.length,
        aria_spent: actualCost,
      });

      // Aggiorna regola
      await sb.from("auto_buy_rules").update({
        last_executed_at: now.toISOString(),
        total_bought: rule.total_bought + available.length,
      }).eq("id", rule.id);

      // Push notification
      await fetch(`${SB_URL}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SB_KEY}`,
        },
        body: JSON.stringify({
          type: "position_lost", // reuse type for notification
          user_id: rule.user_id,
          title: `+${available.length} blocchi acquistati automaticamente su ${airdrop.title}`,
        }),
      });

      processed++;
      bought += available.length;
    }

    return new Response(
      JSON.stringify({ ok: true, processed, bought }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
