import World from './game/World'
import TouchControls from './controls/TouchControls'
import GameHUD from './ui/GameHUD'

export default function App() {
  return <main className="game-shell">
    <World />
    <GameHUD />
    <TouchControls />
  </main>
}
