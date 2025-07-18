import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from 'three';

export default function HolographicV4(camera) {
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
      #define PI 3.14159265359

      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_speed;
      uniform float u_wave_intensity;
      uniform float u_color_shift;
      varying vec2 vUv;

      // Smooth color mixing function
      vec3 palette(float t) {
        vec3 a = vec3(0.6, 0.5, 0.9); // base tone 
        vec3 b = vec3(0.142, 0.015, 0.02); // contrast
        vec3 c = vec3(1.0, .0, 1.0); // frequency
        vec3 d = vec3(0.0, 0.0, 0.0); // phase shift
        
        return a + b * cos((3.14159 * 2.0) * (c * t + d));
      }

      void main() {
        vec2 uv = vUv;
        vec2 center = uv-vec2(0.5, 0.5);

        // Create flowing wave patterns
        float time = u_time * u_speed * 0.3;
        
        float wave1 = sin(uv.x * 1.0 + time * 2.0) * 0.2;
        float wave2 = cos(uv.y + time * 2.0) * 0.35;
        float wave3 = sin((uv.x + uv.y) * 5.2 + time * 0.5) * 0.35;
        float wave4 = sin((uv.x + uv.y) * 0.5 + time * 0.5) * 0.5;

        float combined_wave = (wave1 * wave2 * wave3) * 50.0;

        //distance from center
        float dist = distance(uv, center);

        // Create color flow
        float color_time = time * 2.5 + combined_wave + dist * 5.5;
        color_time *= u_color_shift;
        
        // Generate base colors
        vec3 color1 = palette(color_time);
        vec3 color2 = palette(color_time + 10.0);
        vec3 color3 = palette(color_time * 4.0);

        vec3 final_color = mix(color1, color2, 10.0);
        final_color = mix(final_color, color3, 0.0);

        //brightness
        float brightness = 1.75 + sin(combined_wave + time * 0.5) * 0.1;
        final_color *= brightness;
        
        gl_FragColor = vec4(final_color, 1.0);
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
