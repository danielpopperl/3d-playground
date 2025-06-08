import { useGLTF } from "@react-three/drei";

export function BasketBallAssets() {
  const { nodes, materials } = useGLTF('/3d/basket-ball/scene.gltf');
  
  return {
    geometry1: nodes.Object_4.geometry,
    material1: materials.Bola,
    geometry2: nodes.Object_5.geometry,
    material2: materials.Linhas,
  };
}