import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export default function Artifact() {
  const mesh = useRef<THREE.Mesh>(null)
  const found = useGameStore(s => s.artifactFound)
  const request = useGameStore(s => s.interactRequested)
  const collect = useGameStore(s => s.collectArtifact)
  const setMessage = useGameStore(s => s.setMessage)

  useEffect(() => {
    if (request > 0 && !found) {
      // Player starts at z=4; altar is at z=-5.5.
      // The action is intentionally proximity-gated.
      const playerZ = (window as any).__osirisPlayerZ ?? 4
      const playerX = (window as any).__osirisPlayerX ?? 0
      if (Math.hypot(playerX, playerZ + 5.5) < 3.2) collect()
      else setMessage('Move closer to the memory fragment.')
    }
  }, [request, found, collect, setMessage])

  useFrame((state) => {
    if (mesh.current && !found) {
      mesh.current.rotation.y += 0.012
      mesh.current.position.y = 1.55 + Math.sin(state.clock.elapsedTime * 1.5) * 0.12
    }
  })
  if (found) return null
  return <mesh ref={mesh} position={[0, 1.55, -5.5]} rotation={[0.2, 0.4, 0.15]}>
    <octahedronGeometry args={[0.72, 0]} />
    <meshStandardMaterial color="#49d9ff" emissive="#008fc9" emissiveIntensity={2.5} metalness={0.6} roughness={0.18} />
  </mesh>
}