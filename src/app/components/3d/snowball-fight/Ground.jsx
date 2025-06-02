import { Box } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export default function Ground() {
  return (
    // GROUND
    <group name="base" rotation={[-Math.PI * 0.5, 0, 0]}>
      <RigidBody type="fixed">
        <Box args={[50, 50, 1]}>
          <meshStandardMaterial side={2} color="red" />
        </Box>
      </RigidBody>
    </group>
  )
}