import { useTexture } from "@react-three/drei";
import GUI from "lil-gui";
import { useEffect, useMemo, useRef } from "react";

export default function Sphere() {
  const lightRef = useRef();
  const boxRef = useRef();
  const boxRef2 = useRef();
  const imageRef = useRef();
  const cylRef = useRef();

  const texture = useTexture("/test.jpg");
  //   const texture = useLoader(TextureLoader, "/test.jpg");

  useEffect(() => {
    const gui = new GUI();

    if (lightRef.current) {
      gui.add(lightRef.current.position, "x", -10, 10, 0.001).name("light");
    }

    if (imageRef.current) {
      gui.add(imageRef.current.position, "z", -10, 10, 0.0001).name("imagem");
    }

    if (boxRef.current && window !== "undefined") {
      gui.add(boxRef.current, "roughness", 0, 1, 0.001).name("Roughness");
      gui.add(boxRef.current, "transmission", 0, 2, 0.001).name("Transmission");
      gui.add(boxRef.current, "ior", 1, 5, 0.001).name("ior");
      gui.add(boxRef.current, "iridescence", 0, 1, 0.001).name("Iridescence");
      gui.add(boxRef.current, "thickness", 0, 50, 0.001).name("Thickness");
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
      gui.add(boxRef2.current, "thickness", 0, 50, 0.001).name("Thickness2");
      gui.add(boxRef2.current, "clearcoat", 0, 10, 0.001).name("Clear Coat2");
      gui
        .add(boxRef2.current, "clearcoatRoughness", 0, 1, 0.001)
        .name("Clear Coat Roughness2");
      gui.add(boxRef2.current, "opacity", 0, 1, 0.001).name("Opacity2");
    }

    // if (cylRef.current) {
    //   console.log(cylRef.current.parameters);
    //   gui
    //     .add(cylRef.current.parameters, "radialSegments", 0, 64, 1)
    //     .name("radialSegments");
    //   gui
    //     .add(cylRef.current.parameters, "heightSegments", 0, 64, 1)
    //     .name("heightSegments");
    // }
  }, [lightRef.current, imageRef.current, boxRef.current, boxRef2.current]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
    }),
    [texture]
  );

  /*glsl*/
  const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = `
    uniform sampler2D uTexture;
    varying vec2 vUv;
    void main() {
        float visibility = step(0.2, vUv.x);
        vec4 texColor = texture2D(uTexture, vUv);
        gl_FragColor = texColor * visibility;
    }
  `;

  return (
    <group>
      <mesh>
        {/* <ambientLight intensity={2} /> */}
        <spotLight
          ref={lightRef}
          position={[-5, 0, 15]}
          intensity={700}
          color={"white"}
        />

        {lightRef.current && (
          <spotLightHelper args={[lightRef.current, 2, 0xff0000]} />
        )}
      </mesh>

      {/* LENTICULAR IMAGEM */}
      {/* <mesh ref={imageRef} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20, 10]} />
        <meshPhongMaterial map={texture} reflectivity={4} alphaHash={false} />
      </mesh> */}

      {texture && (
        <mesh>
          <planeGeometry args={[10, 10]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
          />
        </mesh>
      )}

      {/* <mesh ref={imageRef} position={[0, 0, 0]}>
        <planeGeometry args={[1, 10]} />
        <meshPhongMaterial reflectivity={4} alphaHash={false} color={"blue"} />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <planeGeometry args={[1, 10]} />
        <meshPhongMaterial reflectivity={4} alphaHash={false} color={"red"} />
      </mesh> */}

      {/* <mesh position={[0, 0, 0]} rotation={[0, -1.2, 0]}>
        <cylinderGeometry
          ref={cylRef}
          args={[0.5, 0.5, 10, 47, 42, true, 6, 3]}
        />
        <meshPhysicalMaterial
          ref={boxRef}
          side={2}
          opacity={1} // Degree of influence of lighting on the HTML
          transparent
          roughness={0} // Degree of roughness of the surfac
          transmission={1.262}
          ior={1}
          iridescence={0}
          thickness={0.366}
          clearcoat={6.878}
          clearcoatRoughness={0.622}
        />
      </mesh>
      <mesh position={[1, 0, 0]} rotation={[0, -1.2, 0]}>
        <cylinderGeometry
          ref={cylRef}
          args={[0.5, 0.5, 10, 47, 42, true, 6, 3]}
        />
        <meshPhysicalMaterial
          ref={boxRef2}
          side={2}
          opacity={1} // Degree of influence of lighting on the HTML
          transparent
          roughness={0} // Degree of roughness of the surfac
          transmission={1.262}
          ior={1}
          iridescence={0}
          thickness={0.366}
          clearcoat={6.878}
          clearcoatRoughness={0.622}
        />
      </mesh> */}

      {/* <mesh position={[-9.2, 0, 0]} rotation={[0, Math.PI * 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 20, 47, 42, true, 6, 3]} />
        <meshPhysicalMaterial
          ref={boxRef2}
          side={2}
          opacity={1} // Degree of influence of lighting on the HTML
          transparent
          roughness={0.86} // Degree of roughness of the surfac
          transmission={1.253}
          ior={4.587}
          iridescence={1}
          thickness={0.366}
          clearcoat={6.878}
          clearcoatRoughness={0.622}
        />
      </mesh>

      <mesh position={[-8.2, 0, 0]} rotation={[0, Math.PI * 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 20, 47, 42, true, 6, 3]} />
        <meshPhysicalMaterial
          ref={boxRef2}
          side={2}
          opacity={1} // Degree of influence of lighting on the HTML
          transparent
          roughness={0.86} // Degree of roughness of the surfac
          transmission={1.253}
          ior={4.587}
          iridescence={1}
          thickness={0.366}
          clearcoat={6.878}
          clearcoatRoughness={0.622}
        />
      </mesh> */}

      {/* {Array.from({ length: 110 }, (_, index) => index + 1).map((qtd, idx) => (
        <mesh
          position={[9 - (idx - idx * 0.819), 0, 0.2]}
          rotation={[0, Math.PI * 0.51, 0]}
          key={idx}
        >
          <cylinderGeometry
            ref={cylRef}
            args={[0.75, 0.75, 30, 30, 100, false, 6, 3]}
          />
          <meshPhysicalMaterial
            side={2}
            opacity={1} // Degree of influence of lighting on the HTML
            transparent
            roughness={0.27} // Degree of roughness of the surfac
            transmission={1.009}
            ior={1.096}
            iridescence={0}
            thickness={41.149}
            clearcoat={6.878}
            clearcoatRoughness={0.622}
          />
        </mesh>
      ))} */}
    </group>
  );
}
