// @ts-nocheck
"use client";

import {
  Environment,
  Lightformer,
  useGLTF,
  useTexture,
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
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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
      <CameraAndBackground split={split} />
      <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
        <Band cardImageUrl={cardImageUrl} newTexture={texture} />
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
  // References for the band and the joints
  const band = useRef(), fixed = useRef(), card = useRef() // prettier-ignore
  const j1 = useRef(), j2 = useRef(), j3 = useRef() // prettier-ignore
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3() // prettier-ignore
  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  };

  const { nodes, materials } = useGLTF(
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb",
  );

  const texture = useTexture(
    "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg",
  );

  const { width, height } = useThree((state) => state.size);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  // Holds the drag offset vector when dragging, null otherwise
  const [dragged, drag] = useState<THREE.Vector3 | null>(null);
  // Store initial pointer position to differentiate click vs drag
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const DRAG_THRESHOLD = 3; // px
  // Track whether the card is flipped to reveal the QR-code backside
  const [flipped, setFlipped] = useState(false);
  // Reference to the visual group inside the rigid-body so we can rotate it
  const cardGroup = useRef();
  const [hovered, hover] = useState(false);
  const cardTextureMapRef = useRef();

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]) // prettier-ignore

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

      // // Use only up to the second-to-last point:
      // const points = curve.getPoints(200);
      // // Remove the last N points (e.g., last 10 points)
      // const stablePoints = points.slice(19, points.length - 10);
      // band.current.geometry.setPoints(stablePoints);
      // band.current.geometry.boundingSphere.center.y = 1
      // console.log(band.current.geometry)
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

    materials.needsUpdate = true;
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;


  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  // If the consumer supplied a custom image, replace the GLB-embedded map
  useEffect(() => {

    cardTextureMapRef.current.map = newTexture
    cardTextureMapRef.currentneedsUpdate = true;

  }, [newTexture, cardTextureMapRef.current]);

  // Basic keyboard accessibility: toggle flip on Enter/Space when the canvas is focused
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
          // ARIA & keyboard accessibility are handled globally below
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                ref={cardTextureMapRef}
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>

            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
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
