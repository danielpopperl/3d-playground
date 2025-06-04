"use client";

import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function SnowballFight() {
  const playerRef = useRef();
  const meshRef = useRef();
  const mouseYaw = useRef(0);
  const mousePitch = useRef(0);

  const [bullets, setBullets] = useState([]);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10)
  );

  const { gl } = useThree();
  const { rapier, world } = useRapier();
  const [subscriberKeys, getKeys] = useKeyboardControls();

  // OBJECT VARIABLES
  const speed = 150;
  const maxSpeed = 30;

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

  function updateCamera(camera) {
    const playerPos = playerRef.current.translation(); // read player position

    // ROTATIO CAMERA BY MOUSE MOVEMENT
    camera.rotation.order = "YXZ";
    camera.rotation.y = mouseYaw.current;
    camera.rotation.x = mousePitch.current;

    camera.position.set(playerPos.x, playerPos.y + 1.7, playerPos.z);
  }

  const shot = () => {
    if (playerRef.current) {
      const playerPos = playerRef.current.translation();
      // read player position
      const direction = { x: playerPos.x, y: playerPos.y, z: -5 };
      const ray = new rapier.Ray(origin, direction);
      const hit = world.castRay(ray, 10, true);

      const newBullet = {
        id: Date.now(),
        position: direction,
      };

      setBullets((prev) => [...prev, newBullet]);
    }
  };

  const handleMouseDown = (event) => {
    if (!pointerLocked) {
      gl.domElement.requestPointerLock();
    }

    // button 0 = left button
    if (event.button === 0) {
      shot();
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

  return (
    //   {/* <OrthographicCamera fov={70} position={[0, 5, 10]} /> */}

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
        <mesh ref={meshRef} castShadow receiveShadow>
          <CuboidCollider args={[0.55, 0.55, 1]} />
          <boxGeometry args={[1, 1, 2]} />
          <meshPhysicalMaterial color="green" />
        </mesh>
      </RigidBody>

      {bullets &&
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
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial color="red" />
            </mesh>
          );
        })}
    </group>
  );
}
