// ── AIROOBI — Process Redemption Queue (Hole #6 · Sprint W1) ──
// Wrapper edge function per process_weekly_redemption_queue() postgres RPC.
//
// Cron primary: pg_cron 'process_redemption_queue' Mon 00:05 UTC chiama
// direttamente la RPC postgres (atomic, transactional, no HTTP layer).
//
// Questa edge function esiste per:
//   1. Manual trigger admin (debug, replay settimana mancata)
//   2. Fallback se pg_cron in failure (alert admin)
//   3. HTTP-invokable testing pre-deploy
//
// Auth: richiede SUPABASE_SERVICE_ROLE_KEY (admin-only).
// Body opzionale: { dry_run: boolean } per validate-only senza commit.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    let body: { dry_run?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body OK
    }

    const sb = createClient(SB_URL, SB_KEY);

    if (body.dry_run) {
      // Conta requests che SAREBBERO processate, no commit
      const { data: monday } = await sb.rpc("_get_redemption_week_monday", { p_offset: 0 });
      const { data: queued, error } = await sb
        .from("robi_redemptions")
        .select("id, user_id, robi_count, amount_eur, scheduled_unlock_week_start, status")
        .eq("scheduled_unlock_week_start", monday)
        .eq("status", "queued");

      if (error) throw error;

      return new Response(
        JSON.stringify({
          ok: true,
          dry_run: true,
          week_start: monday,
          would_process_count: queued?.length ?? 0,
          would_process: queued ?? [],
        }),
        { headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // Live processing via postgres RPC (atomic)
    const { data, error } = await sb.rpc("process_weekly_redemption_queue");

    if (error) {
      console.error("[process-redemption-queue] RPC failed:", error);
      return new Response(
        JSON.stringify({ ok: false, error: "rpc_failed", details: error.message }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, source: "edge_function", result: data }),
      { headers: { ...CORS, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[process-redemption-queue] unhandled error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "unhandled", details: String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
