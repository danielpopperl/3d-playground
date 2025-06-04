import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { BoxGeometry } from "three";

export default function Ground() {
  const boxGeometry = new BoxGeometry(1, 1, 1);

  return (
    // GROUND
    <group
      name="base"
      position={[0, -0.1, 0]}
      rotation-x={-Math.PI * 0.5}
      receiveShadow
    >
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[25, 25, 0.5]} friction={1} />

        <mesh geometry={boxGeometry} scale={[50, 50, 1]}>
          <meshStandardMaterial side={2} color="red" />
        </mesh>
      </RigidBody>
    </group>
  );
}
