import { useGameStore } from '../store/gameStore'

export default function GameHUD() {
  const message = useGameStore(s => s.message)
  const found = useGameStore(s => s.artifactFound)
  return <div className="hud">
    <div className="brand"><span className="ankh">☥</span><div><strong>OSIRIS</strong><small>THE LAST INTELLIGENCE</small></div></div>
    <div className="mission"><small>ACTIVE EXPEDITION</small><strong>THE ETERNAL CORE</strong><span>{found ? 'Memory fragment recovered' : 'Find the source of the signal'}</span></div>
    <div className="status"><span className="status-dot" /> EXPEDITION ACTIVE</div>
    <div className="message">{message}</div>
    <div className="objective"><span className={found ? 'check done' : 'check'}>{found ? '✓' : '◇'}</span> {found ? 'Memory fragment collected' : 'Locate the glowing artifact'}</div>
    <div className="crosshair">+</div>
  </div>
}