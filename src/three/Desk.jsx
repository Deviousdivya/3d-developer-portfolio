import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { world } from "./keyframes";
import { drawMain, drawTerm, drawDash } from "./screens";

const FLOOR_Y = -2.4;

/* ---------- helpers ---------- */
const rbCache = new Map();
const rb = (w, h, d, r = 0.01) => {
  const k = [w, h, d, r].join();
  if (!rbCache.has(k)) rbCache.set(k, new RoundedBoxGeometry(w, h, d, 4, r));
  return rbCache.get(k);
};
function RBox({ args, children, ...p }) {
  return <mesh geometry={rb(...args)} {...p}>{children}</mesh>;
}
const arc = (rx, ry, a0, a1, n = 48) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: n + 1 }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / n;
      return new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0);
    })
  );
const tube = (curve, r, seg = 64) => new THREE.TubeGeometry(curve, seg, r, 12, false);
const lathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

// materials
const alu = <meshStandardMaterial color="#c8cbd1" metalness={1} roughness={0.3} />;
const graphite = <meshPhysicalMaterial color="#2a2c31" metalness={0.9} roughness={0.36} clearcoat={0.3} />;
const blackGlass = <meshPhysicalMaterial color="#040506" roughness={0.1} clearcoat={1} clearcoatRoughness={0.05} />;
const leather = <meshPhysicalMaterial color="#16171b" roughness={0.58} sheen={1} sheenRoughness={0.5} sheenColor="#4a4d55" />;
const rubber = <meshStandardMaterial color="#101114" roughness={0.9} />;

/* A canvas texture that redraws itself a few times a second. */
function useScreen(w, h, draw, fps = 20) {
  const o = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return { ctx: c.getContext("2d"), tex, acc: 1 };
  }, [w, h]);
  useFrame((s, dt) => {
    o.acc += dt;
    if (o.acc < 1 / fps) return;
    o.acc = 0;
    draw(o.ctx, s.clock.elapsedTime, w, h);
    o.tex.needsUpdate = true;
  });
  return o.tex;
}

function woodTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const x = c.getContext("2d");
  x.fillStyle = "#5a3f2b";
  x.fillRect(0, 0, 1024, 512);
  let seed = 11;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 220; i++) {
    const y = r() * 512, a = r() * 0.16;
    x.strokeStyle = r() > 0.5 ? `rgba(20,10,4,${a})` : `rgba(210,160,110,${a * 0.7})`;
    x.lineWidth = 0.6 + r() * 2.2;
    x.beginPath();
    x.moveTo(0, y);
    for (let px = 0; px <= 1024; px += 64) x.lineTo(px, y + Math.sin(px * 0.01 + i) * (2 + r() * 4));
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function softTexture(inner = "rgba(255,255,255,0.9)") {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------- camera: follows the scroll, leans with the cursor ---------- */
function CameraRig() {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  useFrame((s, dt) => {
    dt = Math.min(dt, 0.05);
    const m = world.mouse, t = s.clock.elapsedTime;
    const aspect = size.width / size.height;
    // lean less once we are reading the screen, so the form stays steady
    const lean = 1 - 0.85 * world.formT;
    pos.set(
      world.cam.x + m.x * 0.5 * lean + Math.sin(t * 0.4) * 0.04 * lean,
      world.cam.y - m.y * 0.28 * lean + Math.cos(t * 0.5) * 0.025 * lean,
      world.cam.z
    );
    look.set(world.look.x + m.x * 0.14 * lean, world.look.y - m.y * 0.09 * lean, world.look.z);
    // narrower landscape windows (tablets, small laptops): step back so the subject still fits
    if (!world.compact && aspect < 1.65) pos.sub(look).multiplyScalar(1 + (Math.min(1.65 / aspect, 1.45) - 1) * (1 - world.formT)).add(look);
    camera.position.copy(pos);
    camera.lookAt(look);
    camera.rotateZ(THREE.MathUtils.clamp(world.vel * -0.00001, -0.03, 0.03) * (1 - world.formT));
    const fov = (world.compact ? 44 : 40) + Math.min(Math.abs(world.vel) * 0.0025, 4) * (1 - world.formT);
    if (Math.abs(camera.fov - fov) > 0.02) {
      camera.fov = THREE.MathUtils.damp(camera.fov, fov, 4, dt);
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

/* ---------- lighting + reflections ---------- */
function Lights() {
  const { gl, scene } = useThree();
  const cursor = useRef();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => { scene.environment = null; env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  useFrame(() => {
    const m = world.mouse;
    cursor.current.position.set(m.x * 4.2 + world.look.x * 0.6, 1.5 - m.y * 1.5, 3.2);
  });
  return (
    <>
      <hemisphereLight args={["#8fa0ba", "#06080c", 0.35]} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} color="#dfe8f7" />
      <directionalLight position={[-4, 3, -4]} intensity={1.1} color="#9db6e0" />
      <pointLight ref={cursor} intensity={4} distance={7} decay={2} color="#cfdcf5" />
      {/* the desk lamp: warm pool of light */}
      <spotLight position={[-2.2, 1.02, 0.25]} angle={0.75} penumbra={1} intensity={30} distance={9} decay={2} color="#ffd9a6" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0006} />
      <pointLight position={[-0.2, 1.1, 1.7]} intensity={1.6} distance={4} color="#a9bfe6" />
    </>
  );
}

/* ---------- room: floor, wall, desk ---------- */
function Room() {
  const wood = useMemo(woodTexture, []);
  const wall = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(256, 110, 10, 256, 128, 300);
    g.addColorStop(0, "#222a35");
    g.addColorStop(1, "#0b0e13");
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 9000; i++) {
      x.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.05)";
      x.fillRect(Math.random() * 512, Math.random() * 256, 1.5, 1.5);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const glowTex = useMemo(() => softTexture(), []);
  const glow = useRef();
  useFrame(() => glow.current && glow.current.material.color.copy(world.accent));
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0d1015" metalness={0.3} roughness={0.55} />
      </mesh>
      <mesh position={[0, 2, -3.6]}>
        <planeGeometry args={[26, 11]} />
        <meshBasicMaterial map={wall} toneMapped={false} />
      </mesh>
      {/* soft bias light behind the display */}
      <sprite ref={glow} position={[0, 1.0, -1.15]} scale={[4.6, 2.3, 1]}>
        <spriteMaterial map={glowTex} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {/* a shelf with books */}
      <Shelf pos={[3.5, 2.05, -3.4]} />

      {/* desk */}
      <RBox args={[7.6, 0.07, 2.7, 0.02]} position={[0, -0.035, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial map={wood} roughness={0.5} clearcoat={0.25} clearcoatRoughness={0.4} />
      </RBox>
      {[-3.5, 3.5].map((x) => (
        <RBox key={x} args={[0.1, 2.4, 2.3, 0.02]} position={[x, FLOOR_Y / 2, 0]} castShadow>
          {graphite}
        </RBox>
      ))}
      {/* felt desk mat */}
      <RBox args={[2.8, 0.01, 0.98, 0.004]} position={[0.1, 0.005, 0.6]} receiveShadow>
        <meshStandardMaterial color="#1d2025" roughness={1} />
      </RBox>
    </group>
  );
}

function Shelf({ pos }) {
  const books = [
    [0.09, 0.42, 0.3, "#3a4658"], [0.07, 0.38, 0.28, "#6a5a48"], [0.1, 0.45, 0.3, "#2f3a34"], [0.06, 0.36, 0.26, "#8a8e96"],
    [0.09, 0.4, 0.3, "#4a3b3b"], [0.08, 0.43, 0.29, "#3d4d63"],
  ];
  let x = -0.8;
  return (
    <group position={pos}>
      <RBox args={[1.9, 0.05, 0.38, 0.012]} castShadow>
        <meshStandardMaterial color="#3b2c20" roughness={0.6} />
      </RBox>
      {books.map(([w, h, d, c], i) => {
        const px = x + w / 2;
        x += w + 0.012;
        return (
          <RBox key={i} args={[w, h, d, 0.006]} position={[px, 0.025 + h / 2, 0]} rotation-z={i === 3 ? 0 : 0} castShadow>
            <meshStandardMaterial color={c} roughness={0.75} />
          </RBox>
        );
      })}
      <mesh position={[0.62, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.055, 0.25, 32]} />
        <meshPhysicalMaterial color="#d9d5cd" roughness={0.35} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

/* ---------- display: brushed-aluminium, thin black bezel, slim stand ---------- */
const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
function Monitor({ w, h, pos, rot = [0, 0, 0], tex, glow = 0, formKey, formW }) {
  const cy = h / 2 + 0.5;
  const grp = useRef();
  const { camera, size } = useThree();
  // The contact form is a real HTML form pinned onto this screen: its four corners follow the
  // screen's four corners (a perspective transform), so it sits "on" the display and stays usable.
  useFrame(() => {
    const el = document.getElementById("screen-form");
    if (!el || !formKey) return;
    const active = (world.compact ? "term" : "main") === formKey;
    if (!active) return;
    const W = formW, H = Math.round((formW * h) / w);
    if (el.dataset.key !== formKey) {
      el.dataset.key = formKey;
      el.style.width = W + "px";
      el.style.height = H + "px";
    }
    const vis = world.formT;
    el.style.opacity = vis.toFixed(3);
    el.style.pointerEvents = vis > 0.85 ? "auto" : "none";
    el.style.visibility = vis < 0.01 ? "hidden" : "visible";
    if (vis < 0.01) return;
    grp.current.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    const hw = w / 2, hh = h / 2, z = 0.0266;
    [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]].forEach(([x, y], i) => {
      corners[i].set(x, y, z).applyMatrix4(grp.current.matrixWorld).project(camera);
    });
    const P = corners.map((c) => [((c.x + 1) / 2) * size.width, ((1 - c.y) / 2) * size.height]);
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = P;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den, hh2 = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh2 * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh2 * y3;
    el.style.transform = `matrix3d(${a / W},${d / W},0,${g / W},${b / H},${e / H},0,${hh2 / H},0,0,1,0,${x0},${y0},0,1)`;
  });
  return (
    <group ref={grp} position={[pos[0], cy, pos[2]]} rotation={rot}>
      {/* aluminium housing */}
      <RBox args={[w + 0.07, h + 0.07, 0.05, 0.016]} castShadow>{alu}</RBox>
      {/* black glass with a thin border, then the picture */}
      <mesh position={[0, 0, 0.0256]}>
        <planeGeometry args={[w + 0.04, h + 0.04]} />
        {blackGlass}
      </mesh>
      <mesh position={[0, 0, 0.0262]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* faint glass reflection over the panel */}
      <mesh position={[0, 0, 0.0268]}>
        <planeGeometry args={[w + 0.04, h + 0.04]} />
        <meshPhysicalMaterial transparent opacity={0.05} roughness={0.4} clearcoat={0.2} clearcoatRoughness={0.5} color="#fff" depthWrite={false} />
      </mesh>
      {/* stand: slim arm + low oval foot */}
      <RBox args={[0.13, cy + 0.036, 0.022, 0.009]} position={[0, (0.05 - cy + 0.014) / 2, -0.05]} castShadow>
        {alu}
      </RBox>
      <mesh position={[0, -cy + 0.007, 0.07]} scale={[1, 1, 0.52]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.014, 56]} />
        {alu}
      </mesh>
      {glow > 0 && <pointLight position={[0, 0, 0.9]} intensity={glow} distance={3.2} decay={2} color="#b9ccef" />}
    </group>
  );
}

function Laptop({ pos, rot }) {
  const tex = useScreen(640, 420, drawDash, 16);
  return (
    <group position={pos} rotation={rot}>
      <RBox args={[1.1, 0.024, 0.76, 0.012]} position={[0, 0.012, 0]} castShadow>{alu}</RBox>
      <RBox args={[0.9, 0.003, 0.3, 0.0015]} position={[0, 0.025, 0.12]}>
        <meshStandardMaterial color="#0c0d10" roughness={0.8} />
      </RBox>
      <RBox args={[0.34, 0.002, 0.2, 0.002]} position={[0, 0.026, 0.3]}>
        <meshStandardMaterial color="#b6b9bf" metalness={1} roughness={0.25} />
      </RBox>
      <group position={[0, 0.024, -0.37]} rotation-x={-0.3}>
        <RBox args={[1.1, 0.72, 0.014, 0.012]} position={[0, 0.36, 0]} castShadow>{alu}</RBox>
        <mesh position={[0, 0.36, 0.0076]}>
          <planeGeometry args={[1.06, 0.68]} />
          {blackGlass}
        </mesh>
        <mesh position={[0, 0.36, 0.0082]}>
          <planeGeometry args={[1.0, 0.63]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- slim keyboard, keys that actually press ---------- */
function Keyboard({ pos }) {
  const keys = useRef();
  const cols = 15, rows = 5, n = cols * rows;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const cx = i % cols, cz = Math.floor(i / cols);
      const dip = 0.0035 * Math.pow(Math.max(0, Math.sin(t * (1.1 + (i % 7) * 0.29) + i * 1.9)), 60);
      dummy.position.set((cx - (cols - 1) / 2) * 0.077, 0.032 - dip, (cz - (rows - 1) / 2) * 0.077);
      dummy.updateMatrix();
      keys.current.setMatrixAt(i, dummy.matrix);
    }
    keys.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={pos}>
      <RBox args={[1.24, 0.02, 0.45, 0.01]} position={[0, 0.01, 0]} castShadow>{alu}</RBox>
      <instancedMesh ref={keys} args={[rb(0.067, 0.014, 0.067, 0.007), null, n]} castShadow>
        <meshPhysicalMaterial color="#1b1c20" roughness={0.5} clearcoat={0.2} />
      </instancedMesh>
    </group>
  );
}

function Mouse({ pos }) {
  const g = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    g.current.position.set(pos[0] + Math.sin(t * 0.8) * 0.08 + world.mouse.x * 0.1, 0, pos[2] + Math.cos(t * 1.1) * 0.04 - world.mouse.y * 0.06);
    g.current.rotation.y = Math.sin(t * 0.8) * 0.15;
  });
  return (
    <group ref={g} position={pos}>
      <mesh position={[0, 0.026, 0]} scale={[0.55, 0.3, 0.92]} castShadow>
        <sphereGeometry args={[0.1, 32, 20]} />
        <meshPhysicalMaterial color="#c3c6cc" metalness={0.9} roughness={0.28} clearcoat={0.4} />
      </mesh>
    </group>
  );
}

/* ---------- premium over-ear headphones on a minimal stand ---------- */
function Headphones({ pos }) {
  const g = useRef();
  const geo = useMemo(
    () => ({
      band: tube(arc(0.31, 0.3, 0, Math.PI), 0.009),
      pad: tube(arc(0.31, 0.3, Math.PI * 0.2, Math.PI * 0.8, 40), 0.021, 48),
      yoke: tube(arc(0.15, 0.15, 0.05, Math.PI - 0.05, 36), 0.0085, 40),
      cup: lathe([[0, 0.054], [0.04, 0.0525], [0.08, 0.047], [0.108, 0.036], [0.12, 0.022], [0.125, 0.0], [0.121, -0.02], [0.112, -0.032], [0, -0.032]], 72),
    }),
    []
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    g.current.rotation.y = -0.42 + Math.sin(t * 0.45) * 0.07 + world.mouse.x * 0.35;
    g.current.rotation.x = world.mouse.y * 0.05;
  });
  return (
    <group position={[pos[0], 0, pos[2]]}>
      {/* stand */}
      <mesh position={[0, 0.011, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.14, 0.022, 56]} />
        {graphite}
      </mesh>
      <mesh position={[0, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.56, 20]} />
        {alu}
      </mesh>
      <RBox args={[0.11, 0.016, 0.07, 0.008]} position={[0, 0.582, 0]}>{rubber}</RBox>

      <group ref={g} position={[0, pos[1], 0]}>
        {/* headband: metal strap + padded leather */}
        <mesh geometry={geo.band} scale={[1, 1, 2.2]} castShadow>{graphite}</mesh>
        <mesh geometry={geo.pad} scale={[1, 1, 1.9]} castShadow>{leather}</mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.31, 0, 0]}>
            {/* slider */}
            <RBox args={[0.014, 0.05, 0.026, 0.005]} position={[0, -0.012, 0]}>{alu}</RBox>
            {/* ear cup assembly */}
            <group position={[side * 0.0, -0.15, 0]}>
              <mesh geometry={geo.yoke} rotation-y={Math.PI / 2} castShadow>{alu}</mesh>
              <group rotation-z={side * -Math.PI / 2}>
                <mesh geometry={geo.cup} castShadow>
                  <meshPhysicalMaterial color="#2c2f35" metalness={0.92} roughness={0.34} clearcoat={0.35} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.043, 0]} rotation-x={Math.PI / 2}>
                  <torusGeometry args={[0.093, 0.0032, 10, 72]} />
                  {alu}
                </mesh>
                <mesh position={[0, -0.056, 0]} rotation-x={Math.PI / 2} scale={[1, 1, 0.85]} castShadow>
                  <torusGeometry args={[0.092, 0.036, 20, 72]} />
                  {leather}
                </mesh>
                <mesh position={[0, -0.05, 0]} rotation-x={Math.PI / 2}>
                  <circleGeometry args={[0.078, 40]} />
                  <meshStandardMaterial color="#08090b" roughness={1} />
                </mesh>
              </group>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ---------- soft-drink cans: real can profile, printed labels, brushed aluminium, cold condensation ---------- */
const CAN_H = 0.3;
const rowOf = (y, H) => (1 - y / CAN_H) * H;
const CAN_PROFILE = (() => {
  const p = [
    [0, 0.0165], [0.02, 0.0150], [0.04, 0.0115], [0.054, 0.005], [0.062, 0.0018], [0.0695, 0.0], [0.0752, 0.0028], [0.0783, 0.011], [0.0796, 0.024], [0.08, 0.036],
  ];
  for (let i = 1; i <= 10; i++) p.push([0.08, 0.036 + ((0.258 - 0.036) * i) / 10]);
  p.push(
    [0.0793, 0.2655], [0.0765, 0.272], [0.0715, 0.2785], [0.0665, 0.2845], [0.0625, 0.289], [0.0612, 0.2915],
    [0.0608, 0.2945], [0.0598, 0.297], [0.0575, 0.2985], [0.0552, 0.297], [0.0545, 0.2945], [0.0548, 0.2915],
    [0.0538, 0.2895], [0.052, 0.2882], [0.0485, 0.2874], [0, 0.2874]
  );
  return p;
})();
let canGeo = null;
function getCanGeo() {
  if (canGeo) return canGeo;
  const g = lathe(CAN_PROFILE, 96);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, THREE.MathUtils.clamp(pos.getY(i) / CAN_H, 0, 1)); // v follows height
  canGeo = g;
  return g;
}

const BRANDS = {
  coke: {
    paint: ["#a40c18", "#e41e2b", "#b30f1d"],
    draw(x, W, H) {
      const top = rowOf(0.27, H), bot = rowOf(0.04, H);
      const mid = (top + bot) / 2;
      // white ribbon wave sweeping around the can
      x.fillStyle = "#fff";
      x.beginPath();
      x.moveTo(0, mid + 70);
      x.bezierCurveTo(W * 0.2, mid + 10, W * 0.35, mid + 150, W * 0.5, mid + 88);
      x.bezierCurveTo(W * 0.65, mid + 26, W * 0.8, mid + 150, W, mid + 70);
      x.lineTo(W, mid + 118);
      x.bezierCurveTo(W * 0.8, mid + 206, W * 0.65, mid + 80, W * 0.5, mid + 140);
      x.bezierCurveTo(W * 0.35, mid + 200, W * 0.2, mid + 64, 0, mid + 118);
      x.closePath();
      x.fill();
      x.shadowColor = "rgba(60,0,0,0.35)";
      x.shadowBlur = 10;
      x.shadowOffsetY = 3;
      x.fillStyle = "#fff";
      x.textAlign = "center";
      x.font = "104px Pacifico, 'Brush Script MT', cursive";
      x.fillText("Coca-Cola", W / 2, mid + 22);
      x.shadowColor = "transparent";
      x.font = "600 24px 'Space Grotesk', sans-serif";
      x.fillText("ORIGINAL TASTE", W / 2, bot - 70);
      x.font = "500 18px 'Space Grotesk', sans-serif";
      x.fillText("330 ml  ·  e", W / 2, bot - 40);
    },
  },
  pepsi: {
    paint: ["#07265f", "#0b3f98", "#082e72"],
    draw(x, W, H) {
      const top = rowOf(0.27, H), bot = rowOf(0.04, H);
      const mid = (top + bot) / 2;
      // globe: red over blue, split by a white wave
      const cx = W / 2 - 190, cy = mid, r = 92;
      x.save();
      x.beginPath();
      x.arc(cx, cy, r, 0, Math.PI * 2);
      x.clip();
      x.fillStyle = "#e32934";
      x.fillRect(cx - r, cy - r, r * 2, r);
      x.fillStyle = "#0a52b0";
      x.fillRect(cx - r, cy, r * 2, r);
      x.fillStyle = "#fff";
      x.beginPath();
      x.moveTo(cx - r, cy - 8);
      x.bezierCurveTo(cx - r * 0.3, cy - r * 0.55, cx + r * 0.1, cy + r * 0.45, cx + r, cy - 30);
      x.lineTo(cx + r, cy + 14);
      x.bezierCurveTo(cx + r * 0.1, cy + r * 0.85, cx - r * 0.3, cy - r * 0.15, cx - r, cy + 36);
      x.closePath();
      x.fill();
      x.restore();
      x.strokeStyle = "#fff";
      x.lineWidth = 6;
      x.beginPath();
      x.arc(cx, cy, r, 0, Math.PI * 2);
      x.stroke();
      x.shadowColor = "rgba(0,0,30,0.4)";
      x.shadowBlur = 10;
      x.fillStyle = "#fff";
      x.textAlign = "left";
      x.font = "700 128px 'Space Grotesk', sans-serif";
      x.fillText("PEPSI", cx + r + 36, cy + 44);
      x.shadowColor = "transparent";
      x.textAlign = "center";
      x.font = "600 24px 'Space Grotesk', sans-serif";
      x.fillText("BOLD  ·  REFRESHING", W / 2, bot - 70);
      x.font = "500 18px 'Space Grotesk', sans-serif";
      x.fillText("330 ml  ·  e", W / 2, bot - 40);
    },
  },
};

function paintCan(canvas, brand) {
  const W = canvas.width, H = canvas.height, x = canvas.getContext("2d");
  // bare aluminium everywhere first (base, rim, lid)
  const m = x.createLinearGradient(0, 0, W, 0);
  m.addColorStop(0, "#c4c8ce");
  m.addColorStop(0.5, "#e6e8ec");
  m.addColorStop(1, "#c4c8ce");
  x.fillStyle = m;
  x.fillRect(0, 0, W, H);
  // painted body + shoulder
  const b = BRANDS[brand];
  const top = rowOf(0.2895, H), bot = rowOf(0.03, H);
  const g = x.createLinearGradient(0, top, 0, bot);
  g.addColorStop(0, b.paint[0]);
  g.addColorStop(0.18, b.paint[1]);
  g.addColorStop(0.85, b.paint[2]);
  g.addColorStop(1, b.paint[0]);
  x.fillStyle = g;
  x.fillRect(0, top, W, bot - top);
  b.draw(x, W, H);
  // thin metallic bands at the shoulder and bottom edge
  x.fillStyle = "rgba(255,255,255,0.55)";
  x.fillRect(0, rowOf(0.2575, H), W, 3);
  x.fillRect(0, rowOf(0.0375, H), W, 3);
}

function dropletCanvas() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const x = c.getContext("2d");
  let seed = 5;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const y0 = rowOf(0.255, 1024), y1 = rowOf(0.04, 1024);
  for (let i = 0; i < 520; i++) {
    const px = r() * 1024, py = y0 + (y1 - y0) * Math.pow(r(), 0.8), rad = 1.4 + r() * r() * 6.5;
    x.fillStyle = "rgba(255,255,255,0.10)";
    x.beginPath();
    x.arc(px, py, rad, 0, 7);
    x.fill();
    x.strokeStyle = "rgba(0,0,0,0.30)";
    x.lineWidth = 1;
    x.beginPath();
    x.arc(px, py, rad, 0.2, Math.PI - 0.2);
    x.stroke();
    x.fillStyle = "rgba(255,255,255,0.85)";
    x.beginPath();
    x.arc(px - rad * 0.3, py - rad * 0.35, Math.max(0.6, rad * 0.28), 0, 7);
    x.fill();
  }
  return c;
}

function SodaCan({ pos, rot = 0, brand, scale = 1.15 }) {
  const label = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    paintCan(c, brand);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [brand]);
  const drops = useMemo(() => {
    const t = new THREE.CanvasTexture(dropletCanvas());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  useEffect(() => {
    let alive = true;
    Promise.all([document.fonts?.load("104px Pacifico"), document.fonts?.load("700 128px 'Space Grotesk'")]).then(() => {
      if (!alive) return;
      paintCan(label.image, brand);
      label.needsUpdate = true;
    });
    return () => { alive = false; };
  }, [label, brand]);
  const geo = getCanGeo();
  const silver = <meshStandardMaterial color="#d7dade" metalness={1} roughness={0.22} />;
  return (
    <group position={pos} rotation-y={rot + Math.PI} scale={scale}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial map={label} metalness={0.7} roughness={0.27} clearcoat={0.7} clearcoatRoughness={0.16} envMapIntensity={1.4} />
      </mesh>
      {/* cold condensation */}
      <mesh geometry={geo} scale={[1.004, 1, 1.004]}>
        <meshPhysicalMaterial map={drops} transparent depthWrite={false} roughness={0.05} clearcoat={1} clearcoatRoughness={0.03} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      {/* pull tab, rivet and opening */}
      <mesh position={[0.011, 0.2878, 0.016]} rotation-x={-Math.PI / 2} scale={[1, 1.55, 1]}>
        <circleGeometry args={[0.0165, 28]} />
        <meshStandardMaterial color="#2c2f34" metalness={1} roughness={0.45} />
      </mesh>
      <RBox args={[0.032, 0.0026, 0.05, 0.0013]} position={[-0.004, 0.2893, -0.004]} rotation-y={-0.1}>{silver}</RBox>
      <mesh position={[-0.004, 0.2909, 0.0]}>
        <cylinderGeometry args={[0.0042, 0.0042, 0.0014, 16]} />
        {silver}
      </mesh>
    </group>
  );
}

function Lamp({ pos }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.014, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.17, 0.028, 48]} />
        {graphite}
      </mesh>
      <mesh position={[-0.035, 0.37, 0]} rotation-z={0.2} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.72, 16]} />
        {graphite}
      </mesh>
      <mesh position={[0.197, 0.856, 0]} rotation-z={-1.1} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.6, 16]} />
        {graphite}
      </mesh>
      <mesh position={[0.46, 0.99, 0]} rotation-z={0.64} castShadow>
        <cylinderGeometry args={[0.04, 0.12, 0.2, 40, 1, true]} />
        <meshStandardMaterial color="#22252b" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.5, 0.93, 0]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshBasicMaterial color={[3, 2.4, 1.5]} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* the notebook page: ruled paper with a highlighted, handwritten word */
function pageCanvas(word) {
  const W = 512, H = 724;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#f3efe4";
  x.fillRect(0, 0, W, H);
  // faint paper grain + ruled lines + margin
  for (let i = 0; i < 2500; i++) {
    x.fillStyle = Math.random() > 0.5 ? "rgba(120,100,70,0.05)" : "rgba(255,255,255,0.18)";
    x.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4);
  }
  x.strokeStyle = "rgba(90,130,190,0.35)";
  x.lineWidth = 1.5;
  for (let y = 90; y < H - 20; y += 36) {
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(W, y);
    x.stroke();
  }
  x.strokeStyle = "rgba(210,80,80,0.45)";
  x.beginPath();
  x.moveTo(66, 0);
  x.lineTo(66, H);
  x.stroke();
  // the word, first measured so the highlighter can sit behind it
  const font = "700 124px Caveat, 'Segoe Script', 'Brush Script MT', cursive";
  x.font = font;
  const tw = x.measureText(word).width;
  const tx = (W - tw) / 2 + 14, ty = 232;
  // yellow highlighter swipe (slightly uneven, like a real marker)
  x.save();
  x.globalCompositeOperation = "multiply";
  x.fillStyle = "rgba(255, 226, 64, 0.95)";
  x.beginPath();
  x.moveTo(tx - 16, ty - 78);
  x.lineTo(tx + tw + 22, ty - 90);
  x.lineTo(tx + tw + 14, ty + 30);
  x.lineTo(tx - 22, ty + 38);
  x.closePath();
  x.fill();
  x.fillStyle = "rgba(255, 214, 40, 0.5)";
  x.fillRect(tx - 18, ty - 48, tw + 40, 26);
  x.restore();
  // pen ink
  x.font = font;
  x.fillStyle = "#1b2a5c";
  x.save();
  x.translate(tx, ty);
  x.rotate(-0.025);
  x.fillText(word, 0, 0);
  x.restore();
  // little underline flourish
  x.strokeStyle = "#1b2a5c";
  x.lineWidth = 4;
  x.lineCap = "round";
  x.beginPath();
  x.moveTo(tx + 10, ty + 56);
  x.quadraticCurveTo(tx + tw * 0.5, ty + 70, tx + tw - 10, ty + 52);
  x.stroke();
  return c;
}

function Notebook({ pos }) {
  const page = useMemo(() => {
    const c = pageCanvas("Divicious");
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { c, t };
  }, []);
  // redraw once the handwriting font has loaded
  useEffect(() => {
    let alive = true;
    document.fonts?.load("700 124px Caveat").then(() => {
      if (!alive) return;
      const n = pageCanvas("Divicious");
      page.c.getContext("2d").drawImage(n, 0, 0);
      page.t.needsUpdate = true;
    });
    return () => { alive = false; };
  }, [page]);
  return (
    <group position={pos} rotation-y={0.25} scale={1.3}>
      <RBox args={[0.34, 0.03, 0.46, 0.012]} position={[0, 0.015, 0]} castShadow>
        <meshPhysicalMaterial color="#1b1d22" roughness={0.6} sheen={1} sheenColor="#444" />
      </RBox>
      <RBox args={[0.3, 0.012, 0.42, 0.004]} position={[0.008, 0.032, 0]}>
        <meshStandardMaterial color="#e9e6df" roughness={0.9} />
      </RBox>
      <mesh position={[0.008, 0.0386, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.294, 0.416]} />
        <meshStandardMaterial map={page.t} color="#cfcabd" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.05, 0.05]} rotation={[0, 0.9, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.28, 16]} />
        {graphite}
      </mesh>
    </group>
  );
}

/* a stack of hardcover books with a brass paperweight */
function BookStack({ pos }) {
  const books = [
    { w: 0.34, d: 0.25, h: 0.05, c: "#2c3a4e", r: 0.05 },
    { w: 0.3, d: 0.22, h: 0.04, c: "#4a3a30", r: -0.12 },
    { w: 0.27, d: 0.2, h: 0.038, c: "#2e3b34", r: 0.18 },
  ];
  let y = 0;
  return (
    <group position={pos}>
      {books.map((b, i) => {
        const cy = y + b.h / 2;
        y += b.h;
        return (
          <group key={i} position={[0, cy, 0]} rotation-y={b.r}>
            <RBox args={[b.w, b.h, b.d, 0.004]} castShadow>
              <meshStandardMaterial color={b.c} roughness={0.7} />
            </RBox>
            <mesh position={[0.004, 0, b.d / 2 - 0.0035]}>
              <boxGeometry args={[b.w - 0.012, b.h - 0.008, 0.008]} />
              <meshStandardMaterial color="#e8e4da" roughness={0.9} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0.02, y + 0.034, 0]} castShadow>
        <sphereGeometry args={[0.034, 40, 28]} />
        <meshStandardMaterial color="#b89a5a" metalness={1} roughness={0.22} />
      </mesh>
    </group>
  );
}

/* a soft contact shadow so objects sit on the desk instead of floating */
const blobTex = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 6, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.55, "rgba(0,0,0,0.28)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
function Blob({ pos, size, rot = 0, y = 0.0025, opacity = 0.7 }) {
  return (
    <mesh position={[pos[0], y, pos[2]]} rotation={[-Math.PI / 2, 0, rot]} renderOrder={1}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={blobTex} transparent opacity={opacity} depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/* ---------- framed photograph: walnut frame, brass liner, cream mat, glass ---------- */
function PhotoFrame({ pos, rot = 0, w, h, border, photo, src, lean = 0.2 }) {
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const geo = useMemo(() => {
    const ring = (ow, oh, iw, ih, depth, bevel) => {
      const sh = new THREE.Shape();
      sh.moveTo(-ow / 2, -oh / 2); sh.lineTo(ow / 2, -oh / 2); sh.lineTo(ow / 2, oh / 2); sh.lineTo(-ow / 2, oh / 2); sh.closePath();
      const hole = new THREE.Path();
      hole.moveTo(-iw / 2, -ih / 2); hole.lineTo(-iw / 2, ih / 2); hole.lineTo(iw / 2, ih / 2); hole.lineTo(iw / 2, -ih / 2); hole.closePath();
      sh.holes.push(hole);
      const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3 });
      g.translate(0, 0, -depth / 2);
      return g;
    };
    return {
      frame: ring(w, h, w - border * 2, h - border * 2, 0.026, 0.0045),
      liner: ring(w - border * 2 + 0.006, h - border * 2 + 0.006, w - border * 2 - 0.006, h - border * 2 - 0.006, 0.016, 0.0012),
    };
  }, [w, h, border]);
  const inW = w - border * 2, inH = h - border * 2;
  return (
    <group position={[pos[0], 0, pos[2]]} rotation-y={rot}>
      <group rotation-x={-lean}>
        <group position={[0, h / 2 + 0.002, 0]}>
          <mesh geometry={geo.frame} castShadow receiveShadow>
            <meshPhysicalMaterial color="#3a281b" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.25} />
          </mesh>
          <mesh geometry={geo.liner} position={[0, 0, 0.004]}>
            <meshStandardMaterial color="#b89a5a" metalness={1} roughness={0.28} />
          </mesh>
          {/* mat board + photograph */}
          <mesh position={[0, 0, -0.006]}>
            <planeGeometry args={[inW, inH]} />
            <meshStandardMaterial color="#ece7dc" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0, -0.0055]}>
            <planeGeometry args={photo} />
            <meshBasicMaterial map={tex} color={[1.18, 1.18, 1.18]} toneMapped={false} />
          </mesh>
          {/* backing + easel leg */}
          <RBox args={[w - 0.01, h - 0.01, 0.006, 0.002]} position={[0, 0, -0.016]}>
            <meshStandardMaterial color="#1a1512" roughness={0.9} />
          </RBox>
          <RBox args={[0.035, h * 0.7, 0.01, 0.003]} position={[0, -h * 0.1, -0.058]} rotation-x={0.2} castShadow>
            <meshStandardMaterial color="#2b1e15" roughness={0.6} />
          </RBox>
        </group>
      </group>
    </group>
  );
}

/* ---------- the whole set ---------- */
export default function Desk() {
  const main = useScreen(1100, 470, drawMain, 20);
  const term = useScreen(512, 800, drawTerm, 14);
  return (
    <>
      <color attach="background" args={["#0a0d12"]} />
      <fog attach="fog" args={["#0a0d12", 10, 24]} />
      <CameraRig />
      <Lights />
      <Room />
      <Monitor w={2.2} h={0.95} pos={[0, 0, -0.55]} tex={main} glow={4} formKey="main" formW={1100} />
      <Monitor w={0.9} h={1.4} pos={[-1.95, 0, -0.35]} rot={[0, 0.5, 0]} tex={term} glow={2} formKey="term" formW={450} />
      <Laptop pos={[2.5, 0, 0.25]} rot={[0, -0.5, 0]} />
      <Keyboard pos={[0, 0.01, 0.62]} />
      <Mouse pos={[0.95, 0.01, 0.66]} />
      <Headphones pos={[-1.15, 0.32, 0.5]} />
      <SodaCan brand="coke" pos={[1.45, 0, 0.3]} rot={0.12} />
      <SodaCan brand="pepsi" pos={[1.72, 0, 0.56]} rot={-0.12} />
      <Lamp pos={[-2.65, 0, 0.25]} />
      <Notebook pos={[-0.95, 0, 1.0]} />
      <BookStack pos={[3.1, 0, -0.5]} />
      {/* your two photographs */}
      <PhotoFrame pos={[-0.55, 0, 0.3]} rot={0.3} w={0.36} h={0.46} border={0.036} photo={[0.23, 0.2875]} src="/photo-portrait.jpg" />
      <PhotoFrame pos={[1.22, 0, -0.18]} rot={-0.32} w={0.4} h={0.52} border={0.036} photo={[0.26, 0.3467]} src="/photo-beach.jpg" />
      {/* soft contact shadows */}
      <Blob pos={[0.1, 0, 0.62]} size={[1.6, 0.75]} y={0.0125} opacity={0.6} />
      <Blob pos={[-1.15, 0, 0.5]} size={[0.6, 0.6]} />
      <Blob pos={[1.45, 0, 0.3]} size={[0.4, 0.4]} />
      <Blob pos={[1.72, 0, 0.56]} size={[0.4, 0.4]} />
      <Blob pos={[-0.55, 0, 0.3]} size={[0.5, 0.3]} rot={0.3} />
      <Blob pos={[1.22, 0, -0.18]} size={[0.6, 0.32]} rot={-0.32} />
      <Blob pos={[-0.95, 0, 1.0]} size={[0.7, 0.8]} y={0.0125} rot={0.25} />
      <Blob pos={[0, 0, -0.45]} size={[1.0, 0.7]} />
      <Blob pos={[-1.95, 0, -0.28]} size={[0.9, 0.55]} rot={0.5} />
      <Blob pos={[2.5, 0, 0.25]} size={[1.5, 1.1]} rot={-0.5} />
      <Blob pos={[3.1, 0, -0.5]} size={[0.6, 0.5]} />
    </>
  );
}
