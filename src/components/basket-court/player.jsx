import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Ball } from "./ball";

export default function Player() {
  const playerRef = useRef();
  const meshRef = useRef();
  const ballRef = useRef();
  const mouseYaw = useRef(0);
  const mousePitch = useRef(0);

  const [pointerLocked, setPointerLocked] = useState(false);
  const [ballState, setBallState] = useState("withPlayer"); // 'withPlayer', 'thrown', 'returning'
  const [ballPosition, setBallPosition] = useState([0, 0, 0]);

  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();
  const [subscriberKeys, getKeys] = useKeyboardControls();

  // OBJECT VARIABLES
  const speed = 300;
  const maxSpeed = 20;

  useFrame(({ camera }, delta) => {
    if (!playerRef.current) return;

    updateCamera(camera);

    // Handle ball return logic
    if (ballState === "returning" && ballRef.current && playerRef.current) {
      const ballPos = ballRef.current.translation();
      const playerPos = playerRef.current.translation();

      // Calculate direction from ball to player
      const direction = new THREE.Vector3(
        playerPos.x - ballPos.x,
        playerPos.y + 1.7 - ballPos.y,
        playerPos.z - ballPos.z
      );

      // Check if ball is close enough to player
      if (direction.length() < 1.5) {
        setBallState("withPlayer");
        // Stop ball movement
        ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      } else {
        // Apply force toward player
        direction.normalize();
        const returnSpeed = 15;
        ballRef.current.setLinvel(
          {
            x: direction.x * returnSpeed,
            y: direction.y * returnSpeed,
            z: direction.z * returnSpeed,
          },
          true
        );
      }
    }

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

    // Update ball position when it's with the player
    if (ballState === "withPlayer" && playerRef.current) {
      const playerPos = playerRef.current.translation();
      setBallPosition([
        playerPos.x + Math.sin(mouseYaw.current) * 1.2, // Slightly in front
        playerPos.y + 1.5, // At chest level
        playerPos.z + Math.cos(mouseYaw.current) * 1.2,
      ]);
    }
  });

  function updateCamera(camera) {
    const playerPos = playerRef.current.translation(); // read player position

    // ROTATION CAMERA BY MOUSE MOVEMENT
    camera.rotation.order = "YXZ";
    camera.rotation.y = mouseYaw.current;
    camera.rotation.x = mousePitch.current;

    camera.position.set(playerPos.x, playerPos.y + 1.7, playerPos.z);
  }

  const jump = () => {
    const origin = playerRef.current.translation();
    origin.y -= 0.89;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray({ origin, dir: direction });
    const hit = world.castRay(ray, 10, true);

    if (hit && hit.timeOfImpact <= 0.13) {
      playerRef.current.setLinvel({ x: 0, y: 10, z: 0 }, true);
    }
  };

  const throwBall = () => {
    if (ballState !== "withPlayer" || !ballRef.current || !playerRef.current)
      return;

    const mouse = new THREE.Vector2(0, 0);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);

    // Throw ball in the direction the player is looking
    const throwSpeed = 20;
    const impulse = ray.ray.direction.multiplyScalar(throwSpeed);

    // Set ball state and apply impulse
    setBallState("thrown");

    // Small delay to ensure ball physics are ready
    setTimeout(() => {
      if (ballRef.current) {
        ballRef.current.setLinvel(
          {
            x: impulse.x,
            y: impulse.y,
            z: impulse.z,
          },
          true
        );

        // Add some spin
        ballRef.current.setAngvel(
          {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10,
            z: (Math.random() - 0.5) * 10,
          },
          true
        );
      }
    }, 10);
  };

  const returnBall = () => {
    if (ballState !== "thrown") return;
    setBallState("returning");
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    // button 0 = left click | button 2 = right click
    if (pointerLocked && event.button === 0) {
      if (ballState === "withPlayer") {
        throwBall();
      } else if (ballState === "thrown") {
        returnBall();
      }
    }

    if (!pointerLocked) {
      gl.domElement.requestPointerLock();
    }
  };

  const handleMouseUp = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handlePointerLockChange = () => {
    const locked = document.pointerLockElement === gl.domElement;
    setPointerLocked(locked);
  };

  const handleMouseMove = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (pointerLocked) {
      mouseYaw.current -= event.movementX * 0.002;

      mousePitch.current -= event.movementY * 0.002;
      mousePitch.current = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, mousePitch.current)
      );
    }
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

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("mousedown", handleMouseDown);
    gl.domElement.addEventListener("mouseup", handleMouseUp);

    return () => {
      unsubscribeJump();
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      gl.domElement.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pointerLocked, ballState]);

  return (
    <group>
      <RigidBody
        ref={playerRef}
        position={[0, 10, 0]}
        scale={1}
        type="dynamic"
        colliders={false}
        enabledRotations={[false, false, false]}
      >
        <mesh ref={meshRef} castShadow receiveShadow>
          <CuboidCollider
            args={[0.55, 0.55, 1]}
            friction={10} // Aderência ao chão
            restitution={0} // Sem bounce
            restitutionCombineRule={1}
          />
          <boxGeometry args={[1, 1, 2]} />
          <meshPhysicalMaterial color="green" />
        </mesh>
      </RigidBody>

      {/* Single Basketball */}
      <Ball
        ref={ballRef}
        position={ballPosition}
        scale={0.2}
        restitution={0.65}
        enableDecalGUI={true}
        decalPosition={[0, 1.1, 0]}
        decalRotation={[1.5, 0, 0]}
        decalScale={[1, 1, 1]}
        decalOpacity={0.4}
      />
    </group>
  );
}
