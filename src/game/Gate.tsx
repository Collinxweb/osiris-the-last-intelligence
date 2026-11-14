import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

export default function Gate() {
  const request = useGameStore(s => s.interactRequested)
  const stage = useGameStore(s => s.stage)
  const setMessage = useGameStore(s => s.setMessage)
  const finish = useGameStore(s => s.resetGame)
  useEffect(() => {
    if (stage !== 'gate' || request === 0) return
    const x = (window as any).__osirisPlayerX ?? 0
    const z = (window as any).__osirisPlayerZ ?? 4
    if (Math.hypot(x, z + 9.2) < 3.1) {
      useGameStore.setState({ stage: 'complete', message: 'The first seal is broken. Something beyond the gate has awakened.' })
    } else {
      setMessage('The gate is awake. Follow the blue-lit path and approach it.')
    }
  }, [request, stage, setMessage])
  return null
}
