import { create } from 'zustand'

type GameState = {
  joystick: { x: number; y: number }
  setJoystick: (x: number, y: number) => void
  interactRequested: number
  requestInteract: () => void
  artifactFound: boolean
  collectArtifact: () => void
  message: string
  setMessage: (message: string) => void
}

export const useGameStore = create<GameState>((set) => ({
  joystick: { x: 0, y: 0 },
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  interactRequested: 0,
  requestInteract: () => set((s) => ({ interactRequested: s.interactRequested + 1 })),
  artifactFound: false,
  collectArtifact: () => set({ artifactFound: true, message: 'MEMORY FRAGMENT ACQUIRED' }),
  message: 'Find the source of the signal.',
  setMessage: (message) => set({ message })
}))