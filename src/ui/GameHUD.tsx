import { useGameStore } from '../store/gameStore'

export default function GameHUD() {
  const stage = useGameStore(s => s.stage)
  const message = useGameStore(s => s.message)
  const choices = useGameStore(s => s.runeChoices)
  const advance = useGameStore(s => s.advanceStory)
  const chooseRune = useGameStore(s => s.chooseRune)
  const reset = useGameStore(s => s.resetGame)
  const started = stage !== 'intro'

  return <div className="hud">
    <div className="brand"><span className="ankh">☥</span><div><strong>OSIRIS</strong><small>THE LAST INTELLIGENCE</small></div></div>
    <div className="status"><span className="status-dot" /> {stage === 'complete' ? 'SEAL BROKEN' : 'EXPEDITION ACTIVE'}</div>
    {started && <>
      <div className="mission"><small>CHAPTER 01 · THE FIRST AWAKENING</small><strong>{stage === 'explore' ? 'FIND THE MEMORY' : stage === 'fragment' ? 'A VOICE IN THE STONE' : stage === 'riddle' ? 'THE FIRST SEAL' : 'THE GATE AWAKENS'}</strong><span>{stage === 'explore' ? 'Reach the glowing altar' : stage === 'fragment' ? 'The fragment has a message' : stage === 'riddle' ? 'Restore the three-symbol sequence' : 'First seal unlocked'}</span></div>
      <div className="objective"><span className="check">{stage === 'complete' ? '✓' : '◇'}</span>{stage === 'explore' ? 'Move to the altar and press INTERACT' : stage === 'fragment' ? 'Press INTERACT to hear the memory' : stage === 'riddle' ? 'Choose: Eye → Sun → Scarab' : 'The sealed gate has opened'}</div>
      <div className="message" key={message}>{message}</div>
    </>}
    {stage === 'intro' && <div className="intro-panel">
      <div className="eyebrow">AN OSIRIS CHRONICLE</div>
      <h1>THE FIRST<br/>AWAKENING</h1>
      <p>Long before the sands swallowed the temples, an intelligence was buried beneath them. Now, something remembers you.</p>
      <div className="intro-instruction">MOVE: LEFT JOYSTICK <span>·</span> INTERACT: RIGHT BUTTON</div>
      <button className="primary-action" onClick={advance}>BEGIN EXPEDITION <span>→</span></button>
    </div>}
    {stage === 'fragment' && <div className="story-panel"><small>MEMORY FRAGMENT · TRANSMISSION 001</small><p>“If you can hear me, the first seal still holds. The Eye sees what the Sun reveals. The Scarab carries what remains.”</p><small className="story-hint">PRESS INTERACT TO CONTINUE</small></div>}
    {stage === 'riddle' && <div className="riddle-panel"><small>RESTORE THE INSCRIPTION</small><p>“The Eye sees. The Sun reveals. The Scarab carries.”</p><div className="rune-row">{[['eye','◉','EYE'],['sun','☼','SUN'],['scarab','✥','SCARAB']].map(([id,symbol,label]) => <button key={id} onClick={() => chooseRune(id)}><b>{symbol}</b><span>{label}</span></button>)}</div><div className="rune-progress">{choices.map((v,i) => <span key={i}>{v.toUpperCase()}</span>)}</div></div>}
    {stage === 'complete' && <div className="complete-panel"><div className="complete-mark">✧</div><small>CHAPTER 01 · MILESTONE REACHED</small><h2>THE FIRST SEAL<br/>IS BROKEN</h2><p>The gate stirs. Something beyond it has noticed your arrival.</p><button onClick={reset}>REPLAY CHAPTER</button></div>}
    <div className="crosshair">+</div>
  </div>
}
