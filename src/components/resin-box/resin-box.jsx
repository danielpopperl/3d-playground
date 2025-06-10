import { useTexture } from "@react-three/drei";
import { GUI } from "lil-gui";
import { useEffect, useMemo, useRef } from "react";

export default function ResinBox() {
  const boxRef = useRef();
  const boxRef2 = useRef();
  const lightRef = useRef();

  const texture = useTexture("/test3.jpg");

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      iTime: { value: 5 },
    }),
    [texture]
  );

  const vertexShader = `
        uniform float iTime;
        uniform vec2 iResolution;

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

  const fragmentShader = `
        uniform sampler2D uTexture;
        uniform float iTime;
        uniform vec2 iResolution;

        const float PI = 3.14159265359;

        float scene(vec3 position) {
          float height = 0.3;
          return length(position) - height;
        }

        vec3 getNormal(vec3 pos, float smoothness) {
          vec3 n;
          vec2 dn = vec2(smoothness, 0.0);
          n.x = scene(pos + dn.xyy) - scene(pos - dn.xyy);
          n.y = scene(pos + dn.yxy) - scene(pos - dn.yxy);
          n.z = scene(pos + dn.yyx) - scene(pos - dn.yyx);
          return normalize(n);
        }

        float raymarch(vec3 position, vec3 direction) {
          float total_distance = 0.0;
          for(int i = 0; i < 32; ++i) {
            float result = scene(position + direction * total_distance);
            if(result < 0.005) {
              return total_distance;
            }
            total_distance += result;
          }
          return -1.0;
        }

        mat3 calcLookAtMatrix(in vec3 ro, in vec3 ta, in float roll) {
          vec3 ww = normalize(ta - ro);
          vec3 uu = normalize(cross(ww, vec3(sin(roll), cos(roll), 0.0)));
          vec3 vv = normalize(cross(uu, ww));
          return mat3(uu, vv, ww);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / 1080.0;
          uv -= vec2(0.5 * 1920.0 / 1080.0, 0.5);
          uv.y *= -1.0;
          vec3 origin = vec3(sin(1.0 * 0.1) * 2.5, 0.0, cos(1.0 * 0.1) * 2.5);
          mat3 camMat = calcLookAtMatrix(vec3(3.0,1.0,1.0), vec3(0.0), 0.0);
          vec3 direction = normalize(camMat * vec3(uv, 2.5));
          
          float dist = raymarch(origin, direction);
          
          if (dist < 0.0) {
              vec4 textureColor = texture2D(uTexture, uv);
              gl_FragColor = textureColor;
          } else {
              vec3 fragPosition = origin + direction * dist;
              vec3 N = getNormal(fragPosition, 0.01);
              vec4 ballColor = vec4(1.0, 0.8, 0.0, 1.0) * 0.75;
              vec3 ref = reflect(direction, N);
              
              float P = PI / 5.0;
              float starVal = (1.0 / P) * (P - abs(mod(atan(uv.x, uv.y) + PI, (2.0 * P)) - P));
              vec4 starColor = (distance(uv, vec2(0.0, 0.0)) < 0.06 - (starVal * 0.03)) ? vec4(2.8, 1.0, 0.0, 1.0) : vec4(0.0);
              
              float rim = max(0.0, (0.7 + dot(N, direction)));
              
              vec3 refr = refract(direction, N, 0.7);
              
              vec4 textureTex = texture2DProj(uTexture, vec4(ref, 2.0));
              vec4 textureTexRefr = texture2DProj(uTexture, vec4(refr, 1.0));

              gl_FragColor = textureTexRefr * ballColor + 
              (vec4(0.6, 0.2, 0.0, 1.0) * max(0.0, 1.0-distance(uv * 4.0, vec2(0.0,0.0)))) * 4.0  * (0.2 + abs(sin(1.0)) * 0.8) +
              starColor + 
              textureTex * 0.3 + 
              vec4(rim, rim * 0.5, 0.0, 1.0);
         }
        }
      `;

  useEffect(() => {
    const gui = new GUI();

    if (boxRef.current && window !== "undefined") {
      gui.add(boxRef.current, "roughness", 0, 1, 0.001).name("Roughness");
      gui.add(boxRef.current, "transmission", 0, 2, 0.001).name("Transmission");
      gui.add(boxRef.current, "ior", 1, 5, 0.001).name("ior");
      gui.add(boxRef.current, "iridescence", 0, 1, 0.001).name("Iridescence");
      gui.add(boxRef.current, "thickness", 0, 5, 0.001).name("Thickness");
      gui.add(boxRef.current, "clearcoat", 0, 10, 0.001).name("Clear Coat");
      gui
        .add(boxRef.current, "clearcoatRoughness", 0, 1, 0.001)
        .name("Clear Coat Roughness");
      gui.add(boxRef.current, "opacity", 0, 1, 0.001).name("Opacity");
    }

    if (boxRef2.current && window !== "undefined") {
      gui.add(boxRef2.current, "roughness", 0, 1, 0.001).name("Roughness2");
      gui
        .add(boxRef2.current, "transmission", 0, 2, 0.001)
        .name("Transmission2");
      gui.add(boxRef2.current, "ior", 1, 5, 0.001).name("ior2");
      gui.add(boxRef2.current, "iridescence", 0, 1, 0.001).name("Iridescence2");
      gui.add(boxRef2.current, "thickness", 0, 5, 0.001).name("Thickness2");
      gui.add(boxRef2.current, "clearcoat", 0, 10, 0.001).name("Clear Coat2");
      gui
        .add(boxRef2.current, "clearcoatRoughness", 0, 1, 0.001)
        .name("Clear Coat Roughness2");
      gui.add(boxRef2.current, "opacity", 0, 1, 0.001).name("Opacity2");
    }
  }, [boxRef.current, boxRef2.current]);

  return (
    <group>
      <fog attach="fog" args={["blue", 0, 20]} />

      <mesh position={[0, 0, 0]}>
        <ambientLight intensity={2} />
        <directionalLight position={[0, 0, 2]} intensity={1} color={"blue"} />
        <directionalLight
          position={[0.5, 0, 5]}
          intensity={1}
          color={"yellow"}
        />
        <directionalLight
          ref={lightRef}
          position={[0.25, 0, 2]}
          intensity={1}
          color={"green"}
        />

        {lightRef.current && (
          <directionalLightHelper args={[lightRef.current, 2, 0xff0000]} />
        )}
      </mesh>

      <mesh position={[-5, 0, -5]}>
        <boxGeometry args={[30, 50, 1]} />
        {/* <meshPhysicalMaterial
          ref={boxRef}
          side={1}
          opacity={1} // Degree of influence of lighting on the HTML
          transparent
          roughness={0.86} // Degree of roughness of the surfac
          transmission={1.253}
          ior={4.587}
          iridescence={1}
          thickness={0.366}x
          clearcoat={6.878}
          clearcoatRoughness={0.622}
        /> */}
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={2}
        />
      </mesh>

      {/* <Batman />

      <mesh position={[0, 0, 0.017]}>
        <boxGeometry args={[2.95, 4.95, 0.95]} />
        <meshPhysicalMaterial
          ref={boxRef2}
          side={2}
          transparent
          opacity={0.221} // Degree of influence of lighting on the HTML
          roughness={0.688} // Degree of roughness of the surfac
          transmission={1.13}
          ior={3.112}
          iridescence={1}
          thickness={1.718}
          clearcoat={5.894}
          clearcoatRoughness={0.221}
          iridescenceIOR={2}
        />
      </mesh> */}
    </group>
  );
}
