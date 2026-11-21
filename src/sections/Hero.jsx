import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import FlipWords from "../components/FlipWords";
import { Magnetic, SplitText } from "../components/Interact";
import { profile } from "../data";
import { scrollToId } from "../smooth";

const rise = (delay) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  // text drifts against the cursor and fades/lifts as you scroll away
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 500], [0, -90]);
  const fade = useTransform(scrollY, [0, 420], [1, 0]);

  useEffect(() => {
    const move = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * -26);
      my.set((e.clientY / window.innerHeight - 0.5) * -16);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [mx, my]);

  return (
    <section id="home" className="section left hero">
      <div className="hero-shade" />
      <motion.div className="panel" style={{ x: sx, y: sy, opacity: fade }}>
        <motion.div style={{ y: lift }}>
          <motion.p className="eyebrow" {...rise(0.2)}>
            <span className="prompt">$</span>&nbsp;Open to work<span className="caret" />
          </motion.p>
          <SplitText as="h1" className="display" text={profile.name} delay={0.35} />
          <motion.p className="role" {...rise(0.7)}>
            I build <FlipWords words={profile.words} /> web experiences.
          </motion.p>
          <motion.p className="lead" {...rise(0.85)}>
            {profile.intro}
          </motion.p>
          <motion.div className="actions" {...rise(1.0)}>
            <Magnetic>
              <a href="#projects" className="btn primary" onClick={(e) => { e.preventDefault(); scrollToId("projects"); }}>
                View my work
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn ghost" onClick={(e) => { e.preventDefault(); scrollToId("contact"); }}>
                Let's talk
              </a>
            </Magnetic>
          </motion.div>
          <motion.div className="scroll-hint" {...rise(1.3)}>
            <span className="mouse" /> Scroll to explore the setup
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
