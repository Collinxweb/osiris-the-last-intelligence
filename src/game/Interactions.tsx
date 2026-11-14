import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { CHALLENGES, LEVELS } from './levels'

// Handles INTERACT presses that depend on where the player stands in the world.
// Reads the player position the 3D world publishes on window.
const near = (x: number, z: number, p: readonly [number, number], reach: number) =>
  Math.hypot(x - p[0], z - p[1]) < reach

export default function Interactions() {
  const request = useGameStore(s => s.interactRequested)

  useEffect(() => {
    if (request === 0) return
    const s = useGameStore.getState()
    const id = CHALLENGES[s.step]?.id
    const x = (window as any).__osirisPlayerX ?? 0
    const z = (window as any).__osirisPlayerZ ?? 4

    if (id === 'memory' && !s.memoryFound) {
      if (near(x, z, LEVELS.memory.altar, LEVELS.memory.reach)) s.collectMemory()
      else s.setMessage('Walk closer to the glowing altar, then press INTERACT.')
    }
    if (id === 'scarab') {
      const spot = LEVELS.scarab.spots.find(p => !s.scarabs.includes(p.id) && near(x, z, p.at, LEVELS.scarab.reach))
      if (spot) s.scarabFound(spot.id)
      else s.setMessage('No scarab within reach. Search the chamber corners.')
    }
  }, [request])

  return null
}
