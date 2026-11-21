import Lenis from "lenis";

// Buttery inertia scrolling shared by the whole app.
let lenis = null;

export function startSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, smoothWheel: true });
  const raf = (t) => {
    lenis?.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: "smooth" });
}
