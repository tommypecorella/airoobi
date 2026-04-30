// ── AIROOBI · signup-guard edge function ──
// Hole #1 · Sybil resistance Layer A + B
// TECH-HARDEN-001 · Sprint W1 · 27 Apr 2026
//
// Chiamata dal client signup.html PRIMA di auth.signUp().
// Verifica:
//   1. Rate limit IP/device/email-alias/UA (Layer A — signup_attempts table)
//   2. Cloudflare Turnstile token (Layer B — se richiesto da Layer A o sempre)
// Risposte:
//   - { ok: true } → frontend procede con signUp
//   - { ok: false, reason: "ip_too_many"|"device_too_many"|"alias_blocked"|"captcha_required"|"captcha_failed" }
// ─────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SIGNUP_SALT = Deno.env.get("SIGNUP_SALT") || "airoobi-default-salt";
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET") || "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

function reject(reason: string, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ ok: false, reason, ...extra }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return reject("method_not_allowed");

  let body: {
    email?: string;
    device_fp?: string;
    turnstile_token?: string;
  };
  try {
    body = await req.json();
  } catch {
    return reject("invalid_body");
  }

  const email = (body.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) return reject("invalid_email");

  const ip = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "0.0.0.0";
  const ua = req.headers.get("user-agent") || "";
  const device_fp = body.device_fp || "";

  const email_local = email.split("@")[0].split("+")[0];
  const ip_hash = await sha256(ip + SIGNUP_SALT);
  const ua_hash = await sha256(ua);
  const email_hash = await sha256(email);

  const sb = createClient(SB_URL, SB_KEY);

  // ── Layer A · count attempts ─────────────────────────────────────
  const { data: counts, error: cErr } = await sb.rpc("count_signup_attempts", {
    p_ip_hash: ip_hash,
    p_device_fp: device_fp || null,
    p_email_local: email_local,
    p_ua_hash: ua_hash,
  });

  if (cErr || !counts) {
    return reject("count_failed", { error: String(cErr?.message || "") });
  }

  // Read thresholds from airdrop_config (with sane defaults)
  const { data: cfgRows } = await sb
    .from("airdrop_config")
    .select("key,value")
    .in("key", [
      "sybil_ip_24h_soft", "sybil_ip_24h_hard",
      "sybil_device_24h_hard", "sybil_email_local_hard",
      "sybil_ua_1h_soft",
    ]);
  const cfg: Record<string, number> = {};
  (cfgRows || []).forEach((r: { key: string; value: string }) => {
    cfg[r.key] = parseInt(r.value, 10);
  });
  const ipSoft  = cfg.sybil_ip_24h_soft     ?? 3;
  const ipHard  = cfg.sybil_ip_24h_hard     ?? 5;
  const devHard = cfg.sybil_device_24h_hard ?? 2;
  const aliasHd = cfg.sybil_email_local_hard ?? 1;
  const uaSoft  = cfg.sybil_ua_1h_soft      ?? 3;

  // Hard rejects (Layer A)
  if (counts.email_local_seen >= aliasHd) {
    await sb.rpc("log_signup_attempt", {
      p_ip_hash: ip_hash, p_device_fp: device_fp || null,
      p_email_hash: email_hash, p_email_local: email_local,
      p_ua_hash: ua_hash, p_status: "rejected",
    });
    return reject("alias_blocked");
  }
  if (counts.ip_24h > ipHard) {
    await sb.rpc("log_signup_attempt", {
      p_ip_hash: ip_hash, p_device_fp: device_fp || null,
      p_email_hash: email_hash, p_email_local: email_local,
      p_ua_hash: ua_hash, p_status: "rejected",
    });
    return reject("ip_too_many");
  }
  if (device_fp && counts.device_24h > devHard) {
    await sb.rpc("log_signup_attempt", {
      p_ip_hash: ip_hash, p_device_fp: device_fp,
      p_email_hash: email_hash, p_email_local: email_local,
      p_ua_hash: ua_hash, p_status: "rejected",
    });
    return reject("device_too_many");
  }

  // Soft trigger → captcha required
  const captchaRequired =
    counts.ip_24h > ipSoft ||
    counts.ua_1h  > uaSoft;

  // ── Layer B · Turnstile verify (mandatory if soft trigger or always-on) ──
  if (captchaRequired) {
    if (!body.turnstile_token) {
      return reject("captcha_required");
    }
    const ok = await verifyTurnstile(body.turnstile_token, ip);
    if (!ok) {
      await sb.rpc("log_signup_attempt", {
        p_ip_hash: ip_hash, p_device_fp: device_fp || null,
        p_email_hash: email_hash, p_email_local: email_local,
        p_ua_hash: ua_hash, p_status: "rejected",
      });
      // Event log specifico per ROBY captcha monitoring (M1·W1)
      await sb.from("events").insert({
        event: "signup_rejected_captcha_failed",
        props: { ip_hash, ua_hash, email_local, email_hash },
      });
      return reject("captcha_failed");
    }
  }
  // C2 (ROBY review): rimosso branch else-if che chiamava verifyTurnstile
  // anche quando captcha non required. Saving 1 fetch HTTP a Cloudflare per
  // ogni signup non-suspicious (99% degli utenti honest).

  // OK → log attempt and let client proceed with signUp
  await sb.rpc("log_signup_attempt", {
    p_ip_hash: ip_hash, p_device_fp: device_fp || null,
    p_email_hash: email_hash, p_email_local: email_local,
    p_ua_hash: ua_hash, p_status: "attempted",
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
