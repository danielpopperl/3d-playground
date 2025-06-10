import { KeyboardControls, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Perf } from "r3f-perf";
import { Suspense, useMemo } from "react";
import { Court } from "../components/basket-court/court";
import Lights from "../components/basket-court/lights";
import Player from "../components/basket-court/player";

export default function Experience() {
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
        camera={{ position: [10, 0, 0] }}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("tabIndex", "0");
          gl.domElement.focus();
        }}
      >
        <Suspense fallback={null}>
          <Perf position="top-left" />

          <OrbitControls target={[0, 5, 0]} maxPolarAngle={Math.PI / 2} />

          <Lights />

          <Physics timeStep="vary" gravity={[0, -45, 0]} debug>
            <Court position={[0, 0, 0]} />
            <Player />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
