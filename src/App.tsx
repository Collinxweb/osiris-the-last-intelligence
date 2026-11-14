import World from './game/World'
import Interactions from './game/Interactions'
import TouchControls from './controls/TouchControls'
import GameHUD from './ui/GameHUD'
import './chapters.css'
export default function App() { return <main className="game-shell"><World/><Interactions/><GameHUD/><TouchControls/></main> }
