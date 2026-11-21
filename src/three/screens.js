import { world } from "./keyframes";
import { projects } from "../data";

// Canvas drawings that become the live screens / wall of the 3D desk.
const rgba = (a) => `rgba(${Math.round(world.accent.r * 255)},${Math.round(world.accent.g * 255)},${Math.round(world.accent.b * 255)},${a})`;
const hex = () => "#" + world.accent.getHexString();

/* ---------- tiny syntax highlighter ---------- */
const C = { comment: "#5c6b80", str: "#a5e075", kw: "#c792ea", num: "#f78c6c", fn: "#82aaff", tag: "#ff6b8b", type: "#ffcb6b", punct: "#89ddff", text: "#d6deeb" };
const KW = /^(import|from|export|const|let|return|async|await|function|if|else|new|type|interface|default)$/;
const TOK = /(\/\/.*|"[^"]*"|'[^']*'|`[^`]*`|<\/?[A-Za-z][\w.]*|[A-Za-z_$][\w$]*|\d+|\s+|.)/g;
function tokenize(line) {
  const toks = line.match(TOK) || [];
  return toks.map((t, i) => {
    let c = C.text;
    if (t.startsWith("//")) c = C.comment;
    else if (/^["'`]/.test(t)) c = C.str;
    else if (t.startsWith("<") && t.length > 1) c = C.tag;
    else if (KW.test(t)) c = C.kw;
    else if (/^\d/.test(t)) c = C.num;
    else if (/^[A-Za-z_$]/.test(t)) c = toks[i + 1] === "(" ? C.fn : /^[A-Z]/.test(t) ? C.type : C.text;
    else if (/^\s+$/.test(t)) c = null;
    else c = C.punct;
    return [t, c];
  });
}

const CODE = `import { Canvas } from "@react-three/fiber";
import { useScroll } from "motion/react";

// build things people enjoy using
export function Portfolio({ user }: Props) {
  const [ready, setReady] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(() => setReady(true));
  }, []);

  return (
    <main className="app">
      <Canvas shadows dpr={[1, 2]}>
        <Desk progress={scrollYProgress} />
      </Canvas>
      <Hero name="Divya Bharat" />
    </main>
  );
}

export const stack = ["React", "Django", "Python"];

async function deploy(branch = "main") {
  await run("npm test");
  await run("npm run build");
  return ship(branch, { zeroDowntime: true });
}
`
  .split("\n")
  .map(tokenize);

const FILES = ["▾ src", "   App.tsx", "   desk.ts", "   hooks.ts", "▾ api", "   routes.ts", "   db.ts", "  package.json", "  README.md"];

export function drawMain(ctx, t, w, h) {
  const A = hex();
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, w, h);
  // explorer
  ctx.fillStyle = "#0a0e14";
  ctx.fillRect(0, 0, 150, h);
  ctx.font = "600 11px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#5c6b80";
  ctx.fillText("EXPLORER", 14, 50);
  const active = Math.floor(t / 3) % 3 + 1;
  FILES.forEach((f, i) => {
    const y = 76 + i * 22;
    if (i === active) {
      ctx.fillStyle = rgba(0.14);
      ctx.fillRect(0, y - 15, 150, 22);
    }
    ctx.fillStyle = i === active ? "#e6edf3" : "#7d8b9f";
    ctx.font = "13px 'JetBrains Mono', monospace";
    ctx.fillText(f, 12, y);
  });
  // tabs
  ctx.fillStyle = "#0a0e14";
  ctx.fillRect(150, 0, w - 150, 32);
  ["App.tsx", "desk.ts", "hooks.ts"].forEach((n, i) => {
    const x = 150 + i * 130;
    if (i === active - 1) {
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(x, 0, 130, 32);
      ctx.fillStyle = A;
      ctx.fillRect(x, 0, 130, 2);
    }
    ctx.fillStyle = i === active - 1 ? "#e6edf3" : "#6b7a90";
    ctx.font = "13px 'JetBrains Mono', monospace";
    ctx.fillText(n, x + 16, 21);
  });
  // scrolling code
  const lh = 22, cw = 8.4, total = CODE.length * lh;
  const off = (t * 28) % total;
  ctx.save();
  ctx.beginPath();
  ctx.rect(150, 32, w - 150 - 96, h - 32 - 26);
  ctx.clip();
  ctx.fillStyle = rgba(0.07);
  ctx.fillRect(150, h / 2 - 15, w - 150 - 96, lh); // current line
  ctx.font = "14px 'JetBrains Mono', monospace";
  for (let k = 0; k < 2; k++) {
    for (let i = 0; i < CODE.length; i++) {
      const y = 52 + i * lh - off + k * total;
      if (y < 36 || y > h) continue;
      ctx.fillStyle = "#3b4658";
      ctx.fillText(String(i + 1).padStart(2, " "), 164, y);
      let x = 204;
      for (const [txt, col] of CODE[i]) {
        if (col) {
          ctx.fillStyle = col;
          ctx.fillText(txt, x, y);
        }
        x += txt.length * cw;
      }
    }
  }
  // blinking caret on the current line
  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = A;
    ctx.fillRect(204 + ((t * 7) % 18) * cw, h / 2 - 12, 2, 18);
  }
  ctx.restore();
  // minimap
  ctx.fillStyle = "#0a0e14";
  ctx.fillRect(w - 96, 32, 96, h - 58);
  for (let i = 0; i < 46; i++) {
    const len = 8 + ((i * 37) % 56);
    const y = 42 + i * 6.2 - ((t * 8) % 6.2);
    ctx.fillStyle = i % 5 === 0 ? rgba(0.55) : "rgba(130,150,180,0.28)";
    ctx.fillRect(w - 86 + ((i * 13) % 12), y, len, 2.6);
  }
  // status bar
  ctx.fillStyle = A;
  ctx.fillRect(0, h - 26, w, 26);
  ctx.fillStyle = "#04121a";
  ctx.font = "600 12px 'JetBrains Mono', monospace";
  ctx.fillText("⎇ main   ✓ 0 errors   ⚡ build passing", 14, h - 9);
  ctx.fillText(`Ln ${24 + (Math.floor(t * 2) % 9)}, Col ${12 + (Math.floor(t * 3) % 20)}    TypeScript React    UTF-8`, w - 380, h - 9);
}

/* ---------- project landing pages (shown on the tall monitor and on the project cards) ---------- */
const imgCache = {};
function getImg(src) {
  if (!src) return null;
  let im = imgCache[src];
  if (!im) { im = new Image(); im.src = src; imgCache[src] = im; }
  return im.complete && im.naturalWidth ? im : null;
}
const F = (px, wt = 500, fam = "'Space Grotesk', sans-serif") => `${wt} ${px}px ${fam}`;
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
function fit(c, text, size, wt, maxW, fam) {
  let fs = size;
  c.font = F(fs, wt, fam);
  while (c.measureText(text).width > maxW && fs > 6) { fs *= 0.95; c.font = F(fs, wt, fam); }
  return fs;
}
function areas(w, h, wide) {
  const u = wide ? h / 10 : w / 14, pad = wide ? w * 0.06 : w * 0.07;
  return wide
    ? { u, pad, ty: h * 0.3, tw: w * 0.46, gx: w * 0.56, gy: h * 0.18, gw: w * 0.38, gh: h * 0.66, fh: h * 0.09 }
    : { u, pad, ty: u * 3.3, tw: w - pad * 2, gx: pad, gy: h * 0.58, gw: w - pad * 2, gh: h * 0.37, fh: w * 0.088 };
}
// headline + sub + call-to-action, shared by every landing page
function hero(c, A, lines, subs, cta, col) {
  c.textAlign = "left";
  let y = A.ty;
  lines.forEach((ln, i) => {
    const fs = fit(c, ln, A.fh, 700, A.tw);
    y += fs * 1.08;
    c.fillStyle = i === lines.length - 1 ? col.accent : col.head;
    c.fillText(ln, A.pad, y);
  });
  y += A.u * 0.5;
  subs.forEach((sb) => {
    const fs = fit(c, sb, A.u * 0.56, 400, A.tw);
    y += fs * 1.55;
    c.fillStyle = col.sub;
    c.fillText(sb, A.pad, y);
  });
  y += A.u * 0.7;
  const fs = A.u * 0.56;
  c.font = F(fs, 600);
  const bw = c.measureText(cta).width + A.u * 1.6, bh = A.u * 1.15;
  c.fillStyle = col.btn;
  rr(c, A.pad, y, bw, bh, bh / 2);
  c.fill();
  c.fillStyle = col.btnText;
  c.fillText(cta, A.pad + A.u * 0.8, y + bh * 0.66);
}
function nav(c, A, w, name, col, mark) {
  mark(A.pad + A.u * 0.45, A.u * 1.0, A.u * 0.42);
  c.font = F(A.u * 0.7, 700);
  c.textAlign = "left";
  c.fillStyle = col.head;
  c.fillText(name, A.pad + A.u * 1.2, A.u * 1.24);
  c.fillStyle = col.sub;
  c.font = F(A.u * 0.5, 500);
  if (w > A.u * 22) ["About", "Features", "Contact"].forEach((s, i) => c.fillText(s, w - A.pad - A.u * (8.6 - i * 3.3) - (i === 0 ? A.u * 0.2 : 0), A.u * 1.2));
  else { for (let i = 0; i < 3; i++) { c.fillRect(w - A.pad - A.u * 1.1, A.u * (0.7 + i * 0.3), A.u * 1.1, 3); } }
}

const DESIGNS = {
  smartroots(c, w, h, t, wide) {
    const A = areas(w, h, wide), col = { head: "#0f2f24", accent: "#1f9d6b", sub: "#46705f", btn: "#1f9d6b", btnText: "#fff" };
    c.fillStyle = "#f3faf6"; c.fillRect(0, 0, w, h);
    nav(c, A, w, "SmartRoots", col, (x, y, r) => { c.fillStyle = "#1f9d6b"; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = "#f3faf6"; c.beginPath(); c.ellipse(x, y, r * 0.35, r * 0.6, 0.6, 0, 7); c.fill(); });
    hero(c, A, ["Learn smarter,", "not harder."], ["Personalised, AI-powered learning", "with progress tracking."], "Start learning →", col);
    const { gx, gy, gw, gh } = A;
    c.fillStyle = "#fff"; rr(c, gx, gy, gw, gh, gh * 0.07); c.fill();
    c.strokeStyle = "#dcefe5"; c.lineWidth = 2; c.stroke();
    const cx = gx + gw * 0.27, cy = gy + gh * 0.42, r = Math.min(gw, gh) * 0.2, pr = 0.72 + 0.08 * Math.sin(t * 1.2);
    c.lineWidth = r * 0.28; c.lineCap = "round";
    c.strokeStyle = "#dff1e8"; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
    c.strokeStyle = "#1f9d6b"; c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pr); c.stroke();
    c.fillStyle = "#0f2f24"; c.textAlign = "center"; c.font = F(r * 0.6, 700); c.fillText(Math.round(pr * 100) + "%", cx, cy + r * 0.2);
    c.fillStyle = "#46705f"; c.font = F(gh * 0.055, 500); c.fillText("Weekly goal", cx, cy + r + gh * 0.1);
    for (let i = 0; i < 4; i++) {
      const bh = gh * (0.18 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.3)));
      c.fillStyle = ["#9fdcc0", "#6cc9a2", "#3db384", "#1f9d6b"][i];
      rr(c, gx + gw * 0.56 + i * gw * 0.1, gy + gh * 0.66 - bh, gw * 0.07, bh, 4); c.fill();
    }
    c.fillStyle = "#e6f6ee"; rr(c, gx + gw * 0.07, gy + gh * 0.8, gw * 0.86, gh * 0.13, gh * 0.065); c.fill();
    c.fillStyle = "#12382b"; c.textAlign = "left"; c.font = F(gh * 0.06, 600); c.fillText("✦ Recommended: Algebra II", gx + gw * 0.12, gy + gh * 0.885);
  },
  venom(c, w, h, t, wide) {
    const A = areas(w, h, wide), col = { head: "#fff", accent: "#ff5a5a", sub: "#9aa3ad", btn: "#ff4d4d", btnText: "#fff" };
    c.fillStyle = "#0b0d10"; c.fillRect(0, 0, w, h);
    nav(c, A, w, "VenomSnake", col, (x, y, r) => { c.strokeStyle = "#f5b83d"; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x - r * 0.5, y + r * 0.3); c.bezierCurveTo(x - r * 0.2, y - r * 0.9, x + r * 0.2, y + r * 0.9, x + r * 0.5, y - r * 0.3); c.stroke(); });
    hero(c, A, ["Spot a snake.", "Save a life."], ["Real-time AI identification", "with guided photo capture."], "Scan now →", col);
    const { gx, gy, gw, gh } = A;
    c.fillStyle = "#14181d"; rr(c, gx, gy, gw, gh, gh * 0.07); c.fill();
    const s = Math.min(gw, gh) * 0.7, sx = gx + (gw - s) / 2, sy = gy + gh * 0.08;
    c.strokeStyle = "#f5b83d"; c.lineWidth = 4; c.lineCap = "round";
    const k = s * 0.16;
    [[sx, sy, 1, 1], [sx + s, sy, -1, 1], [sx, sy + s, 1, -1], [sx + s, sy + s, -1, -1]].forEach(([x, y, dx, dy]) => { c.beginPath(); c.moveTo(x, y + dy * k); c.lineTo(x, y); c.lineTo(x + dx * k, y); c.stroke(); });
    c.strokeStyle = "#7bd36b"; c.lineWidth = s * 0.07; c.beginPath();
    for (let i = 0; i <= 40; i++) { const px = sx + s * 0.12 + (s * 0.76 * i) / 40, py = sy + s * 0.55 + Math.sin(i * 0.35 + t * 2.2) * s * 0.14; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke();
    c.fillStyle = "#7bd36b"; c.beginPath(); c.arc(sx + s * 0.88, sy + s * 0.55 + Math.sin(40 * 0.35 + t * 2.2) * s * 0.14, s * 0.055, 0, 7); c.fill();
    c.fillStyle = "rgba(245,184,61,0.25)"; c.fillRect(sx, sy + ((t * 0.5) % 1) * s, s, 3);
    c.fillStyle = "#ff4d4d"; rr(c, gx + gw * 0.12, gy + gh * 0.84, gw * 0.76, gh * 0.11, gh * 0.055); c.fill();
    c.fillStyle = "#fff"; c.textAlign = "center"; c.font = F(gh * 0.052, 600); c.fillText("Venomous · 92% match", gx + gw / 2, gy + gh * 0.908);
  },
  telecom(c, w, h, t, wide) {
    const A = areas(w, h, wide), col = { head: "#eaf2ff", accent: "#38d6ff", sub: "#8aa0c0", btn: "#38d6ff", btnText: "#06121f" };
    c.fillStyle = "#0a1424"; c.fillRect(0, 0, w, h);
    nav(c, A, w, "NetFault AI", col, (x, y, r) => { c.fillStyle = "#38d6ff"; [0.4, 0.8, 1.2].forEach((m, i) => c.fillRect(x - r + i * r * 0.7, y + r * 0.6 - r * m, r * 0.5, r * m)); });
    hero(c, A, ["Predict faults", "before they", "happen."], ["ML-based network fault", "prediction for engineers."], "View predictions →", col);
    const { gx, gy, gw, gh } = A;
    c.fillStyle = "#101d33"; rr(c, gx, gy, gw, gh, gh * 0.07); c.fill();
    c.fillStyle = "#8aa0c0"; c.textAlign = "left"; c.font = F(gh * 0.052, 500); c.fillText("Fault risk by location", gx + gw * 0.06, gy + gh * 0.1);
    [["Tower 14", 0.86, "#ff5a5a"], ["Tower 07", 0.62, "#f5b83d"], ["Tower 22", 0.44, "#f5b83d"], ["Tower 03", 0.2, "#3ddc97"]].forEach(([n, v, cl], i) => {
      const y = gy + gh * (0.18 + i * 0.12), vv = v * (0.92 + 0.08 * Math.sin(t * 1.5 + i));
      c.fillStyle = "#cfe0ff"; c.font = F(gh * 0.045, 500); c.fillText(n, gx + gw * 0.06, y + gh * 0.04);
      c.fillStyle = "#1b2c4a"; rr(c, gx + gw * 0.3, y, gw * 0.64, gh * 0.05, 5); c.fill();
      c.fillStyle = cl; rr(c, gx + gw * 0.3, y, gw * 0.64 * vv, gh * 0.05, 5); c.fill();
    });
    c.strokeStyle = "#38d6ff"; c.lineWidth = 3; c.beginPath();
    for (let i = 0; i <= 30; i++) { const px = gx + gw * 0.06 + (gw * 0.88 * i) / 30, py = gy + gh * 0.78 + Math.sin(i * 0.45 + t * 1.6) * gh * 0.05 + Math.sin(i * 0.17) * gh * 0.04; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke();
    c.fillStyle = "rgba(255,90,90,0.18)"; rr(c, gx + gw * 0.06, gy + gh * 0.87, gw * 0.5, gh * 0.08, gh * 0.04); c.fill();
    c.fillStyle = "#ff8a8a"; c.font = F(gh * 0.045, 600); c.fillText("● High risk · Tower 14", gx + gw * 0.09, gy + gh * 0.925);
  },
  emotion(c, w, h, t, wide) {
    const A = areas(w, h, wide), col = { head: "#fff", accent: "#ffd6a5", sub: "rgba(255,255,255,0.78)", btn: "#ffd6a5", btnText: "#2b2358" };
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#2b2358"); g.addColorStop(1, "#7a5bb0");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    nav(c, A, w, "Reflect", col, (x, y, r) => { c.strokeStyle = "#ffd6a5"; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y, r * 0.45, 0, 7); c.stroke(); });
    hero(c, A, ["Understand", "what you feel."], ["Write a reflection — get your", "emotion, intensity & next step."], "Reflect now →", col);
    const { gx, gy, gw, gh } = A;
    c.fillStyle = "rgba(255,255,255,0.13)"; rr(c, gx, gy, gw, gh, gh * 0.07); c.fill();
    c.fillStyle = "rgba(255,255,255,0.85)"; c.textAlign = "left"; c.font = F(gh * 0.052, 400);
    c.fillText("“Today was overwhelming, but", gx + gw * 0.06, gy + gh * 0.13);
    c.fillText("I made it through…”", gx + gw * 0.06, gy + gh * 0.205);
    [["Anxiety", 0.62, "#ff9aa2"], ["Calm", 0.24, "#9be7ff"], ["Hope", 0.14, "#ffd6a5"]].forEach(([n, v, cl], i) => {
      const y = gy + gh * (0.3 + i * 0.14), vv = v * (0.94 + 0.06 * Math.sin(t * 1.4 + i * 1.7));
      c.fillStyle = "#fff"; c.font = F(gh * 0.045, 500); c.fillText(n, gx + gw * 0.06, y + gh * 0.04);
      c.fillStyle = "rgba(255,255,255,0.15)"; rr(c, gx + gw * 0.3, y, gw * 0.5, gh * 0.05, 5); c.fill();
      c.fillStyle = cl; rr(c, gx + gw * 0.3, y, gw * 0.5 * (vv / 0.62), gh * 0.05, 5); c.fill();
      c.fillStyle = "#fff"; c.fillText(Math.round(vv * 100) + "%", gx + gw * 0.84, y + gh * 0.04);
    });
    c.fillStyle = "#ffd6a5"; rr(c, gx + gw * 0.06, gy + gh * 0.76, gw * 0.88, gh * 0.17, gh * 0.06); c.fill();
    c.fillStyle = "#2b2358"; c.font = F(gh * 0.05, 600); c.fillText("Try: 5-minute breathing", gx + gw * 0.1, gy + gh * 0.84);
    c.font = F(gh * 0.04, 500); c.fillText("confidence 91%", gx + gw * 0.1, gy + gh * 0.895);
  },
};

export function drawLanding(c, p, x, y, w, h, t) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  c.rect(0, 0, w, h);
  c.clip();
  const img = getImg(p.image);
  if (img) {
    const sc = Math.max(w / img.width, h / img.height);
    c.drawImage(img, (w - img.width * sc) / 2, 0, img.width * sc, img.height * sc);
  } else {
    DESIGNS[p.design]?.(c, w, h, t, w > h * 1.15);
  }
  c.restore();
}

export function landingDataURL(p, w = 640, h = 400) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  drawLanding(cv.getContext("2d"), p, 0, 0, w, h, 0.8);
  return cv.toDataURL("image/jpeg", 0.92);
}

let lastSel = -2, selT0 = 0;
// bounce between top and bottom of a tall page with a short pause at each end
const scrollOffset = (ts, max, speed) => {
  const T = max / speed, P = T + 1.6, k = ts % (2 * P);
  const a = k < P ? k : 2 * P - k;
  return Math.min(Math.max(a - 0.8, 0), T) * speed;
};

// the tall monitor: a browser showing the real UI of your projects. Click a project card to open it here.
export function drawTerm(ctx, t, w, h) {
  const n = projects.length, dur = 9;
  projects.forEach((q) => { getImg(q.tall); });
  if (world.selected !== lastSel) { lastSel = world.selected; selT0 = t; }
  const sel = world.selected, auto = sel < 0;
  const idx = auto ? Math.floor(t / dur) % n : sel;
  const ts = auto ? t % dur : t - selT0;
  const p = projects[idx];
  ctx.fillStyle = "#10141b";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1a2029";
  ctx.fillRect(0, 0, w, 56);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((cl, i) => { ctx.fillStyle = cl; ctx.beginPath(); ctx.arc(24 + i * 20, 28, 6, 0, 7); ctx.fill(); });
  ctx.fillStyle = "#0d1117";
  rr(ctx, 96, 12, w - 120, 32, 16);
  ctx.fill();
  ctx.fillStyle = "#8b9bb2";
  ctx.font = "13px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(("🔒 " + (p.host || p.title)).slice(0, 38), 114, 33);
  const vy = 56, vh = h - 56 - 44;
  const tall = getImg(p.tall);
  if (tall) {
    const sc = w / tall.width, ih = tall.height * sc, max = Math.max(0, ih - vh);
    const off = scrollOffset(ts, max, 70);
    ctx.drawImage(tall, 0, off / sc, tall.width, vh / sc, 0, vy, w, vh);
  } else {
    drawLanding(ctx, p, 0, vy, w, vh, t);
  }
  const fade = auto ? Math.max(0, 1 - ts / 0.35, (ts - (dur - 0.35)) / 0.35) : Math.max(0, 1 - ts / 0.35);
  if (fade > 0) { ctx.fillStyle = `rgba(16,20,27,${Math.min(1, fade)})`; ctx.fillRect(0, vy, w, vh); }
  ctx.fillStyle = "#1a2029";
  ctx.fillRect(0, h - 44, w, 44);
  projects.forEach((q, i) => {
    const cw = w / n;
    ctx.fillStyle = i === idx ? "#e6edf3" : "#6b7a90";
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(q.title.split(" ")[0], cw * i + cw / 2, h - 18);
    if (i === idx) { ctx.fillStyle = "#9db8e8"; ctx.fillRect(cw * i + cw * 0.2, h - 44, cw * 0.6 * (auto ? ts / dur : 1), 3); }
  });
  ctx.textAlign = "left";
}

/* ---------- laptop dashboard ---------- */
export function drawDash(ctx, t, w, h) {
  const A = hex();
  ctx.fillStyle = "#0b1017";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#111925";
  ctx.fillRect(0, 0, w, 40);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(20 + i * 20, 20, 6, 0, 7);
    ctx.fill();
  });
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fillRect(110, 9, 280, 22);
  ctx.fillStyle = "#8b9bb2";
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillText("smartroots · analytics", 122, 25);
  // tiles
  const tiles = [["REQUESTS", 12400 + Math.floor(t * 37) % 900], ["LATENCY ms", 38 + Math.floor(6 * Math.sin(t))], ["UPTIME %", 99.98]];
  tiles.forEach(([k, v], i) => {
    const x = 20 + i * 205;
    ctx.fillStyle = "#111925";
    ctx.fillRect(x, 58, 190, 72);
    ctx.fillStyle = "#6b7a90";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText(k, x + 14, 80);
    ctx.fillStyle = i === 0 ? A : "#e6edf3";
    ctx.font = "600 26px 'Space Grotesk', sans-serif";
    ctx.fillText(typeof v === "number" && v < 100 && i === 2 ? v.toFixed(2) : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ","), x + 14, 114);
  });
  // bars
  ctx.fillStyle = "#111925";
  ctx.fillRect(20, 146, 300, 250);
  for (let i = 0; i < 14; i++) {
    const v = 0.3 + 0.55 * Math.abs(Math.sin(t * 1.4 + i * 0.7));
    ctx.fillStyle = rgba(0.35 + v * 0.6);
    const bh = v * 200;
    ctx.fillRect(34 + i * 20, 380 - bh, 13, bh);
  }
  // line chart
  ctx.fillStyle = "#111925";
  ctx.fillRect(334, 146, 286, 250);
  ctx.strokeStyle = A;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const x = 346 + i * 6.6;
    const y = 270 + Math.sin(i * 0.4 + t * 1.8) * 50 + Math.sin(i * 0.9 - t) * 22;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.lineTo(610, 386);
  ctx.lineTo(346, 386);
  ctx.fillStyle = rgba(0.12);
  ctx.fill();
}

/* ---------- falling code on the back wall ---------- */
const GLYPHS = "01{}[]<>/=+;:#$%&*ABCDEFabcdef".split("");
const drops = Array.from({ length: 64 }, () => Math.random() * -40);
export function drawRain(ctx, t, w, h) {
  ctx.fillStyle = "rgba(7,11,17,0.16)";
  ctx.fillRect(0, 0, w, h);
  ctx.font = "15px 'JetBrains Mono', monospace";
  for (let c = 0; c < drops.length; c++) {
    const y = drops[c] * 16;
    if (y > 0) {
      ctx.fillStyle = "rgba(235,255,250,0.85)";
      ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], c * 16, y);
      ctx.fillStyle = rgba(0.75);
      ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], c * 16, y - 16);
    }
    if (y > h && Math.random() > 0.96) drops[c] = Math.random() * -12;
    drops[c] += 0.55 + (c % 5) * 0.12;
  }
}

/* ---------- floating tech "chips" ---------- */
export function chipCanvas(text) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(10,16,26,0.78)";
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(8, 14, 240, 100, 30);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "600 52px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 66);
  return c;
}

export function neonCanvas() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#fff";
  ctx.font = "700 150px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("</>", 256, 128);
  ctx.shadowBlur = 8;
  ctx.fillText("</>", 256, 128);
  return c;
}
