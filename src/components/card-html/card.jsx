import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Card() {
  const groupRef = useRef();

  const ANGLE = 2;
  const SPEED = 1;

  var loader = new THREE.TextureLoader();
  loader.crossOrigin = "";
  var texture = loader.load("http://localhost:3000/html");

  useFrame((state) => {
    // const time = state.clock.getElapsedTime();
    // if (groupRef.current) {
    //   groupRef.current.position.x = Math.cos(time * SPEED) * ANGLE;
    //   groupRef.current.position.y = Math.sin(time * SPEED) * ANGLE;
    // }
  });

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <ambientLight intensity={2} />
        <directionalLight position={[0, 0, 2]} intensity={10} color={"blue"} />
        <directionalLight
          position={[0.5, 0, 5]}
          intensity={1}
          color={"yellow"}
        />
        <directionalLight
          position={[0.25, 0, 2]}
          intensity={1}
          color={"green"}
        />
      </mesh>

      <mesh position={[0, 0, 0.017]}>
        <boxGeometry args={[3, 5, 1]} />
        <meshPhysicalMaterial
          side={2}
          opacity={1} // Degree of influence of lighting on the HTML
          transparent
          roughness={0.5} // Degree of roughness of the surfac
          transmission={1}
          ior={1.8}
          iridescence={0.2}
          thickness={0.5}
        />
      </mesh>

      <Html
        occlude
        position={[0, 0, 0.01]}
        transform
        geometry={<planeGeometry args={[2, 4, 1]} />}
        scale={0.5}
      >
        <div className="scale-[1]">
          <div className="w-[120px] h-[200px] flex items-center justify-center overflow-auto flex-col">
            <div className="bg-gray-500 flex w-full h-full">
              <a className="annotation flex text-6xl" href="https://google.com">
                OPA
              </a>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
