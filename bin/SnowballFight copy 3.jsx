import { OrthographicCamera, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, vec3 } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function SnowballFight() {
  const playerRef = useRef();
  const meshRef = useRef();
  const yaw = useRef(0);
  const pitch = useRef(0);

  const [isLocked, setIsLocked] = useState(false);

  const [_, get] = useKeyboardControls();
  const { camera, gl } = useThree();

  const speed = 1;
  const moveSpeed = 20;
  const maxSpeed = 20;

  useFrame(({ camera }, delta) => {
    if (!playerRef.current) return;

    // Move Player
    let moveX = 0,
      moveZ = 0,
      moveY = 0;

    let currentVel = playerRef.current.linvel();

    if (Math.abs(currentVel.y) < 0.005) {
      if (get().forward) moveZ -= 1;
      if (get().backward) moveZ += 1;
      if (get().left) moveX -= 1;
      if (get().right) moveX += 1;
      if (get().jump) moveY = 50;
    }

    // Create a direction vector from input
    const moveVector = new THREE.Vector3(moveX, 0, moveZ);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();

      // Dummy object to build quaternion from yaw + pitch
      const dummy = new THREE.Object3D();
      dummy.rotation.order = "YXZ";
      dummy.rotation.y = yaw.current;
      dummy.rotation.x = 0; // yaw only affects movement, not pitch

      // Rotate move vector by yaw
      moveVector.applyQuaternion(dummy.quaternion);
      moveVector.y = 0;
      moveVector.normalize();

      if (meshRef.current) {
        meshRef.current.rotation.y = yaw.current;
        // Optional: also apply pitch for vertical tilt
        // meshRef.current.rotation.x = pitch.current;
      }

      const horizontalVel = new THREE.Vector3(currentVel.x, 0, currentVel.z);

      if (horizontalVel.length() < maxSpeed) {
        // FIX 2: Use setLinvel instead of applyImpulse for smoother movement
        const targetVelX = currentVel.x + moveVector.x * moveSpeed * delta;
        const targetVelZ = currentVel.z + moveVector.z * moveSpeed * delta;

        playerRef.current.applyImpulse(
          {
            x: Math.max(-maxSpeed, Math.min(maxSpeed, targetVelX)),
            y: currentVel.y + moveY,
            z: Math.max(-maxSpeed, Math.min(maxSpeed, targetVelZ)),
          },
          true
        );
      }
    } else {
      // Still apply rotation even when not moving
      if (meshRef.current) {
        meshRef.current.rotation.y = yaw.current;
        // meshRef.current.rotation.x = pitch.current;
      }
    }

    updateCamera(camera);
  });

  function updateCamera(camera) {
    if (!playerRef.current) return;

    const playerPos = vec3(playerRef.current.translation());

    // Camera rotation
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    // FIX 5: First-person camera (no offset) to eliminate following issues
    // For first-person, camera should BE the player position
    camera.position.set(
      playerPos.x,
      playerPos.y + 1.7, // Eye level height
      playerPos.z
    );

    // No lookAt needed for first-person - rotation handles direction
  }

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isLocked) return;

      yaw.current -= event.movementX * 0.002;
      pitch.current -= event.movementY * 0.002;
      pitch.current = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, pitch.current)
      );
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement;
      setIsLocked(locked);
      console.log("Pointer lock active:", locked);
    };

    const handleClick = () => {
      gl.domElement.requestPointerLock();
      gl.domElement.focus(); // ensure canvas has keyboard focus
    };

    gl.domElement.addEventListener("click", handleClick);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      gl.domElement.removeEventListener("click", handleClick);
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gl, isLocked]);

  return (
    <group>
      <OrthographicCamera fov={70} position={[0, 0, 0]} />

      {/* PLAYER */}
      <RigidBody
        ref={playerRef}
        position={[0, 2, 0]}
        canSleep={false}
        type="dynamic"
        colliders={"hull"}
        lockRotations
        linearDamping={0.4}
        angularDamping={0.4}
        friction={1} // Aderência ao chão
        restitution={0.2} // Sem bounce
      >
        <mesh ref={meshRef}>
          <boxGeometry args={[1, 1, 2]} />
          <meshBasicMaterial color="green" />
        </mesh>
      </RigidBody>
    </group>
  );
}
