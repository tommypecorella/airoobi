// ── AIROOBI — Check Deadlines Cron ──
// Controlla ogni 15 min quali airdrop scadono entro 2h
// e invia push notification deadline_2h agli utenti in watchlist.
// Invocazione: POST /functions/v1/check-deadlines (da cron pg_cron o Supabase cron)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const sb = createClient(SB_URL, SB_KEY);

    // Airdrop attivi con deadline tra ora e +2h
    const now = new Date();
    const twoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data: expiring } = await sb
      .from("airdrops")
      .select("id, title, deadline, category")
      .in("status", ["presale", "sale"])
      .gte("deadline", now.toISOString())
      .lte("deadline", twoHours.toISOString());

    if (!expiring || expiring.length === 0) {
      return new Response(JSON.stringify({ ok: true, checked: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let totalSent = 0;

    for (const airdrop of expiring) {
      // Controlla se notifica già inviata (evita duplicati)
      const { data: existing } = await sb
        .from("notifications")
        .select("id")
        .eq("type", "deadline_2h")
        .eq("body", `🔔 Mancano 2 ore alla chiusura di ${airdrop.title}. Sei ?°.`)
        .limit(1);

      // Se non ha body esatto, cerchiamo per pattern
      const { count } = await sb
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("type", "deadline_2h")
        .like("body", `%${airdrop.title}%`)
        .gte("created_at", new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString());

      if ((count || 0) > 0) continue; // Già notificato nelle ultime 3h

      // Utenti in watchlist per questo airdrop
      const { data: watchers } = await sb
        .from("airdrop_watchlist")
        .select("user_id")
        .eq("airdrop_id", airdrop.id);

      // Anche tutti i partecipanti
      const { data: participants } = await sb
        .from("airdrop_participations")
        .select("user_id")
        .eq("airdrop_id", airdrop.id);

      const userIds = [
        ...new Set([
          ...(watchers || []).map((w: { user_id: string }) => w.user_id),
          ...(participants || []).map((p: { user_id: string }) => p.user_id),
        ]),
      ];

      if (userIds.length === 0) continue;

      // Chiama send-push per ogni airdrop
      const pushRes = await fetch(`${SB_URL}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SB_KEY}`,
        },
        body: JSON.stringify({
          type: "deadline_2h",
          airdrop_id: airdrop.id,
          title: airdrop.title,
        }),
      });

      if (pushRes.ok) {
        const result = await pushRes.json();
        totalSent += result.sent || 0;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, checked: expiring.length, sent: totalSent }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
