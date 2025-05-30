import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

export default function Lenticular(camera) {
  const meshRef = useRef();

  const texture = useTexture("/test4.jpg");

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTimeX: { value: 0 },
      uDistortion: { value: 0.055 }, // Intensidade da distorção
      uLineHeight: { value: 60.0 }, // Altura das linhas (quantas linhas na tela)
      uSpeed: { value: 0.2 }, // Velocidade da animação
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
      uniform sampler2D uTexture;
      uniform float uTimeX;
      uniform float uDistortion;
      uniform float uLineHeight;
      uniform float uSpeed;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Calcula qual linha estamos (baseado na coordenada X)
        float lineIndexX = floor(uv.x * uLineHeight);

        // Verifica se a linha é par ou ímpar
        float isOddLineX = mod(lineIndexX, 2.0);

        // Cria o deslocamento horizontal
        float displacementX = sin((uTimeX * uSpeed) * uDistortion) * 2.5;

        // Linhas pares vão para direita, ímpares para esquerda
        if (isOddLineX < 0.5) {
          // Linha par - desloca para direita
          uv.x += displacementX;
        } else {
          // Linha ímpar - desloca para esquerda  
          uv.x -= displacementX;
        }

        // Clamp UV para evitar repetição indesejada
        uv.x = clamp(uv.x, 0.0, 1.0);

        // Amostra a textura com UV modificado
        vec4 textureColor = texture2D(uTexture, uv);

        gl_FragColor = textureColor;
      }
    `;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTimeX.value =
        camera.camera.current.object.position.x * 1.5;
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
      />
    </mesh>
  );
}
