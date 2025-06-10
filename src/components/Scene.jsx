"use client";

import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo } from "react";
import { Court } from "./basket-court/court";
import Lights from "./basket-court/lights";
import Player from "./basket-court/player";

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
        camera={[10, 0, 0]}
        gl={{
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("tabIndex", "0"); // required for focus
          gl.domElement.focus();

          // Handle WebGL context loss
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            console.warn("WebGL context lost:", event);
            event.preventDefault();
          });

          gl.domElement.addEventListener("webglcontextrestored", () => {
            console.log("WebGL context restored");
          });
        }}
      >
        <Suspense fallback={null}>
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

            <Court position={[0, 0, 0]} />

            <Player />

            <mesh scale={10} position={[0, 10, 0]}>
              <torusGeometry args={[0.7, 2, 1.6, 16]} />
              <meshBasicMaterial side={2} color="red" />
            </mesh>
          </Physics>

          {/* <Environment preset="studio" /> */}
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
