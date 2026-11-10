import { Canvas } from '@react-three/fiber'
import { ContactShadows, Stars } from '@react-three/drei'
import Environment from './Environment'
import Player from './Player'
import Artifact from './Artifact'

export default function World() {
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 3, 10], fov: 58 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <Environment />
    <Stars radius={55} depth={25} count={500} factor={2} saturation={0} fade speed={0.2} />
    <Player />
    <Artifact />
    <ContactShadows position={[0, -0.04, 0]} opacity={0.35} scale={20} blur={2.5} far={8} />
  </Canvas>
}