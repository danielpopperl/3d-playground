"use client";

import {
  KeyboardControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo } from "react";
import { Court } from "./basket-court/court";
import Lights from "./basket-court/lights";
import Player from "./basket-court/player";
import { Cube } from "./resin-box/Cube";
import CircleClickOffset from "./circle-click-offset/CircleClickOffset";

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
        camera={[0,0,0]}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("tabIndex", "0"); // required for focus
          gl.domElement.focus();
        }}
      >
        <Suspense fallback={null}>
          <OrthographicCamera aspect={window.innerHeight / window.innerWidth} fov={75} position={[0, 0, 0]} />
          <OrbitControls
            target={[0, 5, 0]}
            // enablePan={false}
            // enableZoom={false}
            maxPolarAngle={Math.PI / 2}
          />

          <Lights />

          <Physics
            timeStep={"vary"}
            gravity={[0, -45, 0]}
            maxStabilizationIterations={10} // Increase for better stability
            maxVelocityIterations={10} // Increase for better velocity resolution
            debug
          >
            {/* <Ground /> */}
            {/* <SnowballFight /> */}

            {/* <Court position={[0, 0, 0]} />
            <Player /> */}

            <CircleClickOffset />
          </Physics>

          {/* <Environment preset="studio" /> */}
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
