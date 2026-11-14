import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { CHALLENGES, LEVELS } from '../game/levels'
import { GLYPHS, guardianPosition } from '../game/puzzles'
import { duckMusic, getMusicMuted, setMusicMuted, setMusicScene, startMusic, type Mood } from '../audio/ambientMusic'

const SYMBOL: Record<string, string> = { eye: '◉', sun: '☼', scarab: '✥', ankh: '☥', feather: '➶' }
const MIRROR_FACE = ['—', '╲', '│', '╱']
const MOOD: Record<string, Mood> = { memory: 'explore', glyph: 'puzzle', mirror: 'puzzle', scarab: 'explore', guardian: 'tension' }
const PANEL_IDS = ['glyph', 'mirror', 'guardian']

export default function GameHUD() {
  const phase = useGameStore(s => s.phase)
  const step = useGameStore(s => s.step)
  const message = useGameStore(s => s.message)
  const memoryFound = useGameStore(s => s.memoryFound)
  const scarabs = useGameStore(s => s.scarabs)
  const begin = useGameStore(s => s.begin)
  const advance = useGameStore(s => s.advance)
  const reset = useGameStore(s => s.resetGame)
  const [muted, setMuted] = useState(true)

  const challenge = CHALLENGES[step]
  const id = challenge?.id

  useEffect(() => { setMuted(getMusicMuted()) }, [])
  useEffect(() => { if (phase === 'playing' && id) setMusicScene(MOOD[id]) }, [id, phase])
  useEffect(() => { if (phase === 'playing' && message) duckMusic() }, [message, phase])

  const onBegin = () => { void startMusic(); begin() }
  const toggleMusic = () => { const next = !muted; setMuted(next); setMusicMuted(next); if (!next) void startMusic() }

  return <div className="hud">
    <div className="brand"><span className="ankh">☥</span><div><strong>OSIRIS</strong><small>THE LAST INTELLIGENCE</small></div></div>
    <div className="status"><span className="status-dot" /> {phase === 'complete' ? 'SEAL BROKEN' : 'EXPEDITION ACTIVE'}</div>
    <button className="music-toggle" onClick={toggleMusic} aria-label={muted ? 'Unmute music' : 'Mute music'}>{muted ? '♫ OFF' : '♫ ON'}</button>

    {phase === 'playing' && challenge && <>
      <div className="mission"><small>CHAPTER 01 · CHALLENGE {step + 1} OF {CHALLENGES.length}</small><strong>{challenge.title}</strong><span>{challenge.objective}</span></div>
      {message && !PANEL_IDS.includes(id ?? '') && <div className="message" key={message}>{message}</div>}
    </>}

    {phase === 'intro' && <div className="intro-panel"><div className="eyebrow">AN OSIRIS CHRONICLE</div><h1>THE FIRST<br/>AWAKENING</h1><p>Long before the sands swallowed the temples, an intelligence was buried beneath them. Now, something remembers you.</p><div className="intro-instruction">MOVE: LEFT JOYSTICK <span>·</span> INTERACT: RIGHT BUTTON</div><button className="primary-action" onClick={onBegin}>BEGIN EXPEDITION <span>→</span></button></div>}

    {phase === 'playing' && id === 'memory' && memoryFound && <div className="story-panel"><small>MEMORY FRAGMENT · TRANSMISSION 001</small><p>“If you can hear me, the first seal still holds. Study the glyphs. The order matters.”</p><button className="primary-action" onClick={() => advance('The memory settles into your mind. A seal waits beyond the altar.')}>CONTINUE →</button></div>}

    {phase === 'playing' && id === 'glyph' && <GlyphPanel />}
    {phase === 'playing' && id === 'mirror' && <MirrorPanel />}
    {phase === 'playing' && id === 'scarab' && <div className="scarab-count">SCARABS {scarabs.length} / {LEVELS.scarab.need}</div>}
    {phase === 'playing' && id === 'guardian' && <GuardianPanel />}

    {phase === 'complete' && <div className="complete-panel"><div className="complete-mark">✧</div><small>CHAPTER 01 · MILESTONE REACHED</small><h2>THE FIRST SEAL<br/>IS BROKEN</h2><p>{message}</p><button onClick={reset}>REPLAY CHAPTER</button></div>}
  </div>
}

function GlyphPanel() {
  const glyph = useGameStore(s => s.glyph)
  const phase = useGameStore(s => s.glyphPhase)
  const press = useGameStore(s => s.glyphPress)
  const setPhase = useGameStore(s => s.setGlyphPhase)
  const message = useGameStore(s => s.message)

  useEffect(() => {
    if (phase !== 'memorize') return
    const t = window.setTimeout(() => setPhase('input'), LEVELS.glyph.memorizeMs)
    return () => window.clearTimeout(t)
  }, [phase, setPhase])

  return <div className="riddle-panel" role="dialog" aria-modal="true">
    <small>RESTORE THE INSCRIPTION</small>
    {phase === 'memorize'
      ? <><p>Memorize the order of the glyphs. They will vanish.</p><div className="rune-row">{glyph.target.map((g, i) => <button key={i} type="button" className="glyph-show" tabIndex={-1}><b>{SYMBOL[g]}</b><span>{i + 1}</span></button>)}</div></>
      : <><p>Repeat the order from memory.</p><div className="rune-row">{GLYPHS.map(g => <button key={g} type="button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); press(g) }}><b>{SYMBOL[g]}</b><span>{g.toUpperCase()}</span></button>)}</div><div className="rune-progress">{glyph.input.map((g, i) => <span key={i}>{g.toUpperCase()} ✓</span>)}</div></>}
    <div className="rune-feedback" aria-live="polite">{message}</div>
  </div>
}

function MirrorPanel() {
  const mirror = useGameStore(s => s.mirror)
  const turn = useGameStore(s => s.mirrorTurn)
  const message = useGameStore(s => s.message)
  return <div className="riddle-panel" role="dialog" aria-modal="true">
    <small>ANGLE THE LIGHT</small>
    <p>Turn each mirror until the beam strikes the door. Test the settings and watch the count.</p>
    <div className="rune-row">{mirror.angles.map((a, i) => <button key={i} type="button" onPointerDown={e => { e.preventDefault(); e.stopPropagation(); turn(i) }}><b>{MIRROR_FACE[a]}</b><span>MIRROR {i + 1}</span></button>)}</div>
    <div className="rune-feedback" aria-live="polite">{message}</div>
  </div>
}

function GuardianPanel() {
  const hits = useGameStore(s => s.guardianHits)
  const strike = useGameStore(s => s.guardianStrike)
  const message = useGameStore(s => s.message)
  const posRef = useRef(0)
  const [pos, setPos] = useState(0)

  useEffect(() => {
    let phase = 0
    let raf = 0
    const tick = () => {
      phase += LEVELS.guardian.speed
      posRef.current = guardianPosition(phase)
      setPos(posRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const zoneStart = 0.5 - LEVELS.guardian.zoneWidth / 2
  return <div className="riddle-panel guardian-panel" role="dialog" aria-modal="true">
    <small>THE FIRST GUARDIAN</small>
    <p>Strike while the marker crosses the green zone.</p>
    <div className="guardian-track">
      <div className="guardian-zone" style={{ left: `${zoneStart * 100}%`, width: `${LEVELS.guardian.zoneWidth * 100}%` }} />
      <div className="guardian-marker" style={{ left: `${pos * 100}%` }} />
    </div>
    <button type="button" className="primary-action" onPointerDown={e => {
      e.preventDefault(); e.stopPropagation()
      const inside = posRef.current >= zoneStart && posRef.current <= zoneStart + LEVELS.guardian.zoneWidth
      strike(inside)
    }}>STRIKE</button>
    <div className="rune-progress"><span>HITS {hits} / {LEVELS.guardian.hits}</span></div>
    <div className="rune-feedback" aria-live="polite">{message}</div>
  </div>
}
