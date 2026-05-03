// ── AIROOBI · phone-verify-confirm edge function ──
// Hole #1 Layer C — phone-KYC confirm (scaffold mentre Twilio account pending)
// TECH-HARDEN-001 · Sprint W1 · Day 2 · 27 Apr 2026
//
// Conferma il challenge SMS via Twilio Verify Check.
// Bypass mode: già auto-approved da phone-verify-init (stesso file lato init).
//
// Body: { phone_e164: "+39...", code: "123456" }
// Response: { ok: true, status: "approved"|"bypass"|"invalid_code"|"expired" }
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

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return reject("not_authenticated");

  const sb = createClient(SB_URL, SB_KEY);
  const { data: userResp } = await sb.auth.getUser(token);
  const userId = userResp?.user?.id;
  if (!userId) return reject("not_authenticated");

  let body: { phone_e164?: string; code?: string };
  try { body = await req.json(); } catch { return reject("invalid_body"); }

  const phone = (body.phone_e164 || "").trim();
  const code = (body.code || "").trim();
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) return reject("invalid_phone");

  const { data: cfgRow } = await sb
    .from("airdrop_config").select("value").eq("key", "phone_verify_bypass_enabled").single();
  const bypass = (cfgRow?.value || "true") === "true";

  // ── Bypass mode: phone-verify-init already approved → just return ok ──
  if (bypass) {
    return ok({ status: "bypass", debug: "phone_verify_bypass_enabled=true" });
  }

  // ── Live Twilio mode ──
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID) {
    return reject("twilio_not_configured");
  }
  if (!/^\d{4,8}$/.test(code)) return reject("invalid_code");

  try {
    const twilioRes = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
        body: new URLSearchParams({ To: phone, Code: code }),
      }
    );
    const tw = await twilioRes.json();
    if (!twilioRes.ok) return reject("twilio_check_failed");

    if (tw.status !== "approved") {
      await sb.from("phone_verification_attempts").update({
        status: tw.status === "expired" ? "expired" : "rejected",
      }).eq("phone_e164", phone).eq("user_id", userId).eq("status", "pending");
      return reject(tw.status === "expired" ? "expired" : "invalid_code");
    }

    // Approved → update profile + log
    await sb.from("phone_verification_attempts").update({
      status: "approved", verified_at: new Date().toISOString(),
    }).eq("phone_e164", phone).eq("user_id", userId).eq("status", "pending");
    await sb.from("profiles").update({
      phone_e164: phone,
      phone_verified_at: new Date().toISOString(),
    }).eq("id", userId);

    return ok({ status: "approved" });
  } catch {
    return reject("twilio_error");
  }
});
