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

  const [jumped, setJumped] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [collision, setCollision] = useState(false);

  const { gl } = useThree();
  const { rapier, world } = useRapier();
  const [subscriberKeys, getKeys] = useKeyboardControls();

  // SMOOTH CAMERA MOVEMENT
  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10)
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  // OBJECT VARIABLES
  const speed = 100;
  const maxSpeed = 20;

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

    // const origin = playerRef.current.translation();
    // const direction = { x: 0, y: 0, z: 0 };
    // const ray = new rapier.Ray(origin, direction);
    // const hit = world.castRay(ray, 10, false);
    // console.log(hit);

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

    if (moveVector.lengthSq() == 1) {
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

    // playerRef.current.setLinvel(
    //   {
    //     x: impulse.x,
    //     y: currentPlayerVelocity.y,
    //     z: impulse.z,
    //   },
    //   true
    // );

    // CAMERA

    // const playerCam = new THREE.Vector3(); // write player position to playerCam and add y and z
    // playerCam.copy(playerPos);
    // playerCam.y += 2;
    // playerCam.z += 5;

    // const cameraTarget = new THREE.Vector3();
    // cameraTarget.copy(playerPos);
    // cameraTarget.y += 2;

    // smoothedCameraPosition.lerp(playerCam, 10 * delta);
    // smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    // camera.position.copy(playerCam); // write playerCam to threejs camera
    // camera.lookAt(cameraTarget); // set threejs camera to look at new coordinates

    updateCamera(camera);
  });

  function updateCamera(camera) {
    const playerPosNew = playerRef.current.translation(); // read player position

    // ROTATIO CAMERA BY MOUSE MOVEMENT
    camera.rotation.order = "YXZ";
    camera.rotation.y = mouseYaw.current;
    camera.rotation.x = mousePitch.current;

    camera.position.set(
      playerPosNew.x,
      playerPosNew.y + 1.7,
      playerPosNew.z + 5
    );
  }

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

    const handleClick = () => {
      gl.domElement.requestPointerLock();
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

    gl.domElement.addEventListener("click", handleClick);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);

    return () => unsubscribeJump();
  }, [gl]);

  return (
    //   {/* <OrthographicCamera fov={70} position={[0, 5, 10]} /> */}

    <RigidBody
      ref={playerRef}
      position={[0, 0.5, 0]}
      type="dynamic"
      colliders={false}
      lockRotations
      linearDamping={0.1}
      angularDamping={0.5}
      friction={2} // Aderência ao chão
      restitution={0} // Sem bounce
      onCollisionEnter={({ target }) => {
        setCollision(true);
      }}
      onCollisionExit={({ target }) => {
        setCollision(false);
      }}
    >
      <CuboidCollider args={[0.55, 0.55, 1]} />

      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 2]} />
        <meshPhysicalMaterial color="green" />
      </mesh>
    </RigidBody>
  );
}
