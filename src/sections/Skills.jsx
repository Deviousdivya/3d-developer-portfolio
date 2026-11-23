import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import Reveal from "../components/Reveal";
import { SplitText, Tilt } from "../components/Interact";
import { skills } from "../data";

function Chip({ children, i, inView, hot }) {
  return (
    <motion.span
      className={"chip" + (hot ? " hot" : "")}
      initial={{ opacity: 0, scale: 0.4, y: 20 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.25 + i * 0.05 }}
      whileHover={{ scale: 1.12, rotate: -3 }}
      data-cursor="*"
    >
      {children}
    </motion.span>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const rot = useTransform(scrollYProgress, [0, 0.5, 1], [-6, 0, 4]);
  let n = 0;

  return (
    <section id="skills" className="section left">
      <motion.div className="panel" ref={ref} style={{ y, rotateZ: rot }}>
        <Tilt className="glass" max={4}>
          <Reveal>
            <p className="eyebrow">02 — Toolkit</p>
          </Reveal>
          <SplitText className="title" text="The tools I reach for." />
          {skills.map((g, gi) => (
            <Reveal key={g.group} delay={0.1 + gi * 0.1} x={-30} y={0}>
              <h3 className={"group" + (g.hot ? " hot" : "")}>{g.group}</h3>
              <div className="chips">
                {g.items.map((item) => (
                  <Chip key={item} i={n++} inView={inView} hot={g.hot}>
                    {item}
                  </Chip>
                ))}
              </div>
            </Reveal>
          ))}
        </Tilt>
      </motion.div>
    </section>
  );
}
