"use client";

import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  InstancedRigidBodies,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function SnowballFight() {
  const playerRef = useRef();
  const meshRef = useRef();
  const mouseYaw = useRef(0);
  const mousePitch = useRef(0);
  const bulletBody = useRef();

  const [bulletInstances, setBulletInstances] = useState([]);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10)
  );

  const { camera, gl, scene } = useThree();
  const { rapier, world } = useRapier();
  const [subscriberKeys, getKeys] = useKeyboardControls();

  // OBJECT VARIABLES
  const speed = 150;
  const maxSpeed = 30;

  useFrame(({ camera }, delta) => {
    if (!playerRef.current) return;

    const impulse = { x: 0, y: 0, z: 0 };
    const impulseStrength = 1;

    // CONTROLS
    const { forward, backward, left, right } = getKeys();

    // READ PLAYER'S LINEAR VELOCITY
    const currentPlayerVelocity = playerRef.current.linvel();

    if (forward) {
      impulse.z -= impulseStrength;
    }
    if (backward) {
      impulse.z += impulseStrength;
    }
    if (left) {
      impulse.x -= impulseStrength;
    }
    if (right) {
      impulse.x += impulseStrength;
    }

    const moveVector = new THREE.Vector3(impulse.x, 0, impulse.z);

    if (moveVector.lengthSq() >= 1) {
      moveVector.normalize();

      const dummy = new THREE.Object3D();
      dummy.rotation.order = "YXZ";
      dummy.rotation.y = mouseYaw.current;
      dummy.rotation.x = 0; // yaw only affects movement, not pitch

      moveVector.applyQuaternion(dummy.quaternion);
      moveVector.y = 0;
      moveVector.normalize();

      if (meshRef.current) meshRef.current.rotation.y = mouseYaw.current; // set player (mesh) rotation same as camera rotation

      const horizontalVel = new THREE.Vector3(
        currentPlayerVelocity.x,
        0,
        currentPlayerVelocity.z
      );

      if (horizontalVel.length() < maxSpeed) {
        const targetVelX =
          currentPlayerVelocity.x + moveVector.x * speed * delta;
        const targetVelZ =
          currentPlayerVelocity.z + moveVector.z * speed * delta;
        const targetVelY = currentPlayerVelocity.y + moveVector.y * delta;

        playerRef.current.setLinvel(
          {
            x: Math.max(-maxSpeed, Math.min(maxSpeed, targetVelX)),
            y: Math.max(-maxSpeed, Math.min(maxSpeed, targetVelY)),
            z: Math.max(-maxSpeed, Math.min(maxSpeed, targetVelZ)),
          },
          true
        );
      }
    } else {
      if (meshRef.current) meshRef.current.rotation.y = mouseYaw.current; // set player (mesh) rotation same as camera rotation
    }

    updateCamera(camera);
  });

  const jump = () => {
    const origin = playerRef.current.translation();
    origin.y -= 0.89;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = world.castRay(ray, 10, true);

    if (hit && hit.timeOfImpact <= 0.1) {
      playerRef.current.setLinvel({ x: 0, y: 10, z: 0 });
    }
  };

  function updateCamera(camera) {
    const playerPos = playerRef.current.translation(); // read player position

    // ROTATIO CAMERA BY MOUSE MOVEMENT
    camera.rotation.order = "YXZ";
    camera.rotation.y = mouseYaw.current;
    camera.rotation.x = mousePitch.current;

    camera.position.set(playerPos.x, playerPos.y + 1.7, playerPos.z);
  }

  const instances = useCallback(() => {
    if (!playerRef.current) return;

    // Get player position as starting point
    const playerPos = playerRef.current.translation();
    const startPosition = new THREE.Vector3(
      playerPos.x,
      playerPos.y,
      playerPos.z
    ); // Eye level

    // Method 3: Use raycaster for center screen (most accurate)
    const raycaster = new THREE.Raycaster();
    // Center of screen is (0, 0) in normalized device coordinates
    const centerScreen = new THREE.Vector2(0, 0);

    raycaster.setFromCamera(centerScreen, camera);

    // Get the direction from raycaster
    const rayDirection = raycaster.ray.direction.clone();

    // Raycast to find hit point
    const intersects = raycaster.intersectObjects(scene.children);

    let targetPosition = new THREE.Vector3(0, 0, 0);

    // if (intersects.length > 0) {
    //   const npc = intersects.filter((mesh) => {
    //     return (
    //       mesh.object.name === "npc" ||
    //       (mesh.object.parent && mesh.object.parent.name === "npc")
    //     );
    //   });
    //   // Hit something - use hit point
    //   if (npc.length > 0) {
    //     console.log(rayDirection);

    //     targetPosition = [npc[0].point.x, npc[0].point.y, npc[0].point.z];
    //     // targetPosition = rayDirection.clone();
    //   }
    // } else {
    //   // No hit - project forward from camera
    //   console.log(rayDirection.multiplyScalar(0))
    //   startPosition.y += 2;
    //   targetPosition = startPosition
    //     .clone()
    //     .add(rayDirection.multiplyScalar(0));
    // }

    console.log(rayDirection.multiplyScalar(1));
    startPosition.y += 2;
    targetPosition = startPosition.clone().add(rayDirection.multiplyScalar(1));

    const newInstance = {
      key: "instance_" + Math.random(),
      position: [targetPosition.x, targetPosition.y, targetPosition.z],
      rotation: [0, 0, 0],
    };

    setBulletInstances((prev) => {
      const newArray = [...prev, newInstance];
      return newArray;
    });

    // console.log('Shooting at:', targetPosition);

    // Create bullet
    // const newBullet = {
    //   id: Date.now(),
    //   position: {
    //     x: targetPosition.x,
    //     y: targetPosition.y,
    //     z: targetPosition.z,
    //   },
    //   // Store direction for animated bullets
    //   direction: {
    //     x: rayDirection.x,
    //     y: rayDirection.y,
    //     z: rayDirection.z,
    //   },
    // };

    // setBullets((prev) => [...prev, newBullet]);
  }, [bulletInstances]);

  // const shot = () => {
  //   // const dummy = new THREE.Object3D();
  //   // dummy.rotation.order = "YXZ";
  //   // dummy.rotation.y = mouseYaw.current;
  //   // dummy.rotation.x = mousePitch.current; // yaw only affects movement, not pitch

  //   // const origin = playerRef.current.translation();
  //   // const direction2 = new THREE.Vector3();
  //   // camera.getWorldDirection(direction2);

  //   // const direction = { x: direction2.x, y: direction2.y };

  //   // const ray = new rapier.Ray(origin, direction2);
  //   // const hit = world.castRay(ray, 100, false);
  //   // console.log(hit.collider);

  //   const playerPos = playerRef.current.translation();

  //   // Calculate world position based on camera rotation
  //   const distance = 2; // How far to place the point

  //   const x = playerPos.x + Math.sin(-mouseYaw.current) * Math.cos(mousePitch.current);
  //   const y = playerPos.y + 1.7 + Math.sin( mousePitch.current);
  //   const z = playerPos.z - Math.cos(mouseYaw.current) * Math.cos(mousePitch.current);

  //   const newBullet = {
  //     id: Date.now(),
  //     position: {x,y,z},
  //   };

  //   setBullets((prev) => [...prev, newBullet]);
  // };

  const handleMouseDown = (event) => {
    if (!pointerLocked) {
      gl.domElement.requestPointerLock();
    }

    // button 0 = left button
    if (event.button === 0) {
      instances();
    }
  };

  const handlePointerLockChange = () => {
    const locked = document.pointerLockElement === gl.domElement;
    setPointerLocked(locked);
  };

  const handleMouseMove = (event) => {
    mouseYaw.current -= event.movementX * 0.002;

    mousePitch.current -= event.movementY * 0.002;
    mousePitch.current = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, mousePitch.current)
    );
  };

  useEffect(() => {
    const unsubscribeJump = subscriberKeys(
      (state) => {
        return state.jump;
      },
      (value) => {
        if (value) {
          jump();
        }
      }
    );

    // const handleClick = () => {
    //   console.log(2);
    //   //   gl.domElement.requestPointerLock();
    // };

    // gl.domElement.addEventListener("click", handleClick);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      unsubscribeJump();
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    if (!bulletBody.current) return;

    bulletBody.current.map((api) => {
      //   console.log(api);
      api.applyImpulse({ x: 0, y: 0, z: 0.08 }, true);
    });
  }, [bulletInstances]);

  return (
    <group>
      <RigidBody
        ref={playerRef}
        position={[0, 0.5, 0]}
        type="dynamic"
        colliders={false}
        lockRotations
        linearDamping={0.1}
        angularDamping={0.5}
        friction={5} // Aderência ao chão
        restitution={0} // Sem bounce
      >
        <CuboidCollider args={[0.55, 0.55, 1]} />
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 2]} />
          <meshPhysicalMaterial color="green" />
        </mesh>
      </RigidBody>

      <RigidBody
        position={[0, 0.5, 0]}
        type="dynamic"
        colliders={false}
        lockRotations
        linearDamping={0.1}
        angularDamping={0.5}
        friction={5} // Aderência ao chão
        restitution={0} // Sem bounce
      >
        <mesh castShadow receiveShadow position={[1, 1, 5]} name={"npc"}>
          <CuboidCollider args={[0.55, 0.55, 1]} />
          <boxGeometry args={[1, 2, 2]} />
          <meshPhysicalMaterial color="green" />
        </mesh>
      </RigidBody>
      {/* {bullets &&
        bullets.map((bullet, idx) => {
          return (
            <mesh
              key={idx}
              position={[
                bullet.position.x,
                bullet.position.y,
                bullet.position.z,
              ]}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color="red" />
            </mesh>
          );
        })} */}

      <InstancedRigidBodies
        ref={bulletBody}
        instances={bulletInstances}
        colliders="ball"
      >
        <instancedMesh args={[undefined, undefined, 1000]} count={1000}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="red" side={2} />
        </instancedMesh>
      </InstancedRigidBodies>
    </group>
  );
}
