import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export default function useTextureOptimization(scene) {
  const { gl } = useThree()
  
  useEffect(() => {
    if (!scene) return
    
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy()
    
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        
        materials.forEach(material => {
          // Common texture properties to optimize
          const textureProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']
          
          textureProps.forEach(prop => {
            if (material[prop] && material[prop].isTexture) {
              material[prop].anisotropy = maxAnisotropy
              material[prop].minFilter = THREE.LinearFilter
              material[prop].magFilter = THREE.LinearFilter

              console.log(1)
            }
          })
        })
      }
    })
  }, [scene, gl])
}
