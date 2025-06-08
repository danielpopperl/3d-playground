import { useGLTF, useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { BallCollider, CuboidCollider, InstancedRigidBodies, RigidBody, useRapier } from "@react-three/rapier";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { BasketBallAssets } from "./ball2";
import { BasketBall } from "./ball";

export default function Player() {
    const playerRef = useRef();
    const meshRef = useRef();
    const mouseYaw = useRef(0);
    const mousePitch = useRef(0);
    const bulletRef = useRef();
    const fireIntervalRef = useRef(null);

    // Add refs for the instanced meshes
    const instancedMeshRef1 = useRef();
    const instancedMeshRef2 = useRef();

    const [isFiring, setIsFiring] = useState(false);
    const [countSecBall, setCountSecBall] = useState(0);
    const [bulletInstances, setBulletInstances] = useState([]);
    const [pointerLocked, setPointerLocked] = useState(false);

    const { camera, gl, scene } = useThree();
    const { rapier, world } = useRapier();
    const [subscriberKeys, getKeys] = useKeyboardControls();

    // OBJECT VARIABLES
    const speed = 300;
    const maxSpeed = 20;
    const fireRate = 10; // Adjust as needed
    const fireInterval = 1000 / fireRate; // Convert to milliseconds

    // Load basketball assets
    const basketballAssets = useMemo(() => {
        try {
            return BasketBallAssets();
        } catch (error) {
            console.warn('Could not load basketball assets:', error);
            return null;
        }
    }, []);

    useFrame(({ camera }, delta) => {
        if (!playerRef.current) return;

        updateCamera(camera);

        // Update basketball instance positions from physics bodies
        if (bulletRef.current && bulletInstances.length > 0) {
            const tempMatrix = new THREE.Matrix4();
            const tempPosition = new THREE.Vector3();
            const tempRotation = new THREE.Quaternion();
            const tempScale = new THREE.Vector3(0.2, 0.2, 0.2); // Match your scale

            for (let i = 0; i < bulletInstances.length; i++) {
                const rigidBody = bulletRef.current.at(i);

                if (rigidBody) {
                    // Get position and rotation from physics body
                    const translation = rigidBody.translation();
                    const rotation = rigidBody.rotation();

                    tempPosition.set(translation.x, translation.y, translation.z);
                    tempRotation.set(rotation.x, rotation.y, rotation.z, rotation.w);

                    // Create transformation matrix
                    tempMatrix.compose(tempPosition, tempRotation, tempScale);

                    // Update both instanced meshes if they exist
                    if (instancedMeshRef1.current) {
                        instancedMeshRef1.current.setMatrixAt(i, tempMatrix);
                    }
                    if (instancedMeshRef2.current) {
                        instancedMeshRef2.current.setMatrixAt(i, tempMatrix);
                    }
                }
            }

            // Mark instances as needing update
            if (instancedMeshRef1.current) {
                instancedMeshRef1.current.instanceMatrix.needsUpdate = true;
            }
            if (instancedMeshRef2.current) {
                instancedMeshRef2.current.instanceMatrix.needsUpdate = true;
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
    });

    function updateCamera(camera) {
        const playerPos = playerRef.current.translation(); // read player position

        // ROTATIO CAMERA BY MOUSE MOVEMENT
        camera.rotation.order = "YXZ";
        camera.rotation.y = mouseYaw.current;
        camera.rotation.x = mousePitch.current;

        camera.position.set(playerPos.x, playerPos.y + 1.7, playerPos.z);
    }

    const jump = () => {
        const origin = playerRef.current.translation();
        origin.y -= 0.89;
        const direction = { x: 0, y: -1, z: 0 };
        const ray = new rapier.Ray(origin, direction);
        const hit = world.castRay(ray, 10, true);

        console.log(origin)

        if (hit && hit.timeOfImpact <= 0.13) {
            playerRef.current.setLinvel({ x: 0, y: 10, z: 0 }, true);
        }
    };

    const instances = useCallback(() => {
        const mouse = new THREE.Vector2(0, 0);

        const ray = new THREE.Raycaster();
        ray.setFromCamera(mouse, camera);

        // Get player position for bullet spawn point
        const playerPos = playerRef.current.translation();

        // Spawn bullet slightly in front of player at eye level
        const spawnPos = [
            playerPos.x + ray.ray.direction.x * 0.5, // Offset forward
            playerPos.y + 1.7, // Eye level
            playerPos.z + ray.ray.direction.z * 1.5, // Offset forward
        ];


        // Use the ray direction for bullet velocity
        const bulletSpeed = 1; // Adjust as needed
        const impulse = ray.ray.direction.multiplyScalar(bulletSpeed);

        const newInstance = {
            key: Date.now() + Math.random(),
            position: spawnPos,
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            impulse: impulse,
        };

        setBulletInstances((prev) => [...prev, newInstance]);
    }, []);

    const handleMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();

        // button 0 = left click | button 2 = right click
        if (pointerLocked && event.button === 0) {
            // Fire immediately
            instances();

            // Start continuous firing
            // setIsFiring(true);

            // fireIntervalRef.current = setInterval(() => {
            //   setCountSecBall((prev) => { return prev + 0.1 })
            // }, fireInterval);
        }

        if (!pointerLocked) {
            gl.domElement.requestPointerLock();
        }
    };

    const handleMouseUp = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (pointerLocked && event.button === 0) {
            // Stop continuous firing
            setIsFiring(false);

            if (fireIntervalRef.current) {
                clearInterval(fireIntervalRef.current);
                fireIntervalRef.current = null;
            }
        }
    }

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
        console.log("Counter updated:", countSecBall);
    }, [countSecBall]);

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
            // window.removeEventListener("mousemove", handleMouseMove);
            // window.removeEventListener("mousedown", handleMouseDown);
            // window.removeEventListener("pointerlockchange", handlePointerLockChange);
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
            gl.domElement.removeEventListener("mousedown", handleMouseDown);
            gl.domElement.removeEventListener("mouseup", handleMouseUp);
        };
    }, [pointerLocked]);

    useEffect(() => {
        if (bulletInstances.length <= 0) return;

        const lastBulletInstance = bulletInstances[bulletInstances.length - 1];
        const lastBulletIndex = bulletInstances.length - 1;

        setTimeout(() => {
            if (bulletRef.current.at(lastBulletIndex)) {
                const rigidBody = bulletRef.current.at(lastBulletIndex).collider(0)

                rigidBody.setRestitution(0.65);
                rigidBody.parent().applyImpulse(lastBulletInstance.impulse, true);
            }
        }, 5)

        // setTimeout(() => {
        //   bulletRef.current
        //     .at(lastBulletIndex)
        //     .applyImpulse(lastBulletInstance.impulse, true);

        //   console.log(bulletRef.current.at(lastBulletIndex));
        // }, 5);
    }, [bulletInstances]);

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
                        friction={5} // Aderência ao chão
                        restitution={0} // Sem bounce
                        restitutionCombineRule={1}
                    />
                    <boxGeometry args={[1, 1, 2]} />
                    <meshPhysicalMaterial color="green" />
                </mesh>
            </RigidBody>

            {bulletInstances.length > 0 && (
                <InstancedRigidBodies
                    ref={bulletRef}
                    instances={bulletInstances}
                    colliders={false}
                    ccd={true}
                    linearDamping={1}
                    angularDamping={1.5}
                    scale={1}
                    colliderNodes={[
                        // <BallCollider args={[0.00195]} />
                        <BallCollider args={[0.21]} />
                    ]}
                >
                    {/* <instancedMesh args={[undefined, undefined, 1000]} count={1000} frustumCulled={false}>
                        <sphereGeometry args={[0.195, 50, 50]} />
                        <meshBasicMaterial color="blue" />
                    </instancedMesh> */}

                    {/* First mesh layer with ref */}
                    <instancedMesh
                        ref={instancedMeshRef1}
                        args={[basketballAssets.geometry1, basketballAssets.material1, 1000]}
                        count={bulletInstances.length}
                        frustumCulled={false}
                        castShadow
                        receiveShadow
                    />

                    {/* Second mesh layer with ref (if available) */}
                    <instancedMesh
                        ref={instancedMeshRef2}
                        args={[basketballAssets.geometry2, basketballAssets.material2, 1000]}
                        count={bulletInstances.length}
                        frustumCulled={false}
                        castShadow
                        receiveShadow
                    />
                </InstancedRigidBodies>
            )}
        </group>

    )
}