import { useFrame } from "@react-three/fiber"
import GUI from "lil-gui";
import { useEffect, useRef } from "react";
import { SpotLightHelper } from "three";

export default function Lights() {
    const light1Ref = useRef();
    const lightHelperRef = useRef();
    const lookAtTarget = useRef({ x: 0, y: 0, z: 0 });

    useFrame(() => {
        if (lightHelperRef.current) lightHelperRef.current.update()
    })

    useEffect(() => {
        const gui = new GUI();

        if (light1Ref.current && window !== "undefined") {
            light1Ref.current.lookAt(0, 10, 0)

            if (!lightHelperRef.current && light1Ref.current) {
                lightHelperRef.current = new SpotLightHelper(light1Ref.current);
                // light1Ref.current.add(lightHelperRef.current);
            }

            gui.add(light1Ref.current, "intensity", 0, 100, 1).name("intensity");
            gui.add(light1Ref.current, "distance", -100, 100, 0.00001).name("distance");
            gui.add(light1Ref.current, "angle", 0, 10, 0.0001).name("angle");
            gui.add(light1Ref.current, "penumbra", 0, 1, 0.001).name("penumbra");
            gui.add(light1Ref.current, "decay", 0, 5, 0.001).name("decay");
            gui.add(light1Ref.current.position, "x", -20, 20, 0.00001).name("x");
            gui.add(light1Ref.current.position, "y", -20, 20, 0.00001).name("y");
            gui.add(light1Ref.current.position, "z", -20, 20, 0.00001).name("z");

            // const lookAtFolder = gui.addFolder('Look At Target');
            // lookAtFolder.add(lookAtTarget.current, 'x', -20, 20, 0.00001)
            //     .name('Target X')
            //     .onChange((value) => {
            //         lookAtTarget.current.x = value
            //         light1Ref.current.lookAt(lookAtTarget.current.x, lookAtTarget.current.y, lookAtTarget.current.z);
            //     });

            // lookAtFolder.add(lookAtTarget.current, 'y', -20, 20, 0.00001)
            //     .name('Target Y')
            //     .onChange((value) => {
            //         lookAtTarget.current.y = value
            //         light1Ref.current.lookAt(lookAtTarget.current.x, value, lookAtTarget.current.z);
            //     });

            // lookAtFolder.add(lookAtTarget.current, 'z', 0, 20, 0.00001)
            //     .name('Target Z')
            //     .onChange((value) => {
            //         lookAtTarget.current.z = value
            //         return light1Ref.current.lookAt(lookAtTarget.current.x, lookAtTarget.current.y, value);
            //     })
            // light1Ref.current.lookAt(-6.65029, 10, 5.4)
        }


        return () => {
            gui.destroy(); // Destroy GUI
            if (light1Ref.current && lightHelperRef.current) {
                light1Ref.current.remove(lightHelperRef.current);
                lightHelperRef.current.dispose();
                lightHelperRef.current = null; // Clear the ref
            }
        }
    }, [])

    return (
        <>
            {/* LIGHTS */}
            <ambientLight args={["white", 1]} />

            <group>
                <spotLight
                    ref={light1Ref}
                    color={"white"}
                    position={[-8.02706, 12.33, 5.74]}      // em cima da quadra
                    angle={0.9}        // abertura do cone
                    penumbra={1}             // suavidade da borda
                    intensity={150}              // força da luz
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <spotLight
                    ref={light1Ref}
                    color={"white"}
                    position={[-8.02706, 12.33, -3.74]}      // em cima da quadra
                    angle={0.9}        // abertura do cone
                    penumbra={1}             // suavidade da borda
                    intensity={150}              // força da luz
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />

                <spotLight
                    ref={light1Ref}
                    color={"white"}
                    position={[5.02706, 12.33, 5.74]}      // em cima da quadra
                    angle={0.9}        // abertura do cone
                    penumbra={1}             // suavidade da borda
                    intensity={150}              // força da luz
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />

                <spotLight
                    ref={light1Ref}
                    color={"white"}
                    position={[5.02706, 12.33, -4.74]}      // em cima da quadra
                    angle={0.9}        // abertura do cone
                    penumbra={1}             // suavidade da borda
                    intensity={150}              // força da luz
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
            </group>

        </>
    )
}