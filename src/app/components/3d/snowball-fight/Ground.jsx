import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { BoxGeometry } from "three";

export default function Ground() {
  const boxGeometry = new BoxGeometry(1, 1, 1);

  return (
    // GROUND
    <group name="base" receiveShadow>
      <RigidBody
        type="fixed"
        colliders={false}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <CuboidCollider args={[25, 25, 0.5]} friction={1} />

        <mesh geometry={boxGeometry} scale={[50, 50, 1]}>
          <meshStandardMaterial side={2} color="red" />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders={false}
        rotation={[0, 0, 0]}
        position={[0, 0, 20]}
      >
        <CuboidCollider args={[25, 25, 0.5]} friction={1} />

        <mesh geometry={boxGeometry} scale={[50, 50, 1]}>
          <meshStandardMaterial side={2} color="red" />
        </mesh>
      </RigidBody>
    </group>
  );
}
