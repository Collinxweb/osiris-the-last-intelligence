import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export default function Player() {
  const group = useRef<THREE.Group>(null)
  const keys = useRef<Record<string, boolean>>({})
  const joystick = useGameStore(s => s.joystick)

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true }
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    const k = keys.current
    const forward = (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0) - joystick.y
    const sideways = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0) + joystick.x
    const direction = new THREE.Vector3(sideways, 0, forward)
    if (direction.lengthSq() > 0.01) {
      direction.normalize()
      group.current.position.x += direction.x * delta * 3.2
      group.current.position.z -= direction.z * delta * 3.2
      group.current.rotation.y = Math.atan2(direction.x, direction.z)
    }
    group.current.position.x = THREE.MathUtils.clamp(group.current.position.x, -8.2, 8.2)
    group.current.position.z = THREE.MathUtils.clamp(group.current.position.z, -10, 8)
    ;(window as any).__osirisPlayerX = group.current.position.x
    ;(window as any).__osirisPlayerZ = group.current.position.z
    const target = new THREE.Vector3(group.current.position.x, 2.8, group.current.position.z + 6.5)
    state.camera.position.lerp(target, 1 - Math.exp(-4 * delta))
    state.camera.lookAt(group.current.position.x, 1.1, group.current.position.z - 1.5)
  })

  return (
    <group ref={group} position={[0, 0, 4]}>
      {/* temporary stylized explorer placeholder; replace with animated GLB later */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <capsuleGeometry args={[0.38, 1.15, 5, 10]} />
        <meshStandardMaterial color="#171923" roughness={0.82} />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#0a0d14" metalness={0.25} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.25, -0.32]} rotation={[0.08, 0, 0]} castShadow>
        <coneGeometry args={[0.58, 1.5, 4]} />
        <meshStandardMaterial color="#a87832" metalness={0.5} roughness={0.55} />
      </mesh>
      <mesh position={[0.27, 1.35, -0.12]}>
        <boxGeometry args={[0.055, 0.85, 0.055]} />
        <meshStandardMaterial color="#4fc7ed" emissive="#147ca5" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}