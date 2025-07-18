import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from 'three';

export default function Circle(camera) {
  const meshRef = useRef();

  const texture = useTexture("/test4.jpg");

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1.0,1.0) }, // Intensidade da distorção
      u_speed: { value: 1.0 },
      u_wave_intensity: { value: 5.5 },
      u_color_shift: { value: .7 }
    }),
    [texture]
  );

  const vertexShader = `
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

  const fragmentShader = `
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 center = uv - vec2(0.5, 0.5);
        float radius = 3.0;

        // CIRCLE
        float color = 1.0 - smoothstep(0.1, 0.09, dot(center, center)*10.0);
        
        // SQUARE
        // float left = step(0.1, uv.x);
        // float bottom = step(0.1, uv.y);
        // vec2 topRight = step(vec2(0.1), 1.0-uv);
        // float color = (left * bottom * topRight.x * topRight.y);

        gl_FragColor = vec4(vec3(color), 1.0);
      }
    `;

  const clock = new THREE.Clock()

  useFrame((state) => {
    const c = clock.getElapsedTime();

    // if(!meshRef.current) return;

    if (meshRef.current) {
      meshRef.current.material.uniforms.u_time.value =
        (camera.camera.current.object.position.x + camera.camera.current.object.position.y) * 0.25;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={2}
        transparent
      />
    </mesh>
  );
}
