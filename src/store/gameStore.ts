import { create } from 'zustand'

type Stage = 'intro' | 'explore' | 'fragment' | 'riddle' | 'complete'
type GameState = {
  stage: Stage
  joystick: { x: number; y: number }
  setJoystick: (x: number, y: number) => void
  interactRequested: number
  requestInteract: () => void
  artifactFound: boolean
  collectArtifact: () => void
  advanceStory: () => void
  chooseRune: (rune: string) => void
  resetGame: () => void
  runeChoices: string[]
  message: string
  setMessage: (message: string) => void
}

const initial = {
  stage: 'intro' as Stage,
  joystick: { x: 0, y: 0 },
  interactRequested: 0,
  artifactFound: false,
  runeChoices: [] as string[],
  message: 'A voice stirs beneath the sand…'
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initial,
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  requestInteract: () => {
    const { stage } = get()
    if (stage === 'fragment') set({ stage: 'riddle', message: 'Three symbols. One memory. Restore the sequence.' })
    else if (stage === 'complete') set({ message: 'The sealed gate is open. Your journey has only begun.' })
    else set(s => ({ interactRequested: s.interactRequested + 1 }))
  },
  collectArtifact: () => set({ artifactFound: true, stage: 'fragment', message: 'The fragment awakens. A voice echoes through the chamber…' }),
  advanceStory: () => set({ stage: 'explore', message: 'Find the glowing memory fragment on the altar.' }),
  chooseRune: (rune) => {
    const next = [...get().runeChoices, rune].slice(0, 3)
    const answer = ['eye', 'sun', 'scarab']
    const correct = next.every((v, i) => v === answer[i])
    if (next.length === 3 && correct) set({ runeChoices: next, stage: 'complete', message: 'THE FIRST SEAL IS BROKEN. THE GATE STIRS.' })
    else if (next.length === 3) set({ runeChoices: [], message: 'The symbols reject the sequence. Listen to the inscription and try again.' })
    else set({ runeChoices: next, message: 'The stone remembers… continue.' })
  },
  resetGame: () => set({ ...initial }),
  setMessage: (message) => set({ message })
}))
