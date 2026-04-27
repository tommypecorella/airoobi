// ── AIROOBI · phone-verify-init edge function ──
// Hole #1 Layer C — phone-KYC (scaffold mentre Twilio account pending)
// TECH-HARDEN-001 · Sprint W1 · Day 2 · 27 Apr 2026
//
// Avvia un challenge SMS verify via Twilio Verify.
// Bypass mode (config phone_verify_bypass_enabled=true): ritorna { ok: true, debug: "bypass" }
// senza chiamare Twilio. Quando Twilio secrets sono set + flag flippata, integration live.
//
// Body: { phone_e164: "+39..." }
// Response: { ok: true, status: "sent"|"bypass"|"rate_limited"|"invalid_phone" }
// ─────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
const TWILIO_AUTH_TOKEN  = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
const TWILIO_VERIFY_SID  = Deno.env.get("TWILIO_VERIFY_SERVICE_SID") || "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function ok(extra: Record<string, unknown>) {
  return new Response(JSON.stringify({ ok: true, ...extra }), {
    status: 200, headers: { ...CORS, "Content-Type": "application/json" },
  });
}
function reject(reason: string) {
  return new Response(JSON.stringify({ ok: false, reason }), {
    status: 200, headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return reject("method_not_allowed");

  // Authenticate user via Authorization header
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return reject("not_authenticated");

  const sb = createClient(SB_URL, SB_KEY);
  const { data: userResp } = await sb.auth.getUser(token);
  const userId = userResp?.user?.id;
  if (!userId) return reject("not_authenticated");

  let body: { phone_e164?: string };
  try { body = await req.json(); } catch { return reject("invalid_body"); }

  const phone = (body.phone_e164 || "").trim();
  // E164 minimal validation
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) return reject("invalid_phone");

  // Read bypass flag
  const { data: cfgRow } = await sb
    .from("airdrop_config")
    .select("value")
    .eq("key", "phone_verify_bypass_enabled")
    .single();
  const bypass = (cfgRow?.value || "true") === "true";

  // Rate limit: max 3 attempts per phone in 24h (anti Twilio cost abuse)
  const { count: attemptCount } = await sb
    .from("phone_verification_attempts")
    .select("id", { count: "exact", head: true })
    .eq("phone_e164", phone)
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());
  const { data: maxAttRow } = await sb
    .from("airdrop_config").select("value").eq("key", "phone_verify_max_attempts_24h").single();
  const maxAtt = parseInt(maxAttRow?.value || "3", 10);
  if ((attemptCount ?? 0) >= maxAtt) return reject("rate_limited");

  // ── Bypass mode: log attempt as approved + return success ──
  if (bypass) {
    await sb.from("phone_verification_attempts").insert({
      user_id: userId, phone_e164: phone, status: "approved",
      twilio_sid: "BYPASS", verified_at: new Date().toISOString(),
    });
    // Auto-set phone_verified in bypass (so claim_welcome_grant continues to work)
    await sb.from("profiles").update({
      phone_e164: phone,
      phone_verified_at: new Date().toISOString(),
    }).eq("id", userId);
    return ok({ status: "bypass", debug: "phone_verify_bypass_enabled=true" });
  }

  // ── Live Twilio mode (when secrets are set + bypass=false) ──
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID) {
    return reject("twilio_not_configured");
  }

  try {
    const twilioRes = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SID}/Verifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
        body: new URLSearchParams({ To: phone, Channel: "sms" }),
      }
    );
    const tw = await twilioRes.json();
    if (!twilioRes.ok || tw.status === "failed") return reject("twilio_send_failed");

    await sb.from("phone_verification_attempts").insert({
      user_id: userId, phone_e164: phone, status: "pending", twilio_sid: tw.sid,
    });
    return ok({ status: "sent", twilio_sid: tw.sid });
  } catch {
    return reject("twilio_error");
  }
});
