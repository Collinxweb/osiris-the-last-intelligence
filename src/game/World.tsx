import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { CHALLENGES, LEVELS } from './levels'

// Stylized temple hall. Coordinates match levels.ts: altar at LEVELS.memory.altar,
// scarabs at LEVELS.scarab.spots. The player position is published on window
// every frame so Interactions.tsx can check proximity.

const SPEED = 4.2
const START: [number, number] = [0, 4]
const BOUNDS = { x: 12.5, zMin: -11.5, zMax: 13 }
const STONE = '#8a7356'
const SANDSTONE = '#b59a6a'
const GOLD = '#f0c060'

function useWallTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 512
    const g = c.getContext('2d')!
    g.fillStyle = '#6b5440'
    g.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(20,12,6,${0.12 + Math.random() * 0.2})`
      g.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 4, 2 + Math.random() * 4)
    }
    // Carved glyph-like marks: eyes, feathers, and ankhs in a grid.
    g.strokeStyle = 'rgba(30,18,8,0.75)'
    g.lineWidth = 5
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 6; row++) {
        const x = 40 + col * 120
        const y = 40 + row * 80
        if ((row + col) % 3 === 0) {
          g.beginPath(); g.arc(x + 30, y + 25, 14, 0, Math.PI * 2); g.stroke()
        } else if ((row + col) % 3 === 1) {
          g.beginPath(); g.moveTo(x + 30, y + 10); g.lineTo(x + 30, y + 60); g.stroke()
          g.beginPath(); g.moveTo(x + 14, y + 20); g.lineTo(x + 46, y + 20); g.stroke()
        } else {
          g.beginPath(); g.ellipse(x + 30, y + 35, 10, 26, 0.3, 0, Math.PI * 2); g.stroke()
        }
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(3, 2)
    return t
  }, [])
}

// Robed figure built from primitives. Front faces +z. Walks and idles.
function Player() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const pos = useRef(new THREE.Vector3(START[0], 0, START[1]))
  const heading = useRef(Math.PI) // start facing -z, toward the altar
  const walk = useRef(0)
  const speedMix = useRef(0)

  useFrame((state, dt) => {
    const { joystick, phase } = useGameStore.getState()
    const step = Math.min(dt, 0.05)
    const mx = phase === 'playing' ? joystick.x : 0
    const mz = phase === 'playing' ? joystick.y : 0
    const moving = Math.hypot(mx, mz) > 0.05

    if (moving) {
      pos.current.x += mx * SPEED * step
      pos.current.z += mz * SPEED * step
      heading.current = Math.atan2(mx, mz)
    }
    pos.current.x = THREE.MathUtils.clamp(pos.current.x, -BOUNDS.x, BOUNDS.x)
    pos.current.z = THREE.MathUtils.clamp(pos.current.z, BOUNDS.zMin, BOUNDS.zMax)

    speedMix.current = THREE.MathUtils.lerp(speedMix.current, moving ? 1 : 0, 0.15)
    walk.current += step * (moving ? 9 : 0)
    const t = state.clock.elapsedTime

    root.current.position.set(pos.current.x, 0, pos.current.z)
    root.current.rotation.y = heading.current
    body.current.position.y = Math.abs(Math.sin(walk.current)) * 0.06 * speedMix.current + Math.sin(t * 2) * 0.012 * (1 - speedMix.current)
    body.current.rotation.z = Math.sin(walk.current) * 0.03 * speedMix.current
    armL.current.rotation.x = Math.sin(walk.current) * 0.5 * speedMix.current + Math.sin(t * 1.4) * 0.03
    armR.current.rotation.x = -Math.sin(walk.current) * 0.5 * speedMix.current - Math.sin(t * 1.4) * 0.03

    ;(window as any).__osirisPlayerX = pos.current.x
    ;(window as any).__osirisPlayerZ = pos.current.z
  })

  return <group ref={root}>
    <group ref={body}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.44, 1.5, 18]} />
        <meshStandardMaterial color="#e8dcc0" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.98, 0.29]}>
        <boxGeometry args={[0.52, 0.13, 0.05]} />
        <meshStandardMaterial color="#2f6fa8" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial color="#8a5a3a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.84, 0]}>
        <boxGeometry args={[0.46, 0.22, 0.44]} />
        <meshStandardMaterial color="#e9c46a" metalness={0.3} roughness={0.4} />
      </mesh>
      <group ref={armL} position={[-0.36, 1.45, 0]}>
        <mesh position={[0, -0.34, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.7, 10]} />
          <meshStandardMaterial color="#e8dcc0" />
        </mesh>
      </group>
      <group ref={armR} position={[0.36, 1.45, 0]}>
        <mesh position={[0, -0.34, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.7, 10]} />
          <meshStandardMaterial color="#e8dcc0" />
        </mesh>
      </group>
    </group>
  </group>
}

function CameraRig() {
  const target = useRef(new THREE.Vector3())
  const look = useRef(new THREE.Vector3())
  useFrame((state) => {
    const p = (window as any)
    const x = p.__osirisPlayerX ?? START[0]
    const z = p.__osirisPlayerZ ?? START[1]
    target.current.set(x, 3.4, z + 6.2)
    look.current.set(x, 1.1, z - 1.5)
    state.camera.position.lerp(target.current, 0.12)
    state.camera.lookAt(look.current)
  })
  return null
}

function Pillar({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0, 2.5, 0]}>
      <cylinderGeometry args={[0.55, 0.65, 5, 18]} />
      <meshStandardMaterial color={SANDSTONE} roughness={0.85} />
    </mesh>
    <mesh position={[0, 5.1, 0]}>
      <boxGeometry args={[1.5, 0.3, 1.5]} />
      <meshStandardMaterial color={STONE} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[1.4, 0.4, 1.4]} />
      <meshStandardMaterial color={STONE} roughness={0.9} />
    </mesh>
  </group>
}

function Brazier({ x, z }: { x: number; z: number }) {
  const light = useRef<THREE.PointLight>(null!)
  const flame = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    const f = 0.85 + Math.sin(state.clock.elapsedTime * 13 + x * 3) * 0.1 + Math.sin(state.clock.elapsedTime * 7.3) * 0.05
    light.current.intensity = 5.5 * f
    flame.current.scale.set(1, f, 1)
  })
  return <group position={[x, 0, z]}>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.18, 0.32, 1.2, 12]} />
      <meshStandardMaterial color="#3a2c1c" roughness={0.9} />
    </mesh>
    <mesh ref={flame} position={[0, 1.45, 0]}>
      <sphereGeometry args={[0.3, 14, 12]} />
      <meshStandardMaterial color="#ffa640" emissive="#ff7a1a" emissiveIntensity={2.2} transparent opacity={0.9} />
    </mesh>
    <pointLight ref={light} position={[0, 1.8, 0.4]} color="#ff9a4a" distance={9} decay={2} />
  </group>
}

function Statue({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return <group position={[x, 0, z]} scale={scale}>
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[1.8, 0.8, 1.4]} />
      <meshStandardMaterial color={STONE} roughness={0.9} />
    </mesh>
    <mesh position={[0, 2.1, 0]}>
      <cylinderGeometry args={[0.5, 0.75, 2.6, 16]} />
      <meshStandardMaterial color={SANDSTONE} roughness={0.85} />
    </mesh>
    <mesh position={[0, 3.7, 0]}>
      <sphereGeometry args={[0.42, 18, 14]} />
      <meshStandardMaterial color={SANDSTONE} roughness={0.85} />
    </mesh>
    <mesh position={[0, 4.25, 0]}>
      <boxGeometry args={[0.8, 0.5, 0.7]} />
      <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
    </mesh>
  </group>
}

// Altar: pedestal, glowing ankh, and a floating memory orb. Dims once the memory is taken.
function Altar() {
  const [ax, az] = LEVELS.memory.altar
  const found = useGameStore(s => s.memoryFound)
  const orb = useRef<THREE.Mesh>(null!)
  const light = useRef<THREE.PointLight>(null!)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    orb.current.position.y = 2.2 + Math.sin(t * 1.6) * 0.18
    orb.current.rotation.y = t * 0.8
    light.current.intensity = (found ? 1.5 : 4) + Math.sin(t * 2) * 0.6
  })
  return <group position={[ax, 0, az]}>
    <mesh position={[0, 0.35, 0]}>
      <cylinderGeometry args={[1.5, 1.7, 0.7, 6]} />
      <meshStandardMaterial color={STONE} roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <cylinderGeometry args={[0.7, 0.9, 0.8, 6]} />
      <meshStandardMaterial color={SANDSTONE} roughness={0.8} />
    </mesh>
    <mesh position={[0, 1.6, 0]} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.2, 0.05, 8, 18]} />
      <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={found ? 0.5 : 1.6} />
    </mesh>
    <mesh ref={orb} position={[0, 2.2, 0]}>
      <octahedronGeometry args={[0.32, 0]} />
      <meshStandardMaterial color="#7fd8ff" emissive="#4fb8ff" emissiveIntensity={found ? 0.2 : 2.4} transparent opacity={found ? 0.35 : 0.95} />
    </mesh>
    <pointLight ref={light} position={[0, 2.3, 0.5]} color="#7fd8ff" distance={10} decay={2} />
  </group>
}

// Scarabs: shown only during the scarab challenge, removed as they are claimed.
function Scarabs() {
  const step = useGameStore(s => s.step)
  const claimed = useGameStore(s => s.scarabs)
  const active = CHALLENGES[step]?.id === 'scarab'
  if (!active) return null
  return <>
    {LEVELS.scarab.spots.map(spot => {
      if (claimed.includes(spot.id)) return null
      return <Scarab key={spot.id} x={spot.at[0]} z={spot.at[1]} />
    })}
  </>
}

function Scarab({ x, z }: { x: number; z: number }) {
  const body = useRef<THREE.Group>(null!)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    body.current.position.y = 0.35 + Math.sin(t * 2.4 + x) * 0.08
    body.current.rotation.y = t * 1.2
  })
  return <group position={[x, 0, z]}>
    <group ref={body}>
      <mesh scale={[1, 0.6, 1.3]}>
        <sphereGeometry args={[0.28, 14, 10]} />
        <meshStandardMaterial color="#d9a84a" emissive="#ffb84a" emissiveIntensity={1.4} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
    <pointLight position={[0, 0.8, 0]} color="#ffcc66" distance={4} decay={2} intensity={1.5} />
  </group>
}

// Guardian: a floor rune and a stone sentinel that glows during its challenge.
function Guardian() {
  const step = useGameStore(s => s.step)
  const active = CHALLENGES[step]?.id === 'guardian'
  const ring = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    const pulse = 0.6 + Math.sin(state.clock.elapsedTime * (active ? 4 : 1)) * 0.3
    ring.current.scale.set(pulse, pulse, 1)
  })
  return <group position={[0, 0, -5]}>
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[2.2, 2.45, 48]} />
      <meshStandardMaterial color="#5ad0ff" emissive="#5ad0ff" emissiveIntensity={active ? 2 : 0.3} transparent opacity={0.8} />
    </mesh>
    <mesh position={[0, 1.4, 0]}>
      <boxGeometry args={[1.2, 2.8, 0.7]} />
      <meshStandardMaterial color={STONE} roughness={0.9} emissive={active ? '#3a7aa0' : '#000000'} emissiveIntensity={0.5} />
    </mesh>
  </group>
}

function Hall() {
  const wall = useWallTexture()
  const pillars: { x: number; z: number }[] = []
  for (let z = -8; z <= 10; z += 6) {
    pillars.push({ x: -7.5, z }, { x: 7.5, z })
  }
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#5a4630" roughness={0.95} />
    </mesh>
    <mesh position={[0, 6, -14]}>
      <planeGeometry args={[40, 14]} />
      <meshStandardMaterial map={wall} roughness={0.95} />
    </mesh>
    <mesh position={[-16, 6, -2]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[40, 14]} />
      <meshStandardMaterial map={wall} roughness={0.95} />
    </mesh>
    <mesh position={[16, 6, -2]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[40, 14]} />
      <meshStandardMaterial map={wall} roughness={0.95} />
    </mesh>
    {pillars.map((p, i) => <Pillar key={i} x={p.x} z={p.z} />)}
    <Brazier x={-5} z={-10} />
    <Brazier x={5} z={-10} />
    <Brazier x={-11} z={-2} />
    <Brazier x={11} z={-2} />
    <Brazier x={-11} z={8} />
    <Brazier x={11} z={8} />
    <Statue x={0} z={-12.5} scale={1.25} />
    <Statue x={-9} z={-12.5} scale={0.9} />
    <Statue x={9} z={-12.5} scale={0.9} />
    <Altar />
    <Scarabs />
    <Guardian />
  </>
}

export default function World() {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 3.4, 10.5], fov: 55 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#0c0805']} />
    <fog attach="fog" args={['#140d08', 12, 38]} />
    <hemisphereLight args={['#f4d9a8', '#1a120a', 0.5]} />
    <ambientLight intensity={0.22} />
    <spotLight position={[0, 14, -6]} angle={0.32} penumbra={0.6} intensity={70} color="#ffd9a0" distance={30} />
    <Hall />
    <Player />
    <CameraRig />
  </Canvas>
}
