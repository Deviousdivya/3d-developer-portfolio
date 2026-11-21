import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import Desk from "./Desk";
import { world, sampleScroll, blendWorld, KEYFRAMES } from "./keyframes";

// Runs first every frame: reads the scroll position, moves the camera target, tints the UI.
function Director() {
  let lastY = 0;
  useFrame((_, dt) => {
    dt = Math.min(dt, 0.05);
    const y = window.scrollY;
    world.vel += (((y - lastY) / Math.max(dt, 0.001)) - world.vel) * Math.min(1, dt * 6);
    lastY = y;
    if (!sampleScroll()) return;
    blendWorld(dt);
    document.documentElement.style.setProperty("--accent", "#" + world.accent.getHexString());

    const hud = document.getElementById("hud-alt");
    if (hud) hud.textContent = `0${world.index + 1} / 0${KEYFRAMES.length}`;
    const lbl = document.getElementById("hud-label");
    if (lbl) lbl.textContent = `~/${KEYFRAMES[world.index].id} — ${KEYFRAMES[world.index].label}`;
  });
  return null;
}

const COMPACT = typeof window !== "undefined" && window.innerWidth <= 860;

export default function Scene() {
  useEffect(() => {
    const onMove = (e) => {
      world.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      world.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        shadows
        flat
        camera={{ position: [-0.2, 1.35, 5.4], fov: 42, near: 0.1, far: 120 }}
        dpr={COMPACT ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Director />
        <Suspense fallback={null}>
          <Desk />
          <EffectComposer multisampling={COMPACT ? 0 : 4}>
            <Bloom intensity={0.4} luminanceThreshold={0.92} luminanceSmoothing={0.25} mipmapBlur />
            <Vignette offset={0.28} darkness={0.5} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
