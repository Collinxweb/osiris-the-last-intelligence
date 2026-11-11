import { useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export default function TouchControls() {
  const setJoystick = useGameStore(s => s.setJoystick)
  const interact = useGameStore(s => s.requestInteract)
  const stage = useGameStore(s => s.stage)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const active = useRef(false)
  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    active.current = true
    move(e)
  }
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current || !origin.current) return
    const dx = e.clientX - origin.current.x
    const dy = e.clientY - origin.current.y
    const length = Math.max(1, Math.hypot(dx, dy))
    const scale = Math.min(1, 48 / length)
    setJoystick((dx / 48) * scale, (dy / 48) * scale)
  }
  const end = () => { active.current = false; origin.current = null; setJoystick(0, 0) }
  return <div className="touch-layer">
    {stage !== 'intro' && stage !== 'complete' && <>
      <div className="joystick-zone" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
        <div className="joystick-ring"><div className="joystick-knob" /></div><span>MOVE</span>
      </div>
      {stage !== 'riddle' && <button className="action-button" onPointerDown={e => e.stopPropagation()} onClick={interact}>{stage === 'fragment' ? 'CONTINUE' : 'INTERACT'}</button>}
    </>}
  </div>
}
