"use client";

import {
  KeyboardControls,
  OrbitControls,
  OrthographicCamera
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo, useRef } from "react";
import { ReinhardToneMapping } from "three";
import Lights from "./basket-court/lights";
import HolographicV4 from "./shaders/HolographicV4";

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

            <HolographicV4 position={[0,0,0]} camera={cameraRef} />

            {/* <CircleClickOffset /> */}
          </Physics>

          {/* <Environment preset="studio" /> */}
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
