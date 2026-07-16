# AIROOBI · Pensata email di comunicazione — 16 lug 2026 (CCP)

Obiettivo Skeezu: attivare le email agli utenti **senza cifre esorbitanti** e
**senza finire in spam**. Qui la fotografia, le opzioni con i prezzi, e la
raccomandazione. Nessuna spesa attivata: questo è il piano, si preme il bottone quando decidi tu.

## Cosa abbiamo GIÀ in casa (gratis)
| Pezzo | Stato |
|---|---|
| Ricezione email su @airoobi.com | ✅ Cloudflare Email Routing (MX attivi, hello@ ecc.) |
| SPF | ✅ `v=spf1 include:_spf.mx.cloudflare.net ~all` (da estendere col provider di invio) |
| DMARC | ✅ `p=quarantine` con report a hello@ — ottima base, post warm-up si sale a `p=reject` |
| Log invii + cap giornaliero | ✅ tabella `email_send_log` già progettata (W3) con logica anti-sforamento |
| Preferenze utente | ✅ `user_preferences` / `profiles.notify_all` per l'opt-out |
| **Manca** | il provider di invio (DKIM) + una edge function `send-email` + i template |

## Le opzioni (prezzi verificati gen 2026 — ricontrollare al GO)
| Provider | Gratis | Poi | Note |
|---|---|---|---|
| **Resend** ⭐ | 3.000/mese (100/g) | $20/mese → 50k | API semplicissima dalle edge function, DKIM guidato, deliverability ottima, DX migliore |
| Postmark | ~100/mese | $15/mese → 10k | Deliverability leggendaria sui transazionali; lo schema log lo prevedeva già |
| Brevo | 300/giorno (~9k/mese) | da ~$9/mese | Include editor campagne marketing; IP condivisi di qualità variabile |
| Amazon SES | 62k/mese se da AWS infra, senò no free | **$0,10/1.000** | Il più economico in assoluto a scala; ma sandbox, reputation e zero UI: più lavoro |
| Supabase SMTP nativo | — | — | Solo per le auth email (conferme/reset), va comunque puntato al provider scelto |

## Raccomandazione CCP
**Fase 1 (ora, costo 0):** Resend free tier.
1. DNS: DKIM Resend + SPF esteso su **sottodominio dedicato agli invii** (`updates.airoobi.com`) — così la reputazione di invio non tocca il dominio radice, e il DMARC quarantine esistente ci protegge subito.
2. Edge function `send-email` (chiave nel vault, mai nel client) che scrive `email_send_log` e rispetta il cap.
3. **Digest, non mitraglia**: una email al giorno max per utente (cron che raggruppa le notifiche non lette), più gli eventi critici in tempo reale (sei arrivato in vetta · il venditore deve decidere · riscossione ROBI). Con 9 utenti = decine di email/mese; con 1.000 Alpha Brave e digest settimanale ≈ 4-5k/mese → si resta vicini al free.
4. Igiene anti-spam: double opt-in per tutto ciò che non è transazionale, header `List-Unsubscribe` (one-click), link disiscrizione nel footer, testi asciutti senza toni promozionali nei transazionali, ramp-up graduale dei volumi.

**Fase 2 (quando superiamo ~3k/mese):** o Resend $20 (semplice) o migrazione a **SES $0,10/1.000** (economia massima, più sbatti). Decisione da prendere coi numeri veri in mano.

**Fase 3 (marketing/newsletter alla waitlist):** binario separato (Brevo free o Listmonk self-host sul Pi + SES), MAI mischiato col transazionale — se una campagna finisce in spam non deve trascinarsi dietro le email di servizio.

## Cosa serve da te al GO
- Scelta provider (proposta: Resend) e account (email aziendale).
- Accesso DNS Cloudflare per i 3 record (2 min).
- Firma sul set di email di Fase 1 (proposta: benvenuto · digest giornaliero · vetta raggiunta · decisione venditore richiesta · riscossione confermata).

Stima onesta: **0 €/mese per tutto l'Alpha**, ~20 €/mese quando saremo cresciuti al punto da esserne felici.
