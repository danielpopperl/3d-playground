"use client";

import {
  Environment,
  KeyboardControls,
  OrbitControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo, useRef } from "react";
import SnowballFight from "./snowball-fight/SnowballFight";

export default function Scene() {
  const camRef = useRef();

  const controls = {
    forward: "forward",
    backward: "backward",
    left: "left",
    right: "right",
    jump: "jump",
  };

  const mapControls = useMemo(
    () => [
      { name: controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: controls.backward, keys: ["ArrowDown", "KeyS"] },
      { name: controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: controls.right, keys: ["ArrowUp", "KeyD"] },
      { name: controls.jump, keys: ["Space"] },
    ],
    []
  );

  return (
    <KeyboardControls map={mapControls}>
      <Canvas>
        <Suspense fallback={null}>
          <OrbitControls ref={camRef} />

          <Physics debug>
            <SnowballFight />
          </Physics>

          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
