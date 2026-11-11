import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export default function Player() {
  const group = useRef<THREE.Group>(null)
  const keys = useRef<Record<string, boolean>>({})
  const joystick = useGameStore(s => s.joystick)
  const stage = useGameStore(s => s.stage)

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true }
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useFrame((state, delta) => {
    if (!group.current || stage === 'intro') return
    const k = keys.current
    const forward = (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0) - joystick.y
    const sideways = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0) + joystick.x
    const direction = new THREE.Vector3(sideways, 0, forward)
    const moving = direction.lengthSq() > 0.01
    if (moving) {
      direction.normalize()
      group.current.position.x += direction.x * delta * 3.4
      group.current.position.z -= direction.z * delta * 3.4
      group.current.rotation.y = Math.atan2(direction.x, direction.z)
    }
    group.current.position.x = THREE.MathUtils.clamp(group.current.position.x, -8.4, 8.4)
    group.current.position.z = THREE.MathUtils.clamp(group.current.position.z, -9.2, 8.5)
    const bob = moving ? Math.sin(state.clock.elapsedTime * 11) * 0.055 : Math.sin(state.clock.elapsedTime * 2) * 0.018
    group.current.position.y = Math.abs(bob)
    ;(window as any).__osirisPlayerX = group.current.position.x
    ;(window as any).__osirisPlayerZ = group.current.position.z
    const target = new THREE.Vector3(group.current.position.x, 3.0, group.current.position.z + 6.8)
    state.camera.position.lerp(target, 1 - Math.exp(-4.5 * delta))
    state.camera.lookAt(group.current.position.x, 1.15, group.current.position.z - 1.8)
  })

  return <group ref={group} position={[0, 0, 4]}>
    {/* A readable, stylised desert explorer built from lightweight primitives. */}
    <mesh position={[0, 1.28, 0]} castShadow><capsuleGeometry args={[0.34, 0.9, 5, 10]} /><meshStandardMaterial color="#9a713d" roughness={0.88} /></mesh>
    <mesh position={[0, 2.02, 0]} castShadow><sphereGeometry args={[0.29, 18, 14]} /><meshStandardMaterial color="#8c5935" roughness={0.9} /></mesh>
    <mesh position={[0, 2.18, 0]} castShadow><cylinderGeometry args={[0.32, 0.34, 0.16, 12]} /><meshStandardMaterial color="#bd914b" roughness={0.8} /></mesh>
    <mesh position={[0, 1.77, 0.02]} castShadow><boxGeometry args={[0.52, 0.16, 0.43]} /><meshStandardMaterial color="#d2b06d" roughness={0.8} /></mesh>
    <mesh position={[-0.43, 1.22, 0]} rotation={[0, 0, -0.12]} castShadow><capsuleGeometry args={[0.105, 0.58, 4, 8]} /><meshStandardMaterial color="#b68b50" /></mesh>
    <mesh position={[0.43, 1.22, 0]} rotation={[0, 0, 0.12]} castShadow><capsuleGeometry args={[0.105, 0.58, 4, 8]} /><meshStandardMaterial color="#b68b50" /></mesh>
    <mesh position={[-0.16, 0.38, 0]} castShadow><capsuleGeometry args={[0.12, 0.55, 4, 8]} /><meshStandardMaterial color="#282a2d" /></mesh>
    <mesh position={[0.16, 0.38, 0]} castShadow><capsuleGeometry args={[0.12, 0.55, 4, 8]} /><meshStandardMaterial color="#282a2d" /></mesh>
    <mesh position={[0, 1.27, -0.28]} rotation={[0.08, 0, 0]} castShadow><coneGeometry args={[0.52, 1.5, 5]} /><meshStandardMaterial color="#49352b" roughness={0.95} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.57, 1.05, -0.1]}><cylinderGeometry args={[0.035, 0.035, 1.45, 8]} /><meshStandardMaterial color="#8a6334" metalness={0.5} /></mesh>
    <mesh position={[0.57, 1.82, -0.1]}><octahedronGeometry args={[0.13, 0]} /><meshStandardMaterial color="#48d7ff" emissive="#087da9" emissiveIntensity={1.7} /></mesh>
  </group>
}
