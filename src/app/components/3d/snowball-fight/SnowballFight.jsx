import {
  Box,
  PerspectiveCamera,
  Sphere,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { quat, RigidBody, vec3 } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";

export default function SnowballFight() {
  const playerRef = useRef();
  const playerPosRef = useRef();
  const cameraRef = useRef(new THREE.Vector3());
  const cameraLookAt = useRef(new THREE.Vector3());

  let position = new THREE.Vector3();
  let rotation = new THREE.Quaternion();
  let abc = new THREE.Vector3();

  const [_, get] = useKeyboardControls();

  useFrame(({ camera }) => {
    if (playerRef.current) {
      if (get().forward) {
        playerRef.current.applyImpulse({ x: 0, y: 0, z: -1 }, true);
      } else if (get().backward) {
        playerRef.current.applyImpulse({ x: 0, y: 0, z: 1 }, true);
      } else if (get().left) {
        playerRef.current.applyImpulse({ x: -1, y: 0, z: 0 }, true);
      } else if (get().right) {
        playerRef.current.applyImpulse({ x: 1, y: 0, z: 0 }, true);
      } else if (get().jump) {
        playerRef.current.applyImpulse({ x: 0, y: 1, z: 0 }, true);
      }

      position = vec3(playerRef.current.translation());
      rotation = quat(playerRef.current.rotation());
      abc = position.applyQuaternion(rotation);

      console.log(abc.x);

      camera.position.copy(abc);
      camera.lookAt(abc.x, abc.y, abc.z);
    }
  });

  return (
    <group>
      <PerspectiveCamera aspect={1920 / 1080} fov={60} position={[0, 5, 0]} />

      <group name="base" rotation={[-Math.PI * 0.5, 0, 0]}>
        <RigidBody type="fixed">
          <Box args={[50, 50, 1]}>
            <meshStandardMaterial side={2} color="red" />
          </Box>
        </RigidBody>
      </group>

      <RigidBody
        ref={playerRef}
        type="dynamic"
        colliders="ball"
        lockRotations
        friction={1}
      >
        <group name="player" position={[0, 1, 0]}>
          <Sphere args={[1]}>
            <meshBasicMaterial color="green" />
          </Sphere>
        </group>
      </RigidBody>
    </group>
  );
}
