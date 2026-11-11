import { useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export default function TouchControls() {
  const setJoystick = useGameStore(s => s.setJoystick)
  const joystick = useGameStore(s => s.joystick)
  const interact = useGameStore(s => s.requestInteract)
  const stage = useGameStore(s => s.stage)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const active = useRef(false)
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active.current || !origin.current) return
    const dx = e.clientX - origin.current.x, dy = e.clientY - origin.current.y
    const length = Math.max(1, Math.hypot(dx, dy)), scale = Math.min(1, 52 / length)
    setJoystick(dx / 52 * scale, dy / 52 * scale)
  }
  const start = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    origin.current = { x: rect.left + rect.width / 2, y: rect.top + 55 }
    active.current = true; move(e)
  }
  const end = () => { active.current = false; origin.current = null; setJoystick(0, 0) }
  const knobStyle = { '--joy-x': `${joystick.x * 32}px`, '--joy-y': `${joystick.y * 32}px` } as React.CSSProperties
  return <div className="touch-layer">
    {stage !== 'intro' && stage !== 'complete' && <>
      <div className="joystick-zone" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}><div className="joystick-ring" style={knobStyle}><div className="joystick-knob"/></div><span>MOVE</span></div>
      {stage !== 'riddle' && <button type="button" className="action-button" onPointerDown={e => e.stopPropagation()} onClick={interact}>{stage === 'fragment' ? 'CONTINUE' : 'INTERACT'}</button>}
    </>}
  </div>
}
