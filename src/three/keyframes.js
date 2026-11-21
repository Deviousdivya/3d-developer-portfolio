import * as THREE from "three";

// Each section of the page = one stop of the camera around the developer's desk.
//  cam / look : where the camera stands and what it looks at (landscape: the subject sits opposite the text panel)
//  p          : the same stop re-framed for phones — the subject sits in the top part of the screen, text below
//  contact    : flies right up to a monitor, whose screen is the contact form
const A = "#9db8e8";
export const KEYFRAMES = [
  { id: "home", cam: [-1.1, 1.35, 6.6], look: [-2.45, 0.85, 0], label: "index.tsx",
    p: { cam: [0.4, 1.1, 6.4], look: [0.1, -0.5, 0] } },
  { id: "about", cam: [-0.1, 0.98, 2.5], look: [-0.05, 0.42, 0.3], label: "headphones.on()",
    p: { cam: [-0.9, 0.5, 3.7], look: [-0.9, -0.2, 0.5] } },
  { id: "skills", cam: [0.25, 1.2, 2.9], look: [-0.55, 0.98, -0.2], label: "stack.ts",
    p: { cam: [0.3, 1.1, 5.9], look: [0.3, -0.4, -0.55] } },
  { id: "projects", cam: [-0.6, 1.25, 2.9], look: [-0.9, 1.0, -0.3], label: "deploy.sh",
    p: { cam: [-0.32, 1.2, 2.64], look: [-1.95, 0.59, -0.35] } },
  { id: "experience", cam: [1.8, 1.15, 3.0], look: [1.35, 0.55, 0.1], label: "git log",
    p: { cam: [0.5, 0.8, 4.4], look: [1.85, -0.4, 0.2] } },
  // desktop: head-on to the wide display; phone: head-on to the portrait display
  { id: "contact", cam: [0, 0.98, 1.62], look: [0, 0.83, -0.52], label: "connect()",
    p: { cam: [-0.37, 1.2, 2.55], look: [-1.95, 0.95, -0.35] } },
].map((k) => ({
  ...k,
  accent: A,
  cam: new THREE.Vector3(...k.cam),
  look: new THREE.Vector3(...k.look),
  p: { cam: new THREE.Vector3(...k.p.cam), look: new THREE.Vector3(...k.p.look) },
  accentC: new THREE.Color(A),
}));

const smooth = (t) => t * t * (3 - 2 * t);

// The contact stop is computed from the real window: the monitor's screen is fitted into the space between the
// nav and the caption + footer, so the text under it can never be covered, whatever the screen size.
const SCREENS = {
  main: { c: new THREE.Vector3(0, 0.975, -0.55 + 0.0266), n: new THREE.Vector3(0, 0, 1), w: 2.2, h: 0.95 },
  term: { c: new THREE.Vector3(-1.95 + Math.sin(0.5) * 0.0266, 1.2, -0.35 + Math.cos(0.5) * 0.0266), n: new THREE.Vector3(Math.sin(0.5), 0, Math.cos(0.5)), w: 0.9, h: 1.4 },
};
const _cf = { cam: new THREE.Vector3(), look: new THREE.Vector3() };
function contactFrame(compact) {
  const sc = compact ? SCREENS.term : SCREENS.main;
  const vw = window.innerWidth, vh = window.innerHeight, aspect = vw / vh;
  const tan = Math.tan(THREE.MathUtils.degToRad(compact ? 44 : 40) / 2);
  const cap = document.querySelector(".contact-caption"), ft = document.querySelector(".footer");
  const reserved = (cap ? cap.offsetHeight : 70) + (ft ? ft.offsetHeight : 70) + 28;
  const top = 66;
  const band = Math.max(120, vh - top - reserved);
  const d = Math.max((sc.h * vh) / (band * 0.96 * 2 * tan), sc.w / (0.94 * 2 * tan * aspect));
  const dy = ((vh / 2 - (top + band / 2)) / vh) * 2 * d * tan; // lift the screen into the free band
  _cf.look.copy(sc.c);
  _cf.look.y -= dy;
  _cf.cam.copy(sc.c).addScaledVector(sc.n, d);
  _cf.cam.y -= dy;
  return _cf;
}


// phones, small windows and tall layouts use the "compact" framing + the portrait monitor for the form
export const isCompact = () => window.innerWidth <= 860 || window.innerWidth / window.innerHeight < 0.95;

// Shared mutable state read by every 3D component each frame.
export const world = {
  tCam: KEYFRAMES[0].cam.clone(),
  tLook: KEYFRAMES[0].look.clone(),
  tAccent: KEYFRAMES[0].accentC.clone(),
  cam: KEYFRAMES[0].cam.clone(),
  look: KEYFRAMES[0].look.clone(),
  accent: KEYFRAMES[0].accentC.clone(),
  selected: -1, // project clicked in the Projects section (shown on the tall monitor)
  index: 0,
  progress: 0, // 0..1 through the whole page
  compact: false,
  formTarget: 0, // 1 when the camera has arrived at the monitor on the last page
  formT: 0, // smoothed
  mouse: { x: 0, y: 0 },
  vel: 0, // scroll speed (px/s), smoothed
};

let els = null;
export function sampleScroll() {
  if (!els) els = KEYFRAMES.map((k) => document.getElementById(k.id));
  if (els.some((e) => !e)) {
    els = null;
    return false;
  }
  world.compact = isCompact();
  const mid = window.scrollY + window.innerHeight / 2;
  const centers = els.map((el) => {
    const r = el.getBoundingClientRect();
    return r.top + window.scrollY + r.height / 2;
  });
  let i = 0;
  while (i < centers.length - 2 && mid > centers[i + 1]) i++;
  const j = Math.min(i + 1, KEYFRAMES.length - 1);
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[j];
  const t = smooth(THREE.MathUtils.clamp((mid - centers[i]) / Math.max(1, centers[j] - centers[i]), 0, 1));

  const cf = (a.id === "contact" || b.id === "contact") ? contactFrame(world.compact) : null;
  const ca = a.id === "contact" ? cf.cam : world.compact ? a.p.cam : a.cam, la = a.id === "contact" ? cf.look : world.compact ? a.p.look : a.look;
  const cb = b.id === "contact" ? cf.cam : world.compact ? b.p.cam : b.cam, lb = b.id === "contact" ? cf.look : world.compact ? b.p.look : b.look;
  world.tCam.copy(ca).lerp(cb, t);
  world.tLook.copy(la).lerp(lb, t);
  world.tAccent.copy(a.accentC).lerp(b.accentC, t);
  world.index = t > 0.5 ? j : i;
  world.progress = (i + t) / (KEYFRAMES.length - 1);
  // the contact form appears on the screen once the camera has (almost) arrived
  world.formTarget = j === KEYFRAMES.length - 1 ? smooth(THREE.MathUtils.clamp((t - 0.6) / 0.35, 0, 1)) : 0;
  return true;
}

export function blendWorld(dt) {
  const k = 1 - Math.exp(-3.2 * dt);
  world.cam.lerp(world.tCam, k);
  world.look.lerp(world.tLook, k);
  world.accent.lerp(world.tAccent, 1 - Math.exp(-4 * dt));
  world.formT = THREE.MathUtils.damp(world.formT, world.formTarget, 5, dt);
}
