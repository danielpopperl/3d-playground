// @ts-nocheck
"use client";

import fragmentGradient from "!!raw-loader!../../../shaders/gradient/fragment.glsl";
import vertexGradient from "!!raw-loader!../../../shaders/gradient/vertex.glsl";
import fragment from "!!raw-loader!../../../shaders/holographic/fragment.glsl";
import vertex from "!!raw-loader!../../../shaders/holographic/vertex.glsl";
import {
  Environment,
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
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { HandFilled } from "./HandFilled";

// import FollowLight from "./FollowLight";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function CardEmbra({
  cardImageUrl = null,
  split = false,
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
      camera={{ position: [0, 0, 13], fov: 25 }}
      style={{ outline: "none", background: "#500" }}
      aria-label="Consultant badge – press Enter or Space to flip"
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;    // se já usa r152+
        gl.toneMapping = THREE.LinearToneMapping;      // opcional
      }}
    >
      <ambientLight intensity={Math.PI} />

      {/* Drive camera position and background color transitions */}
      {/* <CameraAndBackground split={split} />
       */}

      <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
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
  const band = useRef(), fixed = useRef(), card = useRef(), tRef = useRef() // prettier-ignore
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
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg",
  );

  const uniforms = useMemo(
    () => ({
      uTexture: { value: nodes.bottom.material },
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

    if (tRef.current && tRef.current.material) {
      tRef.current.material.uniforms.u_time.value =
        (state.camera.position.x +
          state.camera.position.y) *
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
                castShadow
                receiveShadow
                geometry={nodes.hand.geometry}
                material={shaderMaterial}
                position={[0.282, 0.967, 0.006]}
                rotation={[Math.PI / 2, 0.03, 0]}
              />

              <group position={[-0.295, 0.8, 0.01]}>
                <Text
                  color="white"
                  maxWidth={0.1}
                  fontSize={0.09}
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
                castShadow
                receiveShadow
                ref={tRef}
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

                  {/* <Float floatingRange={[0.1, 0.2]}> */}
                  <HandFilled scale={3.5} position={[0.2, -1, -0.8]} opacity={0.02} />
                  <HandFilled scale={3} position={[-0.35, -1.1, -0.6]} opacity={1} />
                  {/* </Float> */}
                  <mesh position={[0, -1.5, -3]} scale={10}>
                    <boxGeometry args={[10, 10, 0.1]} />
                    <shaderMaterial
                      vertexShader={vertexGradient}
                      fragmentShader={fragmentGradient}
                    />
                  </mesh>

                  <mesh position={[0, -0.28, -0.25]} scale={0.95}>
                    <planeGeometry
                      args={[
                        maps.map.image.width / maps.map.image.height,
                        1,
                        612,
                        612,
                      ]}
                    />
                    <meshPhysicalMaterial
                      {...maps}
                      side={1}
                      // metalness={0.2}
                      displacementScale={0.105}
                      displacementBias={0.01}
                      flatShading={true}
                      transparent
                      opacity={1}
                      depthTest={true}
                      depthWrite={false}
                      wireframe
                    />
                  </mesh>
                </MeshPortalMaterial>
              </mesh>

              {/* Back side with regular material */}
            </group>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.card.geometry}
              material={materials.base}
              position={[0, 0, -0.005]}
            />

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
  const white = useRef(new THREE.Color("white"));

  useFrame(() => {
    // Camera shift: move slightly left so object appears to the right half
    const targetX = split ? -2.5 : 0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.updateProjectionMatrix();

    // Background color fade – emulate lights turning on
    if (!scene.background || !(scene.background as any).isColor) {
      scene.background = split ? white.current.clone() : black.current.clone();
    } else {
      const bgColor = scene.background as THREE.Color;
      const targetColor = split ? white.current : black.current;
      bgColor.lerp(targetColor, 1);
    }
  });

  return null;
}
