import { motion } from "motion/react";
import { profile, socials } from "../data";

// The page ends at the monitor: the form itself lives on its screen (see ScreenForm + Desk.jsx).
// This section only holds a slim caption bar underneath it, kept clear of the 3D screen.
export default function Contact() {
  return (
    <section id="contact" className="section contact-end">
      <motion.div
        className="contact-caption"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.5 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="cc-title">Let's build something together.</h2>
        <p className="cc-sub">
          Write to me on the screen above or at <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <div className="cc-links">
          {socials.map((s) => (
            <a key={s.name} href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{s.name} ↗</a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
