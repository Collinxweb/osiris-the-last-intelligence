import { create } from 'zustand'
import { CHALLENGES, LEVELS } from '../game/levels'
import {
  collectScarab as addScarab,
  glyphSequence,
  glyphTap,
  guardianStrike as resolveStrike,
  makeMirrors,
  mirrorsAligned,
  mirrorsAlignedCount,
  seededRng,
  turnMirror,
  type Glyph,
  type GlyphState,
  type MirrorState
} from '../game/puzzles'

export type Phase = 'intro' | 'playing' | 'complete'
export type GlyphPhase = 'memorize' | 'input'

type GameState = {
  phase: Phase
  step: number
  message: string
  joystick: { x: number; y: number }
  interactRequested: number
  memoryFound: boolean
  glyph: GlyphState
  glyphPhase: GlyphPhase
  mirror: MirrorState
  scarabs: string[]
  guardianHits: number
  begin: () => void
  setJoystick: (x: number, y: number) => void
  requestInteract: () => void
  collectMemory: () => void
  glyphPress: (g: Glyph) => void
  setGlyphPhase: (p: GlyphPhase) => void
  mirrorTurn: (i: number) => void
  scarabFound: (id: string) => void
  guardianStrike: (inside: boolean) => void
  advance: (message?: string) => void
  setMessage: (message: string) => void
  resetGame: () => void
}

const EMPTY_GLYPH: GlyphState = { target: [], input: [], mistakes: 0 }
const EMPTY_MIRROR: MirrorState = { targets: [], angles: [] }
const currentId = (s: { step: number }) => CHALLENGES[s.step]?.id

// Builds the random puzzle state for a challenge. Each call gets a fresh seed.
function setupFor(step: number): Partial<GameState> {
  const id = CHALLENGES[step]?.id
  const rng = seededRng(Math.floor(Math.random() * 0x7fffffff) + 1)
  if (id === 'glyph') return { glyph: { target: glyphSequence(rng, LEVELS.glyph.length), input: [], mistakes: 0 }, glyphPhase: 'memorize' }
  if (id === 'mirror') return { mirror: makeMirrors(rng, LEVELS.mirror.mirrors) }
  if (id === 'scarab') return { scarabs: [] }
  if (id === 'guardian') return { guardianHits: 0 }
  return {}
}

const freshRun = (): Partial<GameState> => ({
  step: 0,
  memoryFound: false,
  glyph: EMPTY_GLYPH,
  glyphPhase: 'memorize',
  mirror: EMPTY_MIRROR,
  scarabs: [],
  guardianHits: 0,
  interactRequested: 0,
  joystick: { x: 0, y: 0 }
})

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'intro',
  step: 0,
  message: 'A voice stirs beneath the sand…',
  joystick: { x: 0, y: 0 },
  interactRequested: 0,
  memoryFound: false,
  glyph: EMPTY_GLYPH,
  glyphPhase: 'memorize',
  mirror: EMPTY_MIRROR,
  scarabs: [],
  guardianHits: 0,

  begin: () => set({ ...freshRun(), phase: 'playing', message: CHALLENGES[0].objective }),
  resetGame: () => get().begin(),
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  setMessage: (message) => set({ message }),
  requestInteract: () => {
    if (get().phase === 'playing') set(s => ({ interactRequested: s.interactRequested + 1 }))
  },

  collectMemory: () => {
    if (currentId(get()) === 'memory' && !get().memoryFound) {
      set({ memoryFound: true, message: 'Memory fragment recovered.' })
    }
  },

  advance: (message) => set(s => {
    const step = s.step + 1
    if (step >= CHALLENGES.length) {
      return { step, phase: 'complete', message: message ?? 'The first seal is broken. Something beyond the gate has awakened.' }
    }
    return { ...setupFor(step), step, memoryFound: false, message: message ?? CHALLENGES[step].objective }
  }),

  glyphPress: (g) => {
    const s = get()
    if (currentId(s) !== 'glyph' || s.glyphPhase !== 'input') return
    const r = glyphTap(s.glyph, g)
    if (r.result === 'wrong') {
      set({ glyph: r.state, glyphPhase: 'memorize', message: 'Wrong symbol. The inscription fades. Memorize it again.' })
    } else if (r.result === 'done') {
      get().advance('The inscription is restored. A seal cracks open.')
    } else {
      set({ glyph: r.state, message: `${g.toUpperCase()} confirmed. ${r.state.target.length - r.state.input.length} to go.` })
    }
  },

  setGlyphPhase: (p) => set({ glyphPhase: p }),

  mirrorTurn: (i) => {
    const s = get()
    if (currentId(s) !== 'mirror') return
    const m = turnMirror(s.mirror, i)
    if (mirrorsAligned(m)) {
      get().advance('The light strikes the door. The stone grinds apart.')
    } else {
      set({ mirror: m, message: `${mirrorsAlignedCount(m)} of ${m.angles.length} mirrors aligned.` })
    }
  },

  scarabFound: (id) => {
    const s = get()
    if (currentId(s) !== 'scarab') return
    if (s.scarabs.includes(id)) { set({ message: 'Already claimed.' }); return }
    const r = addScarab(s.scarabs, id, LEVELS.scarab.need)
    if (r.done) {
      get().advance('The last scarab stirs. The chamber answers.')
    } else {
      set({ scarabs: r.found, message: `Scarab claimed. ${r.found.length} of ${LEVELS.scarab.need}.` })
    }
  },

  guardianStrike: (inside) => {
    const s = get()
    if (currentId(s) !== 'guardian') return
    const r = resolveStrike(s.guardianHits, inside, LEVELS.guardian.hits)
    if (r.result === 'miss') {
      set({ guardianHits: 0, message: 'Your strike goes wide. The guardian resets its rhythm.' })
    } else if (r.result === 'done') {
      get().advance('The guardian falls silent. The stone seal gives way.')
    } else {
      set({ guardianHits: r.hits, message: `Hit ${r.hits} of ${LEVELS.guardian.hits}.` })
    }
  }
}))
