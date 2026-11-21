// POST /api/contact — sends the portfolio contact form to your inbox using Resend.
// Runs as a Vercel serverless function (and through the Vite dev server locally, see vite.config.js).
// The Resend API key lives ONLY in the RESEND_API_KEY environment variable — never in the browser code.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "The email service isn't configured yet (RESEND_API_KEY is missing)." });
  }

  let b = req.body;
  if (typeof b === "string") {
    try { b = JSON.parse(b); } catch { b = {}; }
  }
  b = b || {};

  // hidden "company" field: real visitors never fill it, bots do
  if (b.company) return res.status(200).json({ ok: true });

  const name = String(b.name || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().slice(0, 200);
  const message = String(b.message || "").trim().slice(0, 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter your name, a valid email and a message." });
  }

  const to = process.env.CONTACT_TO_EMAIL || "divyabharat1407@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email, // hitting "Reply" in your inbox answers the visitor
        subject: `Portfolio message from ${name}`,
        text: `${message}\n\n— ${name} <${email}>`,
        html: `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">
          <p><strong>${esc(name)}</strong> (<a href="mailto:${esc(email)}">${esc(email)}</a>) sent you a message from your portfolio:</p>
          <blockquote style="margin:12px 0;padding:10px 16px;border-left:3px solid #9db8e8;background:#f5f7fb;white-space:pre-wrap">${esc(message)}</blockquote>
        </div>`,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(502).json({ error: data.message || "The email service rejected the message." });
    }
    return res.status(200).json({ ok: true, id: data.id });
  } catch {
    return res.status(502).json({ error: "Couldn't reach the email service. Please try again." });
  }
}
