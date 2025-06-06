import { ConeCollider, CuboidCollider, RigidBody } from "@react-three/rapier";
import { BoxGeometry, TorusGeometry } from "three";

export default function Ground() {
  const boxGeometry = new BoxGeometry(1, 1, 1);
  const torusGeometry = new TorusGeometry(1, 0.2, 16, 100);

  let triMeshVerts = new Float32Array(9);
  triMeshVerts[0] = -9;
  triMeshVerts[1] = 0;
  triMeshVerts[2] = 9;
  triMeshVerts[3] = 9;
  triMeshVerts[4] = 0;
  triMeshVerts[5] = 9;
  triMeshVerts[6] = 0;
  triMeshVerts[7] = 0;
  triMeshVerts[8] = -9;

  let triMeshIndices = new Uint32Array(3);
  triMeshIndices[0] = 0;
  triMeshIndices[1] = 1;
  triMeshIndices[2] = 2;

  return (
    // GROUND
    <group name="base" receiveShadow>
      <RigidBody
        type="fixed"
        colliders={false}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <CuboidCollider args={[25, 25, 0.5]} friction={1} restitution={1} />

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
        <CuboidCollider args={[25, 25, 0.5]} friction={1} restitution={1} />

        <mesh geometry={boxGeometry} scale={[50, 50, 1]}>
          <meshStandardMaterial side={2} color="red" />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders={"trimesh"}
        rotation={[0, 0, 0]}
        position={[0, 5, 0]}
      >
        <ConeCollider
          args={[0.07, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0.5]}
          sensor={true}
          onIntersectionExit={() => {
            console.log("GOAL!!!");
          }}
        />
        <mesh geometry={torusGeometry} scale={[1, 1, 1]}>
          <meshStandardMaterial side={2} color="red" />
        </mesh>
      </RigidBody>
    </group>
  );
}
