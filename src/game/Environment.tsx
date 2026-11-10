import { useMemo } from 'react'
import * as THREE from 'three'

function Pillar({ position }: { position: [number, number, number] }) {
  return <group position={position}>
    <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.58, 0.68, 3.6, 8]} />
      <meshStandardMaterial color="#8a7558" roughness={0.95} />
    </mesh>
    <mesh position={[0, 3.68, 0]} castShadow>
      <boxGeometry args={[1.45, 0.22, 1.45]} />
      <meshStandardMaterial color="#b09264" roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.12, 0]}>
      <cylinderGeometry args={[0.78, 0.78, 0.24, 8]} />
      <meshStandardMaterial color="#66533d" />
    </mesh>
  </group>
}

export default function Environment() {
  const dust = useMemo(() => Array.from({ length: 180 }, () => ({
    position: [(Math.random() - 0.5) * 22, Math.random() * 8 + 0.4, (Math.random() - 0.5) * 25] as [number, number, number],
    scale: Math.random() * 0.035 + 0.012
  })), [])

  return <>
    <color attach="background" args={['#090b11']} />
    <fog attach="fog" args={['#17130e', 10, 27]} />
    <ambientLight intensity={0.65} color="#c5b18d" />
    <directionalLight position={[-5, 12, 5]} intensity={2.4} color="#ffd79a" castShadow />
    <pointLight position={[0, 6, -5]} intensity={65} color="#f6a63d" distance={18} />
    <pointLight position={[0, 2, -8]} intensity={22} color="#20a9e8" distance={10} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
      <planeGeometry args={[22, 30]} />
      <meshStandardMaterial color="#514331" roughness={1} />
    </mesh>
    {/* side walls */}
    {[-10.5, 10.5].map(x => <mesh key={x} position={[x, 4, -1]} receiveShadow>
      <boxGeometry args={[1, 8, 24]} />
      <meshStandardMaterial color="#776247" roughness={0.96} />
    </mesh>)}
    <mesh position={[0, 8, -1]} receiveShadow>
      <boxGeometry args={[22, 0.8, 24]} />
      <meshStandardMaterial color="#493a2a" roughness={1} />
    </mesh>
    {/* rear sealed gate */}
    <group position={[0, 0, -10]}>
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[5.2, 6.6, 0.65]} />
        <meshStandardMaterial color="#302b27" metalness={0.35} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.3, 0.36]}>
        <torusGeometry args={[1.35, 0.11, 12, 48]} />
        <meshStandardMaterial color="#c38b36" emissive="#754313" emissiveIntensity={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.3, 0.42]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#28bce9" emissive="#0876a8" emissiveIntensity={2.3} metalness={0.55} />
      </mesh>
    </group>
    {[-7, 7].flatMap(x => [-7, 0, 7].map(z => <Pillar key={`${x}-${z}`} position={[x, 0, z]} />))}
    {/* raised altar and glowing memory shard */}
    <mesh position={[0, 0.38, -5.5]} castShadow receiveShadow>
      <cylinderGeometry args={[2.0, 2.3, 0.75, 8]} />
      <meshStandardMaterial color="#88704d" metalness={0.25} roughness={0.7} />
    </mesh>
    <pointLight position={[0, 1.6, -5.5]} color="#20bfff" intensity={18} distance={6} />
    {/* atmospheric dust */}
    {dust.map((d, i) => <mesh key={i} position={d.position}>
      <sphereGeometry args={[d.scale, 5, 5]} />
      <meshBasicMaterial color="#f2c47a" transparent opacity={0.45} />
    </mesh>)}
    {/* floor markings */}
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[0, 0.006, -8 + i * 1.7]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[3.1, 3.16, 48]} />
      <meshBasicMaterial color="#b58b4d" transparent opacity={0.32} />
    </mesh>)}
  </>
}