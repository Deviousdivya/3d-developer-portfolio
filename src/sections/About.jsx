import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Reveal from "../components/Reveal";
import { CountUp, SplitText, Tilt } from "../components/Interact";
import { profile } from "../data";

export default function About() {
  const ref = useRef(null);
  // the card drifts upward slower than the page = depth while you scroll
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const rot = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -4]);

  return (
    <section id="about" ref={ref} className="section right">
      <motion.div className="panel" style={{ y, rotateZ: rot }}>
        <Tilt className="glass" max={4}>
          <Reveal>
            <p className="eyebrow">01 — About</p>
          </Reveal>
          <SplitText className="title" text="Building smart, interactive web products." />
          {profile.bio.map((p, i) => (
            <Reveal key={i} delay={0.15 + i * 0.12}>
              <p className="body">{p}</p>
            </Reveal>
          ))}
          <div className="stats">
            {profile.stats.map((s, i) => (
              <Reveal key={s.label} delay={0.3 + i * 0.1} y={30}>
                <div className="stat">
                  <CountUp value={s.value} />
                  <span>{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Tilt>
      </motion.div>
    </section>
  );
}
