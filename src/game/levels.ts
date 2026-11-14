// Chapter 01 challenge chain. Order is progression; difficulty rises down the list.
// World coordinates here must match the positions the 3D world spawns.

export type ChallengeId = 'memory' | 'glyph' | 'mirror' | 'scarab' | 'guardian'
export type Challenge = { id: ChallengeId; title: string; objective: string; difficulty: 1 | 2 | 3 | 4 | 5 }

export const CHALLENGES: Challenge[] = [
  { id: 'memory', title: 'Find the Memory', objective: 'Reach the glowing altar and press INTERACT', difficulty: 1 },
  { id: 'glyph', title: 'Restore the Inscription', objective: 'Memorize the glyph order, then repeat it from memory', difficulty: 2 },
  { id: 'mirror', title: 'Angle the Light', objective: 'Turn the four mirrors until the beam strikes the door', difficulty: 3 },
  { id: 'scarab', title: 'The Hidden Scarabs', objective: 'Find five of the seven scarabs and press INTERACT beside each', difficulty: 4 },
  { id: 'guardian', title: 'Still the Guardian', objective: 'Strike four times while the marker sits in the green zone', difficulty: 5 }
]

export const LEVELS = {
  memory: { altar: [0, -9] as readonly [number, number], reach: 3.4 },
  glyph: { length: 4, memorizeMs: 5000 },
  mirror: { mirrors: 4 },
  scarab: {
    need: 5,
    reach: 2.4,
    spots: [
      { id: 'scarab-1', at: [-11, -4] },
      { id: 'scarab-2', at: [11, -4] },
      { id: 'scarab-3', at: [-6, 3] },
      { id: 'scarab-4', at: [6, 3] },
      { id: 'scarab-5', at: [-12, 8] },
      { id: 'scarab-6', at: [12, 8] },
      { id: 'scarab-7', at: [0, 12] }
    ] as { id: string; at: readonly [number, number] }[]
  },
  guardian: { hits: 4, zoneWidth: 0.12, speed: 0.035 }
}
