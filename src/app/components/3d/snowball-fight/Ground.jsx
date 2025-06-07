import { ConeCollider, CuboidCollider, CylinderCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { BoxGeometry, TorusGeometry } from "three";

export default function Ground() {
  const colliderRef = useRef();

  const [colliderOrder, setColliderOrder] = useState("empty");

  const { rapier, world } = useRapier();

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

  const handleCollision = (manifold) => {
    console.log(manifold)
  }


  function determineSide(relativePos) {
    const { x, y, z } = relativePos;

    // Since your cone is rotated [Math.PI / 2, 0, 0]
    // The cone's "length" axis is now the Z-axis
    // The cone's "radius" plane is now the X-Y plane

    if (Math.abs(z) > Math.abs(x) && Math.abs(z) > Math.abs(y)) {
      return z > 0 ? "front" : "back";
    } else if (Math.abs(x) > Math.abs(y)) {
      return x > 0 ? "right" : "left";
    } else {
      return y > 0 ? "top" : "bottom";
    }
  }

  return (
    // GROUND
    <group name="base" receiveShadow>
      <RigidBody
        type="fixed"
        colliders={false}
        rotation={[-Math.PI * 0.5, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <CuboidCollider args={[25, 25, 0.5]} friction={1} restitution={1.5} />

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

      <RigidBody
        type="fixed"
        colliders={"trimesh"}
        rotation={[0, 0, 0]}
        position={[0, 5, 0]}
      >
        <ConeCollider
          name="basket-up"
          ref={colliderRef}
          args={[0.07, 1]}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          sensor={true}
          onIntersectionEnter={() => {
            // console.log(colliderOrder, "from top")
            if (colliderOrder === "empty") setColliderOrder("top")
            if (colliderOrder === "botton") setColliderOrder("empty")
          }}
        />

        <CylinderCollider
          name="basket-botton"
          ref={colliderRef}
          args={[0.07, 1]}
          position={[0, 0, 0.6]}
          rotation={[Math.PI / 2, 0, 0]}
          sensor={true}
          onIntersectionEnter={() => {
            // console.log(colliderOrder, "from botton")
            if (colliderOrder === "empty") setColliderOrder("botton")
            if (colliderOrder === "botton") setColliderOrder("empty")
            if (colliderOrder === "top") {
              setColliderOrder("empty")
              console.log(colliderOrder, "GOAL")
            }

          }}
        />
        <mesh geometry={torusGeometry} scale={[1, 1, 1]}>
          <meshStandardMaterial side={2} color="red" />
        </mesh>
      </RigidBody>
    </group>
  );
}


// onCollisionEnter={(manifold) => {
// const origin = colliderRef.current.translation();
// const direction = { x: 0, y: -5, z: 0 };
// const ray = new rapier.Ray(origin, direction);
// const hit = world.castRay(ray, 2, false);

// console.log("GOAL!!!");

// console.log(manifold)
// if (manifold) {
//   const contactPoint = manifold.localContactPoint1(); // Contact point on cone
//   const normal = manifold.localContactNormal1(); // Surface normal

//   console.log("Contact point:", contactPoint);
//   console.log("Surface normal:", normal);

//   // Use normal to determine which surface was hit
//   // const side = classifyBySurfaceNormal(normal);
// }
// }}
