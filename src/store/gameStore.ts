import { create } from 'zustand'

type Stage = 'intro' | 'explore' | 'fragment' | 'riddle' | 'gate' | 'complete'
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
    const stage = get().stage
    if (stage === 'fragment') set({ stage: 'riddle', runeChoices: [], message: 'Restore the inscription: Eye, then Sun, then Scarab.' })
    else if (stage === 'explore' || stage === 'gate') set(s => ({ interactRequested: s.interactRequested + 1 }))
  },
  collectArtifact: () => set({ artifactFound: true, stage: 'fragment', message: 'Memory fragment recovered.' }),
  advanceStory: () => set({ stage: 'explore', message: 'Find the glowing memory fragment on the altar.' }),
  chooseRune: (rune) => {
    const state = get()
    if (state.stage !== 'riddle') return
    const answer = ['eye', 'sun', 'scarab']
    const index = state.runeChoices.length
    if (rune !== answer[index]) {
      set({ runeChoices: [], message: `The ${rune.toUpperCase()} rune rejects your touch. Sequence reset — begin with the EYE.` })
      return
    }
    const next = [...state.runeChoices, rune]
    if (next.length === 3) {
      set({ runeChoices: next, stage: 'gate', message: 'SEQUENCE COMPLETE. The first seal breaks. Reach the awakened gate.' })
      return
    }
    set({ runeChoices: next, message: `${rune.toUpperCase()} confirmed. ${3 - next.length} symbol${next.length === 1 ? 's' : ''} remaining.` })
  },
  resetGame: () => set({ ...initial }),
  setMessage: (message) => set({ message })
}))
