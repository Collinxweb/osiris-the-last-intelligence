import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { duckMusic, getMusicMuted, setMusicMuted, setMusicScene, startMusic } from '../audio/ambientMusic'

const runeNames = ['EYE', 'SUN', 'SCARAB']

export default function GameHUD() {
  const stage = useGameStore(s => s.stage)
  const message = useGameStore(s => s.message)
  const choices = useGameStore(s => s.runeChoices)
  const advance = useGameStore(s => s.advanceStory)
  const chooseRune = useGameStore(s => s.chooseRune)
  const reset = useGameStore(s => s.resetGame)
  const [muted, setMuted] = useState(true)
  const [debug] = useState(false)
  const started = stage !== 'intro'

  useEffect(() => { setMuted(getMusicMuted()) }, [])
  useEffect(() => { setMusicScene(stage === 'riddle' ? 'puzzle' : 'explore') }, [stage])
  useEffect(() => { if (started && message) duckMusic() }, [message])
  const begin = () => { void startMusic(); advance() }
  const toggleMusic = () => { const next = !muted; setMuted(next); setMusicMuted(next); if (!next) void startMusic() }

  return <div className="hud">
    <div className="brand"><span className="ankh">☥</span><div><strong>OSIRIS</strong><small>THE LAST INTELLIGENCE</small></div></div>
    <div className="status"><span className="status-dot" /> {stage === 'complete' ? 'SEAL BROKEN' : 'EXPEDITION ACTIVE'}</div>
    <button className="music-toggle" onClick={toggleMusic} aria-label={muted ? 'Unmute music' : 'Mute music'}>{muted ? '♫ OFF' : '♫ ON'}</button>
    {started && <>
      <div className="mission"><small>CHAPTER 01 · THE FIRST AWAKENING</small><strong>{stage === 'explore' ? 'FIND THE MEMORY' : stage === 'fragment' ? 'A VOICE IN THE STONE' : stage === 'riddle' ? 'THE FIRST SEAL' : stage === 'gate' ? 'AWAKEN THE GATE' : 'THE GATE OPENS'}</strong><span>{stage === 'explore' ? 'Reach the glowing altar' : stage === 'fragment' ? 'A message waits within' : stage === 'riddle' ? 'Restore the three-symbol sequence' : stage === 'gate' ? 'Approach the gate and press INTERACT' : 'Chapter milestone reached'}</span></div>
      <div className="objective"><span className="check">{stage === 'complete' ? '✓' : '◇'}</span>{stage === 'explore' ? 'Move to the altar and press INTERACT' : stage === 'fragment' ? 'Press INTERACT to hear the memory' : stage === 'riddle' ? 'Restore: Eye → Sun → Scarab' : stage === 'gate' ? 'The seal is broken. Reach the far gate.' : 'The sealed gate has opened.'}</div>
      {stage !== 'riddle' && <div className="message" key={message}>{message}</div>}
    </>}
    {stage === 'intro' && <div className="intro-panel"><div className="eyebrow">AN OSIRIS CHRONICLE</div><h1>THE FIRST<br/>AWAKENING</h1><p>Long before the sands swallowed the temples, an intelligence was buried beneath them. Now, something remembers you.</p><div className="intro-instruction">MOVE: LEFT JOYSTICK <span>·</span> INTERACT: RIGHT BUTTON</div><button className="primary-action" onClick={begin}>BEGIN EXPEDITION <span>→</span></button></div>}
    {stage === 'fragment' && <div className="story-panel"><small>MEMORY FRAGMENT · TRANSMISSION 001</small><p>“If you can hear me, the first seal still holds. The Eye sees what the Sun reveals. The Scarab carries what remains.”</p><small className="story-hint">PRESS INTERACT TO CONTINUE</small></div>}
    {stage === 'riddle' && <div className="riddle-panel" role="dialog" aria-modal="true"><small>RESTORE THE INSCRIPTION</small><p>“The Eye sees. The Sun reveals. The Scarab carries.”</p><div className="rune-row">{['eye','sun','scarab'].map((id,i) => <button type="button" key={id} onPointerDown={e => { e.preventDefault(); e.stopPropagation(); chooseRune(id) }}><b>{['◉','☼','✥'][i]}</b><span>{runeNames[i]}</span></button>)}</div><div className="rune-progress">{choices.length ? choices.map((v,i) => <span key={i}>{v.toUpperCase()} ✓</span>) : <span>SEQUENCE: 0 / 3</span>}</div><div className="rune-feedback" aria-live="polite">{message}</div></div>}
    {stage === 'complete' && <div className="complete-panel"><div className="complete-mark">✧</div><small>CHAPTER 01 · MILESTONE REACHED</small><h2>THE FIRST SEAL<br/>IS BROKEN</h2><p>The gate stirs. Something beyond it has noticed your arrival.</p><button onClick={reset}>REPLAY CHAPTER</button></div>}
    {debug && <div className="debug-state">stage: {stage} · sequence: {choices.join(' → ') || 'empty'}</div>}
  </div>
}
