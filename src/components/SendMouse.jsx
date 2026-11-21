import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// A little 3D computer mouse that lives at the Send button: it glides in, scrolls, clicks the button and slides away, on a loop.
const W = 120, H = 140;
const BASE_ROLL = 0.45; // tip points up-left, like a pointer
const HOT = [45, 46]; // where the front tip of the mouse sits inside the canvas = the real click point
const TILT = 1.3;

const ms = { t: 0 };

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 1.15;
    return () => { scene.environment = null; env.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
}

/* ---- an ergonomic mouse body, lofted from cross-sections (not an ellipsoid) ---- */
const LEN = 1.7, ZF = -0.85; // front is -z, back is +z
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const halfW = (s) => 0.2 + 0.26 * sm(0, 0.55, s) - 0.05 * sm(0.7, 1, s); // narrow at the front, widest behind the buttons
const heightOf = (s) => 0.11 + 0.25 * sm(0, 0.7, s) - 0.12 * sm(0.78, 1, s); // low buttons, high palm hump
const ends = (s) => Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(2 * s - 1), 6))); // rounded nose and tail
const N = 2.6; // squarish shoulders

function loft({ s0, s1, half, flip = false, hs = 1, gapx = 0.05, slices = 28, around = 36 }) {
  const pos = [], idx = [];
  const rowLen = around + 1;
  for (let i = 0; i <= slices; i++) {
    const s = s0 + ((s1 - s0) * i) / slices;
    const e = ends(s);
    const w = halfW(s) * e, h = heightOf(s) * e * hs * (flip ? -1 : 1);
    let a = 0, b = Math.PI;
    if (half) {
      const phi0 = Math.acos(Math.pow(Math.min(1, gapx / Math.max(w, 1e-4)), N / 2)); // where x equals the slot edge
      if (half === "R") { a = 0; b = phi0; } else { a = Math.PI - phi0; b = Math.PI; }
    }
    for (let j = 0; j <= around; j++) {
      const phi = a + ((b - a) * j) / around;
      const c = Math.cos(phi), sn = Math.sin(phi);
      pos.push(w * Math.sign(c) * Math.pow(Math.abs(c), 2 / N), h * Math.pow(Math.abs(sn), 2 / N), ZF + s * LEN);
    }
  }
  for (let i = 0; i < slices; i++)
    for (let j = 0; j < around; j++) {
      const p = i * rowLen + j;
      idx.push(p, p + rowLen, p + 1, p + 1, p + rowLen, p + rowLen + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const S_HINGE = 0.4; // buttons end here
const Z_HINGE = ZF + S_HINGE * LEN;
const WHEEL_Z = ZF + 0.25 * LEN;

function MouseModel({ rig }) {
  const root = useRef(), tilt = useRef(), left = useRef(), right = useRef(), wheel = useRef(), halo = useRef(), glowMat = useRef();
  const st = useRef({ press: [0, 0], scale: 1, pitch: 0, roll: 0, wheelA: 0 });
  const geo = useMemo(
    () => ({
      left: loft({ s0: 0, s1: S_HINGE - 0.006, half: "L" }),
      right: loft({ s0: 0, s1: S_HINGE - 0.006, half: "R" }),
      palm: loft({ s0: S_HINGE + 0.006, s1: 1 }),
      base: loft({ s0: 0, s1: 1, flip: true, hs: 0.2 }),
      core: loft({ s0: 0, s1: 1 }),
    }),
    []
  );
  const haloTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05);
    ms.t += dt;
    const T = 3.6, ph = ms.t % T;
    const ease = (x) => x * x * (3 - 2 * x);
    let k = 0, press = 0; // k: 1 = far away, 0 = on the button
    if (ph < 1.3) k = 1 - ease(ph / 1.3);
    else if (ph < 1.55) press = 1;
    else if (ph < 1.9) press = 1 - ease((ph - 1.55) / 0.35);
    else if (ph < 3.0) k = ease((ph - 1.9) / 1.1);
    else k = 1;
    const alpha = ph < 3.1 ? Math.max(0, Math.min(1, ph / 0.4, (3.1 - ph) / 0.5)) : 0;
    const s = st.current;
    s.wheelA += dt * (ph < 1.2 || (ph > 1.9 && ph < 2.8) ? 7 : 0.4);
    ms.glow = press;

    const el = rig.current;
    el.style.transform = `translate3d(${(70 * k).toFixed(1)}px, ${(58 * k).toFixed(1)}px, 0)`;
    el.style.opacity = alpha.toFixed(2);
    const btn = document.getElementById("sf-send");
    if (btn) btn.classList.toggle("pressed", press > 0.5);

    root.current.scale.setScalar(1 - 0.07 * press);
    root.current.rotation.z = BASE_ROLL + 0.12 * k;
    tilt.current.rotation.x = TILT + 0.08 * k + Math.sin(ms.t * 1.6) * 0.012;
    left.current.rotation.x = -0.05 * press;
    right.current.rotation.x = 0;
    wheel.current.rotation.x = s.wheelA;
    halo.current.visible = false;
    halo.current.scale.setScalar(2.2 + press * 0.5);
    glowMat.current.opacity = 0.3 + press * 0.7;
  });

  const pearl = <meshPhysicalMaterial color="#e6e8ed" metalness={0.15} roughness={0.3} clearcoat={1} clearcoatRoughness={0.1} side={THREE.DoubleSide} />;
  const graphite = <meshPhysicalMaterial color="#1b1e24" metalness={0.45} roughness={0.28} clearcoat={1} clearcoatRoughness={0.08} side={THREE.DoubleSide} />;
  const rubber = <meshStandardMaterial color="#14161a" roughness={0.9} />;
  const alu = <meshStandardMaterial color="#cfd3d9" metalness={1} roughness={0.25} side={THREE.DoubleSide} />;
  return (
    <group ref={root}>
      <sprite ref={halo} position={[0, 0, -1.2]} scale={[2.2, 2.2, 1]}>
        <spriteMaterial map={haloTex} color="#9db8e8" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group ref={tilt} rotation-x={TILT}>
        <mesh geometry={geo.core} scale={0.93}><meshBasicMaterial color="#040506" /></mesh>
        <mesh geometry={geo.base}>{alu}</mesh>
        <mesh geometry={geo.palm}>{pearl}</mesh>
        {/* left / right buttons (graphite), each hinged at its back edge */}
        <group ref={left} position={[0, 0, Z_HINGE]}>
          <mesh geometry={geo.left} position={[0, 0, -Z_HINGE]}>{graphite}</mesh>
        </group>
        <group ref={right} position={[0, 0, Z_HINGE]}>
          <mesh geometry={geo.right} position={[0, 0, -Z_HINGE]}>{graphite}</mesh>
        </group>
        {/* scroll wheel in its slot between the buttons */}
        <mesh position={[0, 0.115, WHEEL_Z]}>
          <boxGeometry args={[0.1, 0.13, 0.2]} />
          <meshBasicMaterial color="#020203" />
        </mesh>
        <group ref={wheel} position={[0, 0.195, WHEEL_Z]}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.078, 0.078, 0.052, 28]} />
            <meshStandardMaterial color="#111317" roughness={0.75} />
          </mesh>
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <mesh key={i} position={[0, Math.sin(a) * 0.08, Math.cos(a) * 0.08]} rotation-x={-a}>
                <boxGeometry args={[0.054, 0.008, 0.016]} />
                {alu}
              </mesh>
            );
          })}
        </group>
        {/* rubber thumb grip + two side buttons on the left flank */}
        <mesh position={[-0.405, 0.14, 0.12]} scale={[0.05, 0.1, 0.3]}>
          <sphereGeometry args={[1, 24, 18]} />
          {rubber}
        </mesh>
        {[-0.34, -0.21].map((z) => (
          <mesh key={z} position={[-0.385, 0.16, z]} rotation-z={0.15}>
            <boxGeometry args={[0.03, 0.04, 0.11]} />
            {graphite}
          </mesh>
        ))}
        {/* soft light under the mouse */}
        <mesh position={[0, -0.05, 0.05]} rotation-x={Math.PI / 2} scale={[0.36, 0.78, 1]}>
          <circleGeometry args={[1, 48]} />
          <meshBasicMaterial ref={glowMat} color="#9db8e8" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function SendMouse() {
  const rig = useRef();
  const [show, setShow] = useState(false);
  // only create the 3D view once the form has appeared on the monitor
  useEffect(() => {
    const id = setInterval(() => {
      const f = document.getElementById("screen-form");
      setShow(!!f && parseFloat(f.style.opacity || "0") > 0.5);
    }, 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div ref={rig} className="send-mouse" style={{ width: W, height: H, opacity: 0 }} aria-hidden="true">
      {show && (
        <Canvas
          orthographic
          camera={{ zoom: 42, position: [0, 0, 10], near: 0.1, far: 50 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={{ width: W, height: H, background: "transparent" }}
        >
          <Env />
          <hemisphereLight args={["#ffffff", "#667", 0.7]} />
          <directionalLight position={[2, 3, 5]} intensity={1.6} />
          <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#9db8e8" />
          <MouseModel rig={rig} />
        </Canvas>
      )}
    </div>
  );
}
