import { useRef } from "react";
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

// Pulls its child toward the pointer when it gets close - buttons feel magnetic.
export function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 14, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 14, mass: 0.4 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} className={"magnetic " + className} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.div>
  );
}

// 3D tilt toward the pointer + a spotlight that follows it (via --mx/--my CSS variables).
export function Tilt({ children, max = 10, className = "", glare = true, ...rest }) {
  const ref = useRef(null);
  const rx = useSpring(0, { stiffness: 200, damping: 18 });
  const ry = useSpring(0, { stiffness: 200, damping: 18 });
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 2 * max);
    rx.set(-(py - 0.5) * 2 * max);
    ref.current.style.setProperty("--mx", px * 100 + "%");
    ref.current.style.setProperty("--my", py * 100 + "%");
  };
  const leave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div
      ref={ref}
      className={"tilt " + (glare ? "glare " : "") + className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={move}
      onPointerLeave={leave}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Heading that reveals word by word (rising out of a mask, un-blurring).
export function SplitText({ text, className = "", delay = 0, as: Tag = "h2" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="word-mask" aria-hidden="true">
          <motion.span
            className="word"
            initial={{ y: "110%", opacity: 0, filter: "blur(8px)", rotate: 4 }}
            animate={inView ? { y: 0, opacity: 1, filter: "blur(0px)", rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// Number that counts up when scrolled into view ("40+", "12", "5+").
export function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const num = parseInt(value, 10);
  const suffix = String(value).replace(/[0-9]/g, "");
  const n = useMotionValue(0);
  const shown = useTransform(n, (v) => Math.round(v));
  useEffect(() => {
    if (inView) animate(n, num, { duration: 1.6, ease: "easeOut" });
  }, [inView, n, num]);
  return (
    <strong ref={ref}>
      <motion.span>{shown}</motion.span>
      {suffix}
    </strong>
  );
}
