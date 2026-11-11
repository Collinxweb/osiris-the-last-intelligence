import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export default function Artifact() {
  const mesh = useRef<THREE.Mesh>(null)
  const request = useGameStore(s => s.interactRequested)
  const found = useGameStore(s => s.artifactFound)
  const stage = useGameStore(s => s.stage)
  const collect = useGameStore(s => s.collectArtifact)
  const setMessage = useGameStore(s => s.setMessage)

  useEffect(() => {
    if (request > 0 && stage === 'explore' && !found) {
      const x = (window as any).__osirisPlayerX ?? 0
      const z = (window as any).__osirisPlayerZ ?? 4
      if (Math.hypot(x, z + 5.5) < 3.25) collect()
      else setMessage('The fragment is ahead. Follow the blue light to the altar.')
    }
  }, [request, found, stage, collect, setMessage])

  useFrame((state, delta) => {
    if (mesh.current && !found) {
      mesh.current.rotation.y += delta * 0.65
      mesh.current.position.y = 1.65 + Math.sin(state.clock.elapsedTime * 1.5) * 0.16
    }
  })
  if (found) return null
  return <group position={[0, 1.55, -5.5]}>
    <mesh ref={mesh} rotation={[0.2, 0.4, 0.15]} castShadow>
      <octahedronGeometry args={[0.72, 0]} />
      <meshStandardMaterial color="#49d9ff" emissive="#008fc9" emissiveIntensity={2.5} metalness={0.6} roughness={0.18} />
    </mesh>
    <pointLight color="#20bfff" intensity={13} distance={5} />
  </group>
}
