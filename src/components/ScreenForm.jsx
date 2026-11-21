import { useState } from "react";
import { profile, socials } from "../data";
import SendMouse from "./SendMouse";

// The contact form. It is pinned onto the 3D monitor's screen by Desk.jsx (position + perspective come from
// the monitor), so on the last page the visitor writes to you directly on the display.
// Submitting calls /api/contact, which delivers the message to your inbox through Resend.
export default function ScreenForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [msg, setMsg] = useState("");
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMsg("");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Something went wrong.");
      setStatus("sent");
      setMsg("Message sent — I'll get back to you soon.");
      setForm({ name: "", email: "", message: "", company: "" });
      setTimeout(() => setStatus((s) => (s === "sent" ? "idle" : s)), 6000);
    } catch (err) {
      setStatus("error");
      setMsg(`${err.message} You can also email me at ${profile.email}.`);
    }
  };

  return (
    <div id="screen-form" className="sf" style={{ visibility: "hidden", opacity: 0 }}>
      <div className="sf-bar">
        <i /><i /><i />
        <span>New message — {profile.email}</span>
      </div>
      <div className="sf-body">
        <aside className="sf-side">
          <div className="sf-avatar"><img src="/photo-face.jpg" alt={profile.name} /></div>
          <div className="sf-who">
            <h3>{profile.name}</h3>
            <p>{profile.title}</p>
          </div>
          <dl className="sf-rows">
            <div><dt>BASE</dt><dd>{profile.location}</dd></div>
            <div><dt>STATUS</dt><dd className="ok">● Open to work</dd></div>
            <div><dt>EMAIL</dt><dd>{profile.email}</dd></div>
          </dl>
          <div className="sf-links">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{s.name} ↗</a>
            ))}
          </div>
        </aside>
        <form className="sf-form" onSubmit={onSubmit}>
          <label>
            <span>To</span>
            <input value={profile.email} readOnly tabIndex={-1} />
          </label>
          <div className="sf-two">
            <label>
              <span>Your name</span>
              <input name="name" value={form.name} onChange={onChange} required placeholder="Jane Doe" autoComplete="name" maxLength={120} />
            </label>
            <label>
              <span>Your email</span>
              <input name="email" type="email" value={form.email} onChange={onChange} required placeholder="jane@company.com" autoComplete="email" maxLength={200} />
            </label>
          </div>
          <label className="grow">
            <span>Message</span>
            <textarea name="message" value={form.message} onChange={onChange} required placeholder="Tell me about your project…" data-lenis-prevent maxLength={5000} />
          </label>
          {/* spam trap: invisible to people, bots fill it */}
          <input className="sf-hp" name="company" value={form.company} onChange={onChange} tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="sf-actions">
            <p className={"sf-status " + status} role="status" aria-live="polite">{msg}</p>
            <span className="send-wrap">
              <button id="sf-send" className="sf-send" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send message →"}
              </button>
              <SendMouse />
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
