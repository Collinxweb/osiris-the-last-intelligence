// Pure puzzle logic. No React, no DOM, no audio, so it can be unit tested in Node.

export const GLYPHS = ['eye', 'sun', 'scarab', 'ankh', 'feather'] as const
export type Glyph = (typeof GLYPHS)[number]
export type Rng = () => number

// xorshift32: deterministic when seeded, so tests are repeatable.
export function seededRng(seed: number): Rng {
  let s = (seed >>> 0) || 0x9e3779b9
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 0x100000000
  }
}

export function randInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n)
}

// ---------- Glyph sequence ----------
export function glyphSequence(rng: Rng, length: number): Glyph[] {
  const seq: Glyph[] = []
  while (seq.length < length) {
    const g = GLYPHS[randInt(rng, GLYPHS.length)]
    if (seq[seq.length - 1] !== g) seq.push(g) // no immediate repeats
  }
  return seq
}

export type GlyphState = { target: Glyph[]; input: Glyph[]; mistakes: number }
export type TapResult = 'progress' | 'wrong' | 'done'

export function glyphTap(state: GlyphState, glyph: Glyph): { state: GlyphState; result: TapResult } {
  if (glyph !== state.target[state.input.length]) {
    return { state: { ...state, input: [], mistakes: state.mistakes + 1 }, result: 'wrong' }
  }
  const input = [...state.input, glyph]
  return {
    state: { ...state, input },
    result: input.length === state.target.length ? 'done' : 'progress'
  }
}

// ---------- Mirrors (light reflection) ----------
export const MIRROR_SETTINGS = 4
export type MirrorState = { targets: number[]; angles: number[] }

export function makeMirrors(rng: Rng, count: number): MirrorState {
  let targets: number[]
  do {
    targets = Array.from({ length: count }, () => randInt(rng, MIRROR_SETTINGS))
  } while (targets.every(t => t === 0)) // never start already aligned
  return { targets, angles: targets.map(() => 0) }
}

export function turnMirror(state: MirrorState, index: number): MirrorState {
  return {
    ...state,
    angles: state.angles.map((a, i) => (i === index ? (a + 1) % MIRROR_SETTINGS : a))
  }
}

export const mirrorsAlignedCount = (m: MirrorState) => m.angles.filter((a, i) => a === m.targets[i]).length
export const mirrorsAligned = (m: MirrorState) => mirrorsAlignedCount(m) === m.targets.length

// ---------- Scarab hunt ----------
export function collectScarab(found: string[], id: string, needed: number): { found: string[]; done: boolean } {
  const next = found.includes(id) ? found : [...found, id]
  return { found: next, done: next.length >= needed }
}

// ---------- Guardian timing ----------
// Triangle wave over phase: 0 -> 1 -> 0 -> ...
export function guardianPosition(phase: number): number {
  const p = ((phase % 2) + 2) % 2
  return p <= 1 ? p : 2 - p
}

export function guardianStrike(hits: number, inside: boolean, need: number): { hits: number; result: 'hit' | 'miss' | 'done' } {
  if (!inside) return { hits: 0, result: 'miss' }
  const h = hits + 1
  return { hits: h, result: h >= need ? 'done' : 'hit' }
}
