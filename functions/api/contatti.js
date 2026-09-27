/**
 * Cloudflare Pages Function — POST /api/contatti
 * Invia le richieste del sito a info@localcare.it tramite Resend.
 *
 * Variabili d'ambiente (Cloudflare Pages > Settings > Variables):
 *   RESEND_API_KEY  obbligatoria — chiave API Resend
 *   MAIL_TO         opzionale    — default: info@localcare.it
 *   MAIL_FROM       opzionale    — default: sito@localcare.it (dominio verificato)
 */
export async function onRequestPost({ request, env }) {
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });

  let d;
  try {
    d = await request.json();
  } catch {
    return json({ ok: false, error: "Richiesta non valida" }, 400);
  }

  const clean = (v, max = 500) => String(v ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
  const nome = clean(d.nome, 120);
  const email = clean(d.email, 160);
  const messaggio = String(d.messaggio ?? "").trim().slice(0, 5000);

  if (!nome || !email || !messaggio) {
    return json({ ok: false, error: "Campi obbligatori mancanti" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: "Indirizzo email non valido" }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "Servizio email non configurato" }, 503);
  }

  const oggetto = clean(d.oggetto, 200) || clean(d.prodotto, 160) || "informazioni";
  const testo = [
    `Nome: ${nome}`,
    `Email: ${email}`,
    `Telefono: ${clean(d.telefono, 60) || "-"}`,
    `Azienda / Struttura: ${clean(d.azienda, 160) || "-"}`,
    `Ruolo: ${clean(d.ruolo, 120) || "-"}`,
    `Prodotto di interesse: ${clean(d.prodotto, 160) || "-"}`,
    `Oggetto: ${clean(d.oggetto, 200) || "-"}`,
    "",
    messaggio,
  ].join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.MAIL_FROM || "sito@localcare.it",
      to: [env.MAIL_TO || "info@localcare.it"],
      reply_to: email,
      subject: `Richiesta dal sito - ${oggetto}`,
      text: testo,
    }),
  });

  if (!r.ok) return json({ ok: false, error: "Invio non riuscito" }, 502);
  return json({ ok: true });
}
