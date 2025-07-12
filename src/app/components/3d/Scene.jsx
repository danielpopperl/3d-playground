"use client";

import {
  Environment,
  KeyboardControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo, useRef } from "react";
import Lights from "./basket-court/lights";
import { ReinhardToneMapping } from "three";
import Holographic from "./shaders/Holographic";
import HolographicV2 from "./shaders/HolographicV2";
import SpiralHolo from "./shaders/SpiralHolo";

export default function Scene() {
  const cameraRef = useRef();

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
          gl.toneMapping = ReinhardToneMapping; // Set tone mapping
          gl.toneMappingExposure = 1; // Set exposure
        }}
      >
        <Suspense fallback={null}>
          <OrthographicCamera aspect={window.innerHeight / window.innerWidth} fov={75} position={[0, 0, 0]} />

          <OrbitControls
          ref={cameraRef}
            // target={[0, 5, 0]}
            enablePan={true}
            enableZoom={true}
            // maxPolarAngle={Math.PI / 2}
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

            <SpiralHolo position={[0,0,0]} camera={cameraRef} />

            {/* <CircleClickOffset /> */}
          </Physics>

          {/* <Environment preset="studio" /> */}
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
