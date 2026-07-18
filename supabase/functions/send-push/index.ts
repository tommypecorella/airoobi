// ── AIROOBI — Send Push Notifications Edge Function ──
// Trigger types:
//   new_airdrop   → utenti con alert categoria attivo
//   position_lost → utente superato in classifica
//   deadline_2h   → utenti in watchlist per airdrop a <2h
//   draw_winner   → vincitore dell'airdrop
//   draw_robi     → tutti i partecipanti non vincitori
//   airdrop_status → destinatari espliciti (user_ids) con testo dal chiamante;
//                    usato dal trigger DB trg_airdrop_status_notify che scrive
//                    già le notifiche in-app: passare skip_db=true
//
// Enforcement censimento (notification_catalog + user_notification_prefs):
//   le notifiche NON di sistema rispettano l'interruttore globale ABO e le
//   preferenze per utente; quelle di sistema sono obbligatorie.
//
// Invocazione: POST /functions/v1/send-push
// Body: { type, airdrop_id, user_id?, user_ids?, title?, body_text?, category?, skip_db? }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:ceo@airoobi.com";

// ── Crypto helpers for Web Push (VAPID + encryption) ──

function base64urlToUint8Array(b64: string): Uint8Array {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createVapidJwt(audience: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 86400, sub: VAPID_SUBJECT };

  const enc = new TextEncoder();
  const headerB64 = uint8ArrayToBase64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(enc.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const privateKeyRaw = base64urlToUint8Array(VAPID_PRIVATE);
  const key = await crypto.subtle.importKey(
    "raw",
    privateKeyRaw,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Web Crypto ECDSA returns DER, we need raw r||s (64 bytes)
  const derSig = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      enc.encode(unsignedToken)
    )
  );

  // Convert DER to raw (r||s, 32+32 bytes)
  let sig: Uint8Array;
  if (derSig.length === 64) {
    sig = derSig;
  } else {
    // DER: 0x30 len 0x02 rLen r 0x02 sLen s
    const rLen = derSig[3];
    const r = derSig.slice(4, 4 + rLen);
    const sLen = derSig[5 + rLen];
    const s = derSig.slice(6 + rLen, 6 + rLen + sLen);
    sig = new Uint8Array(64);
    sig.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
    sig.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  }

  return `${unsignedToken}.${uint8ArrayToBase64url(sig)}`;
}

async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payloadStr: string
): Promise<boolean> {
  try {
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const jwt = await createVapidJwt(audience);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        TTL: "86400",
        Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC}`,
      },
      body: new TextEncoder().encode(payloadStr),
    });

    return res.status >= 200 && res.status < 300;
  } catch {
    return false;
  }
}

// ── Notification builders ──

interface NotifPayload {
  title: string;
  body: string;
  tag: string;
  url: string;
}

function buildNotification(
  type: string,
  airdropTitle?: string,
  category?: string,
  position?: number,
  robiEarned?: number
): NotifPayload {
  const t = airdropTitle || "airdrop";
  switch (type) {
    case "new_airdrop":
      return {
        title: "AIROOBI",
        body: `⚡ Nuovo airdrop in ${category || "—"}! Hai ARIA pronti.`,
        tag: "new-airdrop",
        url: "/airdrops",
      };
    case "deadline_2h":
      return {
        title: "AIROOBI",
        body: `🔔 Mancano 2 ore alla chiusura di ${t}. Sei ${position || "?"}°.`,
        tag: `deadline-${t}`,
        url: "/airdrops",
      };
    case "position_lost":
      return {
        title: "AIROOBI",
        body: `📈 Sei stato superato in ${t}. Fai altri Step per risalire.`,
        tag: `position-${t}`,
        url: "/airdrops",
      };
    case "draw_winner":
      return {
        title: "AIROOBI",
        body: `🎯 ${t} è tuo! Sei arrivato in vetta.`,
        tag: `winner-${t}`,
        url: "/portafoglio",
      };
    case "draw_robi":
      return {
        title: "AIROOBI",
        body: `🏆 Airdrop concluso! Hai guadagnato ${robiEarned || "?"} ROBI.`,
        tag: `robi-${t}`,
        url: "/portafoglio",
      };
    default:
      return { title: "AIROOBI", body: "", tag: "generic", url: "/" };
  }
}

// ── Main handler ──

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
    const {
      type,
      airdrop_id,
      user_id,
      user_ids,
      title,
      body_text,
      category,
      position,
      robi_earned,
      skip_db,
    } = await req.json();

    const sb = createClient(SB_URL, SB_KEY);
    const notif = buildNotification(type, title, category, position, robi_earned);

    if (type === "airdrop_status") {
      notif.body = body_text || notif.body;
      notif.tag = `status-${airdrop_id || "x"}`;
      notif.url = "/airdrops";
    }

    // Determine target users
    let userIds: string[] = [];

    if (Array.isArray(user_ids) && user_ids.length > 0) {
      // Explicit recipient list (airdrop_status)
      userIds = user_ids;
    } else if (user_id) {
      // Single user (position_lost, draw_winner)
      userIds = [user_id];
    } else if (type === "new_airdrop" && category) {
      // Users with alert for this category
      const { data } = await sb
        .from("user_preferences")
        .select("user_id")
        .eq("category_slug", category)
        .eq("alert_on", true);
      userIds = (data || []).map((r: { user_id: string }) => r.user_id);
    } else if (type === "deadline_2h" && airdrop_id) {
      // Users in watchlist for this airdrop
      const { data } = await sb
        .from("airdrop_watchlist")
        .select("user_id")
        .eq("airdrop_id", airdrop_id);
      userIds = (data || []).map((r: { user_id: string }) => r.user_id);
    } else if (type === "draw_robi" && airdrop_id) {
      // All participants except winner
      const { data: parts } = await sb
        .from("airdrop_participations")
        .select("user_id")
        .eq("airdrop_id", airdrop_id);
      const { data: airdrop } = await sb
        .from("airdrops")
        .select("winner_id")
        .eq("id", airdrop_id)
        .single();
      const winnerId = airdrop?.winner_id;
      userIds = [...new Set((parts || []).map((p: { user_id: string }) => p.user_id))].filter(
        (id) => id !== winnerId
      );
    }

    // Censimento notifiche: interruttore globale ABO + preferenze utente
    // (solo per le non-system; le notifiche di sistema sono obbligatorie)
    const { data: cat } = await sb
      .from("notification_catalog")
      .select("is_system, enabled")
      .eq("key", type)
      .maybeSingle();
    if (cat && !cat.is_system) {
      if (!cat.enabled) {
        return new Response(JSON.stringify({ ok: true, sent: 0, skipped: "catalog_disabled" }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      if (userIds.length > 0) {
        const { data: offs } = await sb
          .from("user_notification_prefs")
          .select("user_id")
          .eq("key", type)
          .eq("enabled", false)
          .in("user_id", userIds);
        const offSet = new Set((offs || []).map((r: { user_id: string }) => r.user_id));
        userIds = userIds.filter((id) => !offSet.has(id));
      }
    }

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch push subscriptions for target users
    const { data: subs } = await sb
      .from("push_subscriptions")
      .select("endpoint, keys_p256dh, keys_auth")
      .in("user_id", userIds);

    let sent = 0;
    const payload = JSON.stringify(notif);

    for (const sub of subs || []) {
      const ok = await sendWebPush(sub.endpoint, sub.keys_p256dh, sub.keys_auth, payload);
      if (ok) sent++;
    }

    // Also save to notifications table for in-app (skip_db: il chiamante le ha già scritte)
    if (!skip_db) {
      const notifRows = userIds.map((uid) => ({
        user_id: uid,
        title: notif.title,
        body: notif.body,
        type: type,
      }));
      await sb.from("notifications").insert(notifRows);
    }

    return new Response(JSON.stringify({ ok: true, sent, total: (subs || []).length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
