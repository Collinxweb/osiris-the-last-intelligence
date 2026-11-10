import World from './game/World'
import TouchControls from './controls/TouchControls'
import GameHUD from './ui/GameHUD'

export default function App() {
  return <main className="game-shell">
    <World />
    <GameHUD />
    <TouchControls />
    <div className="hint">Explore the chamber · WASD / Arrow keys also supported</div>
    <div className="chapter"><span>CHAPTER 01</span><strong>THE FIRST AWAKENING</strong></div>
  </main>
}