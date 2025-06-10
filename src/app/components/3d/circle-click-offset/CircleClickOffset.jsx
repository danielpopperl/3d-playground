import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react";
import * as THREE from 'three'

export default function CircleClickOffset() {
    const circleRef = useRef();
    const mouseYaw = useRef(0);
    const mousePitch = useRef(0);

    const { scene, camera, gl } = useThree();

    const handleMouseMove = (event) => {
        event.preventDefault();
        event.stopPropagation();

        mouseYaw.current -= event.movementX;

        mousePitch.current -= event.movementY;
        mousePitch.current = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, mousePitch.current)
        );
    };

    useEffect(() => {
        gl.domElement.addEventListener("mousemove", handleMouseMove);

        return () => {
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    useFrame(({pointer }) => {        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(pointer.x, pointer.y);

        raycaster.setFromCamera(mouse, camera);

        const intersectObjPos = raycaster.intersectObjects([circleRef.current]);
        
        if (intersectObjPos[0]) {
            const intersectObj = intersectObjPos[0].point;
            const intersectObjWorldPos = intersectObjPos[0].object.position;
            console.log(intersectObj.clone().sub(intersectObjWorldPos).multiplyScalar(0.50))

        }
    })

    return (
        <group scale={1}>
            <mesh ref={circleRef} position={[0, 5, 0]}>
                <circleGeometry args={[2, 32]} />
                <meshBasicMaterial color={"red"} />
            </mesh>
        </group>
    )
}