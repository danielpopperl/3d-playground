// @ts-nocheck
"use client";

import fragmentGradient from "!!raw-loader!../../../shaders/gradient/fragment.glsl";
import vertexGradient from "!!raw-loader!../../../shaders/gradient/vertex.glsl";
import fragment from "!!raw-loader!../../../shaders/holographic/fragment.glsl";
import vertex from "!!raw-loader!../../../shaders/holographic/vertex.glsl";
import {
  Environment,
  Float,
  Lightformer,
  MeshPortalMaterial,
  Text,
  useGLTF,
  useTexture
} from "@react-three/drei";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { HandFilled } from "./HandFilled";

// import FollowLight from "./FollowLight";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function CardEmbra({
  cardImageUrl = null,
  split = true,
  texture,
}: {
  cardImageUrl?: string;
  split?: boolean;          // Whether the page is in split layout; moves camera to right & lights up
  texture?: THREE.Texture;
}) {

  return (
    <Canvas
      id="badgeCanvas"
      tabIndex={0}
      // dpr={[1, Math.min(2, window.devicePixelRatio)]}
      dpr={[2, 2]}
      camera={{ position: [2.5, 0, 15], fov: 25 }}
      style={{ outline: "none" }}
      aria-label="Consultant badge – press Enter or Space to flip"
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;    // se já usa r152+
        gl.toneMapping = THREE.LinearToneMapping;      // opcional
      }}
    >
      <Suspense fallback={null}>

        <ambientLight intensity={Math.PI} />

        {/* Drive camera position and background color transitions */}
        <CameraAndBackground split={split} />

        <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}
          maxStabilizationIterations={10} // Increase for better stability
          maxVelocityIterations={10} // Increase for better velocity resolution
        >
          <Band />
        </Physics>

        <Environment blur={0.8}>
          <Lightformer
            intensity={1}
            color="red"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="red"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="red"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={7}
            color="white"
            position={[-8, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>

        {/* Luz vermelha que segue o mouse */}
        {/* <FollowLight /> */}
      </Suspense>
    </Canvas>
  );
}


function Band({
  maxSpeed = 50,
  minSpeed = 10,
  cardImageUrl,
  newTexture
}: {
  maxSpeed?: number;
  minSpeed?: number;
  cardImageUrl?: string;
  newTexture?: THREE.Texture
}) {
  const band = useRef(), fixed = useRef(), card = useRef(), holoRef = useRef() // prettier-ignore
  const j1 = useRef(), j2 = useRef(), j3 = useRef() // prettier-ignore
  const downPos = useRef<{ x: number; y: number } | null>(null); // Store initial pointer position to differentiate click vs drag
  const cardGroup = useRef();
  const cardTextureMapRef = useRef();


  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  const [dragged, drag] = useState<THREE.Vector3 | null>(null); // Holds the drag offset vector when dragging, null otherwise
  const [flipped, setFlipped] = useState(false); // Track whether the card is flipped to reveal the QR-code backside
  const [hovered, hover] = useState(false); // Reference to the visual group inside the rigid-body so we can rotate it
  const [src, setSrc] = useState("");


  const DRAG_THRESHOLD = 3; // px


  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()


  const { width, height } = useThree((state) => state.size);


  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  };


  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]) // prettier-ignore


  const { nodes, materials } = useGLTF("/3d/card-embra/newCard.glb");
  const iconTick = useTexture("/3d/card-embra/icon-tick.png");
  const maps = useTexture({
    map: "/3d/card-embra/woman.png",
    displacementMap: "/3d/card-embra/woman-depth.webp",
  });
  const texture = useTexture(
    "/3d/card-embra/band-embra.png",
  );
  const qrCodeTexture = useTexture(
    'data:image/png;base64,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'
  );


  const uniforms = useMemo(
    () => ({
      uTexture: { value: nodes.hand.material },
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1.0, 1.0) }, // Intensidade da distorção
      u_speed: { value: 1.0 },
      u_wave_intensity: { value: 5.5 },
      u_color_shift: { value: 0.7 },
    }),
    []
  );

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: uniforms,
        side: THREE.FrontSide,
        transparent: true,
      }),
    [vertex, fragment, uniforms]
  );

  const qrCodeMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({
      color: "white",
      side: THREE.FrontSide,
      transparent: true,
      map: qrCodeTexture,
    }),
    [src]
  )

  useEffect(() => {
    return () => {
      shaderMaterial.dispose();
    };
  }, [shaderMaterial]);

  useLayoutEffect(() => {
    for (const key in maps) {
      maps[key].anisotropy = 8; // Set anisotropy for better quality
    }

    maps.displacementMap.flipY = true;
    maps.displacementMap.colorSpace = THREE.NoColorSpace;
    maps.displacementMap.minFilter = THREE.LinearFilter;
    maps.displacementMap.magFilter = THREE.LinearFilter;
    maps.displacementMap.generateMipmaps = true;
    maps.displacementMap.wrapS = maps.displacementMap.wrapT =
      THREE.ClampToEdgeWrapping;
  }, [maps]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);

      dir.copy(vec).sub(state.camera.position).normalize();

      vec.add(dir.multiplyScalar(state.camera.position.length()));

      [card, j1, j2, fixed].forEach((ref) => ref.current?.wakeUp());

      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current) {
      // Fix most of the jitter when over pulling the card
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation(),
          );

        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())),
        );

        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        );
      });

      // Calculate catmul curve
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());

      // Tilt it back towards the screen
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });

      band.current.geometry.setPoints(curve.getPoints(64));
      band.current.geometry.setDrawRange(6, Infinity);
    }

    // Smoothly rotate the visual card group towards its target orientation
    if (cardGroup.current) {
      const targetY = flipped ? Math.PI : 0;
      cardGroup.current.rotation.y = THREE.MathUtils.lerp(
        cardGroup.current.rotation.y,
        targetY,
        0.1,
      );
    }

    if (holoRef.current && holoRef.current.material) {
      holoRef.current.material.uniforms.u_time.value =
        (state.camera.position.x +
          state.camera.position.y +
          (state.clock.getElapsedTime() * 0.1)) *
        3.0;
    }

    // materials.needsUpdate = true;
  });

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== "Enter" && e.code !== "Space") return;
      // Canvas is the interactive element; ensure it is focused
      const canvas = document.getElementById("badgeCanvas");
      if (document.activeElement === canvas) {
        setFlipped((f) => !f);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />

          <group
            ref={cardGroup}
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              if (downPos.current) {
                const dist = Math.hypot(
                  e.clientX - downPos.current.x,
                  e.clientY - downPos.current.y,
                );

                if (dist <= DRAG_THRESHOLD) {
                  setFlipped((f) => !f);
                }
              }

              downPos.current = null;
              drag(null);
            }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId);

              downPos.current = { x: e.clientX, y: e.clientY };

              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation())),
              );
            }}
          >

            <group>
              <mesh
                ref={holoRef}
                geometry={nodes.hand.geometry}
                material={shaderMaterial}
                position={[0.282, 0.967, 0.006]}
                rotation={[Math.PI / 2, 0.03, 0]}
              />

              <group position={[-0.295, 0.8, 0.01]}>
                <Text
                  color="white"
                  maxWidth={0.1}
                  fontSize={0.095}
                  fontWeight={700}
                  strokeWidth={0.001}
                  letterSpacing={-0.05}
                  anchorY="middle"
                  anchorX="left"
                  lineHeight={1}
                  material-toneMapped={false} // Prevents tone mapping
                  rotation={[Math.PI * 2, 0, 0]}
                  position={[0, 0, 0]}
                >
                  Lilian Cavalcante
                </Text>
              </group>

              <group position={[-0.295, 0.093, 0.01]} renderOrder={1}>
                <mesh position={[0, 0, 0.002]}>
                  <planeGeometry args={[0.035, 0.035]} />
                  <meshBasicMaterial
                    map={iconTick}
                    transparent
                    side={THREE.FrontSide}
                    depthTest={true}
                    depthWrite={false}
                  />
                </mesh>

                <Text
                  frustumCulled={false}
                  color="black"
                  fontSize={0.02}
                  letterSpacing={-0.05}
                  anchorY="middle"
                  anchorX="left"
                  lineHeight={0.1}
                  rotation={[Math.PI * 2, 0, 0]}
                  position={[0.02, 0.0015, 0]}
                >
                  Consultor Autorizado Embracon
                </Text>
              </group>

              <mesh
                ref={holoRef}
                geometry={nodes.bottom.geometry}
                material={shaderMaterial}
                position={[-0.295, 0.093, 0.0085]}
                rotation={[Math.PI / 2, 0, 0]}
              />
            </group>


            <group position={[-0.005, 0.655, 0.003]}>
              {/* Front side with portal */}
              <mesh castShadow receiveShadow geometry={nodes.card.geometry}>
                <MeshPortalMaterial side={THREE.FrontSide}>
                  <ambientLight intensity={9} />

                  <Float speed={0.5} floatingRange={[-0.0001, 0.0001]} floatIntensity={1}>
                    <HandFilled scale={3.5} position={[0.2, -1, -0.8]} opacity={0.02} />
                    <HandFilled scale={3} position={[-0.35, -1.1, -0.6]} opacity={1} />
                  </Float>

                  <mesh position={[0, -1.5, -3]} scale={10}>
                    <boxGeometry args={[10, 10, 0.1]} />
                    <shaderMaterial
                      vertexShader={vertexGradient}
                      fragmentShader={fragmentGradient}
                    />
                  </mesh>

                  <mesh position={[0, -0.28, 0.25]} scale={0.95}>
                    <planeGeometry
                      args={[
                        maps.map.image.width / maps.map.image.height,
                        1,
                        612,
                        612,
                      ]}
                    />
                    <meshStandardMaterial
                      {...maps}
                      side={0}
                      metalness={0.5}
                      displacementScale={0.105}
                      displacementBias={0.01}
                      flatShading={true}
                      transparent
                      opacity={1}
                      depthTest={true}
                      depthWrite={false}
                    />
                  </mesh>
                </MeshPortalMaterial>
              </mesh>

              {/* Back side with regular material */}
              <group position={[0, 0, -0.001]}>

                <group position={[0, -0.15, -0.01]} rotation={[0, Math.PI, 0]}>
                  <mesh>
                    <planeGeometry args={[0.45, 0.45]} />
                    <meshBasicMaterial color={"black"} />
                  </mesh>

                  <Text
                    frustumCulled={false}
                    color="black"
                    fontSize={0.025}
                    letterSpacing={-0.05}
                    anchorY="middle"
                    anchorX="center"
                    lineHeight={0.1}
                    position={[0, -0.25, 0]}
                  >
                    ACESSE O MEU PERFIL EMBRACON
                  </Text>
                </group>

                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.card.geometry}
                  material={materials.base}
                  position={[0, 0, -0.005]}
                />
              </group>
            </group>

            <mesh
              castShadow
              receiveShadow
              geometry={nodes.clamp.geometry}
              material={materials.metal}
            />

            <mesh
              castShadow
              receiveShadow
              geometry={nodes.clip.geometry}
              material={materials.metal}
            />
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={true}
          resolution={[width, height]}
          useMap
          map={texture}
          repeat={[-3, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}


function CameraAndBackground({ split }: { split: boolean }) {
  // Access R3F internals
  const { camera, scene } = useThree();
  const black = useRef(new THREE.Color("black"));
  const white = useRef(new THREE.Color("grey"));

  useFrame(() => {
    // Camera shift: move slightly left so object appears to the right half
    // const targetX = split ? -2.5 : 0;
    // camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    // camera.updateProjectionMatrix();

    // Background color fade – emulate lights turning on
    if (!scene.background || !(scene.background as any).isColor) {
      // console.log(scene.background)
      // scene.background = split ? black.current.clone() : white.current.clone();
    } else {
      // scene.background = black.current.clone();
      // scene.background = null;
    }
  });

  return null;
}
