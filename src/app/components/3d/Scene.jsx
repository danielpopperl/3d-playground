"use client";

import { Environment, KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo } from "react";
import Ground from "./snowball-fight/Ground";
import SnowballFight from "./snowball-fight/SnowballFight";

export default function Scene() {
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
      <Canvas
        camera={[0, 5, 0]}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("tabIndex", "0"); // required for focus
          gl.domElement.focus();
        }}
      >
        <Suspense fallback={null}>
          {/* <OrbitControls ref={camRef} /> */}

          <Physics timeStep={"vary"} gravity={[0, -30, 0]} debug>
            <Ground />

            <SnowballFight />
          </Physics>

          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
