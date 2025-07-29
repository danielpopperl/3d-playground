"use client";

import { useMemo, useRef } from "react";
import CardEmbra from "./card-embra/CardEmbra";

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
    <CardEmbra position={[0, -0.6, 4]} />

    // <KeyboardControls map={mapControls}>
    //   <Canvas
    //     camera={[0, 0, 0]}
    //     onCreated={({ gl }) => {
    //       gl.domElement.setAttribute("tabIndex", "0"); // required for focus
    //       gl.domElement.focus();
    //       gl.toneMapping = ReinhardToneMapping; // Set tone mapping
    //       gl.toneMappingExposure = 1; // Set exposure
    //     }}
    //   >
    //     <Suspense fallback={null}>
    //       <OrthographicCamera
    //         aspect={window.innerHeight / window.innerWidth}
    //         fov={75}
    //         position={[0, 0, 0]}
    //       />

    //       <OrbitControls
    //         ref={cameraRef}
    //         target={[0, 0, 4]}
    //         enablePan={false}
    //         enableZoom={true}
    //         enableRotate
    //         // maxPolarAngle={Math.PI / 2}
    //       />

    //       <Lights />

    //       <Physics
    //         timeStep={"vary"}
    //         gravity={[0, -45, 0]}
    //         maxStabilizationIterations={10} // Increase for better stability
    //         maxVelocityIterations={10} // Increase for better velocity resolution
    //         debug
    //       >
    //         {/* <Ground /> */}
    //         {/* <SnowballFight /> */}

    //         {/* <Court position={[0, 0, 0]} />
    //         <Player /> */}

    //         <CardEmbra position={[0, -0.6, 4]} camera={cameraRef} />

    //         {/* <mesh position={[0, 0, -3]} scale={2}>
    //           <planeGeometry args={[2, 3]} />
    //           <shaderMaterial
    //             vertexShader={vertex}
    //             fragmentShader={fragment}
    //             side={2}
    //             toneMapped={false}
    //           />
    //         </mesh> */}

    //         {/* <CircleClickOffset /> */}
    //       </Physics>

    //       {/* <Environment preset="studio" /> */}
    //     </Suspense>
    //   </Canvas>
    // </KeyboardControls>
  );
}
