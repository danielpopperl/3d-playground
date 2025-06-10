import { useGLTF } from "@react-three/drei";

export function BasketBallAssets() {
  const { nodes, materials } = useGLTF("/3d/basket-ball/scene.gltf");

  // Ensure nodes and materials are loaded before accessing
  if (!nodes || !materials || !nodes.Object_4 || !nodes.Object_5) {
    return null;
  }

  return {
    geometry1: nodes.Object_4.geometry,
    material1: materials.Bola,
    geometry2: nodes.Object_5.geometry,
    material2: materials.Linhas,
  };
}

// Hook for using basketball assets in components
export function useBasketBallAssets() {
  const { nodes, materials } = useGLTF("/3d/basket-ball/scene.gltf");

  // Return loading state and assets
  const isLoaded = !!(nodes && materials && nodes.Object_4 && nodes.Object_5);

  const assets = isLoaded
    ? {
        geometry1: nodes.Object_4.geometry,
        material1: materials.Bola,
        geometry2: nodes.Object_5.geometry,
        material2: materials.Linhas,
      }
    : null;

  return { assets, isLoaded };
}
