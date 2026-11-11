import World from './game/World'
import Gate from './game/Gate'
import TouchControls from './controls/TouchControls'
import GameHUD from './ui/GameHUD'
export default function App() { return <main className="game-shell"><World/><Gate/><GameHUD/><TouchControls/></main> }
