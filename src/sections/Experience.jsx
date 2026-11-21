import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Reveal from "../components/Reveal";
import { SplitText, Tilt } from "../components/Interact";
import { experience, education, achievements } from "../data";

export default function Experience() {
  const ref = useRef(null);
  const tl = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [90, -90]);
  // the glowing line draws itself down the timeline as you scroll
  const { scrollYProgress: lineP } = useScroll({ target: tl, offset: ["start 75%", "end 55%"] });
  const line = useSpring(lineP, { stiffness: 90, damping: 22 });

  return (
    <section id="experience" ref={ref} className="section left">
      <motion.div className="panel" style={{ y }}>
        <Tilt className="glass" max={3}>
          <Reveal>
            <p className="eyebrow">04 — Journey</p>
          </Reveal>
          <SplitText className="title" text="Experience & achievements." />
          <div className="timeline" ref={tl}>
            <motion.span className="tl-line" style={{ scaleY: line }} />
            {experience.map((e, i) => (
              <Reveal key={e.role} delay={0.1} x={-40} y={0}>
                <div className="tl-item">
                  <motion.span
                    className="tl-dot"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.2 + i * 0.1 }}
                  />
                  <p className="tl-date">{e.date}</p>
                  <h3>
                    {e.role} <span>· {e.company}</span>
                  </h3>
                  <ul>
                    {e.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="extras">
            <Reveal delay={0.1}>
              <h3 className="group">Education</h3>
              {education.map((e) => (
                <p key={e.school} className="ex-row">
                  <strong>{e.school}</strong>
                  <span>{e.detail} · {e.years}</span>
                </p>
              ))}
            </Reveal>
            <Reveal delay={0.15}>
              <h3 className="group">Achievements</h3>
              {achievements.map((a) => (
                <p key={a.title} className="ex-row">
                  <strong>{a.title}</strong>
                  <span>{a.detail}</span>
                </p>
              ))}
            </Reveal>
          </div>
        </Tilt>
      </motion.div>
    </section>
  );
}
