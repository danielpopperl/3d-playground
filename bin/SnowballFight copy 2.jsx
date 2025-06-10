import {
  PerspectiveCamera,
  PointerLockControls,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, quat, RigidBody, vec3 } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function SnowballFight() {
  const playerRef = useRef();
  const cameraRef = useRef();
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const smoothCameraPos = useRef(new THREE.Vector3(0, 5, 5));
  const smoothCameraLook = useRef(new THREE.Vector3(0, 1, 0));
  const yaw = useRef(0)
  const pitch = useRef(0)
  
  const { camera, gl } = useThree()
  const [isLocked, setIsLocked] = useState(false)

  let previousMouseCenterX = 0;
  let updatedCameraPos = new THREE.Vector3();
  let updatedCameraLook = new THREE.Vector3();

  const [_, get] = useKeyboardControls();

  function updateCamera() {
    if (playerRef.current) {
      const position = new THREE.Vector3(0, 2, 5);
      position.applyQuaternion(quat(playerRef.current.rotation()));
      position.add(vec3(playerRef.current.translation()));
      return position;
    }

    return new THREE.Vector3();
  }

  function updateCameraLooktAt() {
    if (playerRef.current) {
      const position = new THREE.Vector3(0, 0, 0);
      position.applyQuaternion(quat(playerRef.current.rotation()));
      position.add(vec3(playerRef.current.translation()));
      return position;
    }

    return new THREE.Vector3();
  }

  // useFrame(({ camera, pointer, gl }, delta) => {
  //   const moveSpeed = 900;
  //   const maxSpeed = 100;

  //   if (playerRef.current) {
  //     const handleMouseMove = (event) => {
  //       if (!isLocked) return

  //       const movementX = event.movementX || 0
  //       const movementY = event.movementY || 0

  //       yaw.current -= movementX * 0.00001
  //       pitch.current -= movementY * 0.00001

  //       // Clamp pitch to prevent flipping
  //       pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current))
  //     }

  //     const handlePointerLockChange = () => {
  //       setIsLocked(document.pointerLockElement === gl.domElement)
  //     }

  //     const handleClick = () => {
  //       gl.domElement.requestPointerLock()
  //     }

  //     gl.domElement.addEventListener('click', handleClick)
  //     document.addEventListener('pointerlockchange', handlePointerLockChange)
  //     document.addEventListener('mousemove', handleMouseMove)




  //     const direction = new THREE.Vector2(yaw.current, pitch.current)
  //     // cameraTarget.current.lerp(vec3(playerRef.current.translation()), 0.5);
  //     // cameraRef.current.lookAt(cameraTarget.current);

  //     const currentVel = playerRef.current.linvel();

  //     // Calcular direção do movimento
  //     let moveX = 0, moveZ = 0, moveY = 0;

  //     if (get().forward) moveZ -= 1;
  //     if (get().backward) moveZ += 1;
  //     if (get().left) moveX -= 1;
  //     if (get().right) moveX += 1;
  //     if (get().jump && Math.abs(currentVel.y) < 0.1) moveY = 50; // Pulo apenas se no chão

  //     // Create and rotate move vector to match camera orientation
  //     const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();

  //     // Rotate vector using camera's quaternion
  //     moveVector.applyQuaternion(camera.quaternion);

  //     // Prevent vertical movement from camera rotation
  //     moveVector.y = 0;
  //     moveVector.normalize();

  //     // Limit horizontal velocity
  //     const horizontalVel = new THREE.Vector3(currentVel.x, 0, currentVel.z);

  //     if (horizontalVel.length() < maxSpeed) {
  //       playerRef.current.applyImpulse({
  //         x: moveVector.x * moveSpeed * delta,
  //         y: moveY,
  //         z: moveVector.z * moveSpeed * delta
  //       }, true);
  //     }
  //   }


  //   // updatedCameraPos = updateCamera();
  //   // updatedCameraLook = updateCameraLooktAt();

  //   camera.rotation.order = 'YXZ'
  //   camera.rotation.y = yaw.current
  //   camera.rotation.x = pitch.current

  //   const position = new THREE.Vector3(0, 0, 0);
  //   position.applyQuaternion(quat(camera.rotation));
  //   position.add(vec3(playerRef.current.translation()));


  //   camera.position.copy(position);
  //   camera.lookAt(position);


  //   //   const mouseCenterX = pointer.x - window.innerWidth / 2;

  //   //   mouseCenterX -= previousMouseCenterX;

  //   //   camera.lookAt(mouseCenterX * 10, pointer.y * 10, 0)

  //   //   previousMouseCenterX = mouseCenterX;

  //   //   console.log(mouseCenterX)
  // });

  useFrame(({ camera }, delta) => {
    const moveSpeed = 30;
    const maxSpeed = 100;

    if (!playerRef.current) return;

    // Get current linear velocity
    const currentVel = playerRef.current.linvel();

    // Keyboard input
    let moveX = 0, moveZ = 0, moveY = 0;
    if (get().forward) moveZ -= 1;
    if (get().backward) moveZ += 1;
    if (get().left) moveX -= 1;
    if (get().right) moveX += 1;
    if (get().jump && Math.abs(currentVel.y) < 0.1) moveY = 50;

    // Create a direction vector from input
    const moveVector = new THREE.Vector3(moveX, 0, moveZ);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();

      // Dummy object to build quaternion from yaw + pitch
      const dummy = new THREE.Object3D();
      dummy.rotation.order = 'YXZ';
      dummy.rotation.y = yaw.current;
      dummy.rotation.x = 0; // yaw only affects movement, not pitch

      // Rotate move vector by yaw
      moveVector.applyQuaternion(dummy.quaternion);
      moveVector.y = 0;
      moveVector.normalize();

      const horizontalVel = new THREE.Vector3(currentVel.x, 0, currentVel.z);
      if (horizontalVel.length() < maxSpeed) {
        // FIX 2: Use setLinvel instead of applyImpulse for smoother movement
        const targetVelX = currentVel.x + moveVector.x * moveSpeed * delta;
        const targetVelZ = currentVel.z + moveVector.z * moveSpeed * delta;

        playerRef.current.setLinvel({
          x: Math.max(-maxSpeed, Math.min(maxSpeed, targetVelX)),
          y: currentVel.y + moveY,
          z: Math.max(-maxSpeed, Math.min(maxSpeed, targetVelZ))
        }, true);
      }
    }

    // 🧠 Camera rotation
    // camera.rotation.order = 'YXZ';
    // camera.rotation.y = yaw.current;
    // camera.rotation.x = pitch.current;

    // // Camera follows player
    // const playerPos = vec3(playerRef.current.translation());
    // const cameraOffset = new THREE.Vector3(0, 2, 5);

    // // Rotate offset to match camera direction
    // const camRot = new THREE.Object3D();
    // camRot.rotation.order = 'YXZ';
    // camRot.rotation.y = yaw.current;
    // camRot.rotation.x = pitch.current;

    // cameraOffset.applyQuaternion(camRot.quaternion);

    // const camPos = new THREE.Vector3().copy(playerPos).add(cameraOffset);
    // camera.position.copy(camPos);

    // // Camera looks at player head
    // camera.lookAt(playerPos.x, playerPos.y + 1.5, playerPos.z);

    updateCamera(camera)

  });

  function updateCamera(camera) {
    if (!playerRef.current) return;

    const playerPos = vec3(playerRef.current.translation());

    // Camera rotation
    camera.rotation.order = 'YXZ';
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
      pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
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

    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, isLocked]);

  return (
    <group>
      <PerspectiveCamera makeDefault aspect={1920 / 1080} fov={60} position={[0, 0, 0]} />

      {/* PLAYER */}
      <RigidBody
        ref={playerRef}
        position={[0, 2, 0]}
        type="dynamic"
        colliders={"hull"}
        lockRotations
        linearDamping={0.4}
        angularDamping={0.4}
        friction={5} // Aderência ao chão
        restitution={0.0} // Sem bounce
        mass={1}
      >
        <mesh>
          <capsuleGeometry args={[1, 0.5, 10]} />
          <boxGeometry  />
          <meshBasicMaterial color=""  />
        </mesh>
      </RigidBody>
    </group>
  );
}