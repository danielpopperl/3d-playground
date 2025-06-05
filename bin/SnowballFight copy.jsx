import {
  PointerLockControls,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, quat, RigidBody, vec3 } from "@react-three/rapier";
import { useRef } from "react";
import * as THREE from "three";

export default function SnowballFight() {
  const playerRef = useRef();
  const cameraRef = useRef();
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Posições suavizadas da câmera
  const smoothCameraPos = useRef(new THREE.Vector3(0, 5, 5));
  const smoothCameraLook = useRef(new THREE.Vector3(0, 1, 0));

  const [_, get] = useKeyboardControls();

  function getTargetCameraPos() {
    if (playerRef.current) {
      const position = new THREE.Vector3(0, 2, 5);
      position.applyQuaternion(quat(playerRef.current.rotation()));
      position.add(vec3(playerRef.current.translation()));
      return position;
    }

    return new THREE.Vector3();
  }

  function getTargetCameraLook() {
    if (playerRef.current) {
      const position = new THREE.Vector3(0, 0, 0);
      position.applyQuaternion(quat(playerRef.current.rotation()));
      position.add(vec3(playerRef.current.translation()));
      return position;
    }

    return new THREE.Vector3();
  }

  let previousMouseCenterX = 0;

  useFrame(({ camera, pointer }, delta) => {

    const moveSpeed = 700; // Velocidade de movimento
    const maxSpeed = 100;   // Velocidade máxima
    
    
    // cameraRef.current.moveForward(0.2)
    // cameraRef.current.moveForward(0.2)

    const mouseCenterX = pointer.x - window.innerWidth / 2;

    mouseCenterX -+ previousMouseCenterX;

    
    console.log(mouseCenterX)
    
    camera.lookAt(mouseCenterX * 10, pointer.y * 10, 0)

    previousMouseCenterX = mouseCenterX;
    // console.log(pointer)

    // if (playerRef.current) {
    //   // cameraTarget.current.lerp(vec3(playerRef.current.translation()), 0.5);
    //   // cameraRef.current.lookAt(cameraTarget.current);

    //   const currentVel = playerRef.current.linvel();

    //   // Calcular direção do movimento
    //   let moveX = 0, moveZ = 0, moveY = 0;

    //   if (get().forward) moveZ -= 1;
    //   if (get().backward) moveZ += 1;
    //   if (get().left) moveX -= 1;
    //   if (get().right) moveX += 1;
    //   if (get().jump && Math.abs(currentVel.y) < 0.1) moveY = 50; // Pulo apenas se no chão

    //   // Aplicar força apenas se há movimento horizontal
    //   if (moveX !== 0 || moveZ !== 0) {
    //     // Normalizar vetor de movimento
    //     const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();

    //     // Limitar velocidade horizontal
    //     const horizontalVel = new THREE.Vector3(currentVel.x, 0, currentVel.z);

    //     if (horizontalVel.length() < maxSpeed) {
    //       playerRef.current.applyImpulse({
    //         x: moveVector.x * moveSpeed * delta,
    //         y: moveY,
    //         z: moveVector.z * moveSpeed * delta
    //       }, true);
    //     }
    //   }
    // }

    // // Suavização da câmera
    // const lerpFactor = 1 - Math.pow(0.01, 5 * delta); // Ajuste para controlar suavidade

    // const targetCameraPos = getTargetCameraPos();
    // const targetCameraLook = getTargetCameraLook();

    // smoothCameraPos.current.lerp(targetCameraPos, lerpFactor);
    // smoothCameraLook.current.lerp(targetCameraLook, lerpFactor);

    // camera.position.copy(smoothCameraPos.current);
    // camera.lookAt(smoothCameraLook.current);
  });

  return (
    <group>
      {/* <PointerLockControls ref={cameraRef} 
      
      onChange={(e) => {
        // console.log(e)
      }}
      /> */}

      {/* <PerspectiveCamera makeDefault aspect={1920 / 1080} fov={60} position={[0, 5, 0]} ref={cameraRef} /> */}

      {/* PLAYER */}
      <RigidBody
        ref={playerRef}
        position={[0, 2, 0]}
        type="dynamic"
        colliders={"ball"}
        lockRotations
        linearDamping={0.4}
        angularDamping={0.4}
        friction={5} // Aderência ao chão
        restitution={0.0} // Sem bounce
      >
        <CapsuleCollider args={[1, 0.5, 1]} />

        <mesh>
          <capsuleGeometry args={[1]} />
          <meshBasicMaterial color="green" />
        </mesh>
      </RigidBody>
    </group>
  );
}