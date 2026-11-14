import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  seededRng, glyphSequence, glyphTap, makeMirrors, turnMirror, mirrorsAligned,
  mirrorsAlignedCount, collectScarab, guardianStrike, guardianPosition, GLYPHS
} from '../src/game/puzzles.ts'
import { CHALLENGES, LEVELS } from '../src/game/levels.ts'

test('seeded rng is deterministic and stays in [0,1)', () => {
  const a = seededRng(42), b = seededRng(42)
  for (let i = 0; i < 1000; i++) {
    const x = a()
    assert.equal(x, b())
    assert.ok(x >= 0 && x < 1)
  }
})

test('glyph sequence has requested length and no immediate repeats', () => {
  const rng = seededRng(7)
  for (let n = 0; n < 200; n++) {
    const seq = glyphSequence(rng, 4)
    assert.equal(seq.length, 4)
    for (let i = 1; i < seq.length; i++) assert.notEqual(seq[i], seq[i - 1])
    seq.forEach(g => assert.ok((GLYPHS as readonly string[]).includes(g)))
  }
})

test('glyph taps: correct order completes, wrong tap resets and counts a mistake', () => {
  let s = { target: ['eye', 'sun', 'ankh'] as const, input: [] as string[], mistakes: 0 }
  let r = glyphTap(s as any, 'eye'); assert.equal(r.result, 'progress'); s = r.state as any
  r = glyphTap(s as any, 'ankh'); assert.equal(r.result, 'wrong'); assert.deepEqual(r.state.input, []); assert.equal(r.state.mistakes, 1)
  s = r.state as any
  r = glyphTap(s as any, 'eye'); r = glyphTap(r.state as any, 'sun'); r = glyphTap(r.state as any, 'ankh')
  assert.equal(r.result, 'done')
})

test('mirrors never start aligned; aligned only at targets; four turns return to start', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const m = makeMirrors(seededRng(seed), 4)
    assert.ok(!mirrorsAligned(m), `seed ${seed} started aligned`)
    assert.ok(m.targets.some(t => t !== 0))
    assert.ok(mirrorsAligned({ ...m, angles: [...m.targets] }))
    let t = m
    for (let k = 0; k < 4; k++) t = turnMirror(t, 0)
    assert.deepEqual(t.angles, m.angles)
  }
})

test('mirror aligned count reports partial progress', () => {
  const m = { targets: [1, 2, 3, 0], angles: [1, 0, 3, 0] }
  assert.equal(mirrorsAlignedCount(m), 3)
})

test('scarab collection dedupes and completes at the needed count', () => {
  let r = collectScarab([], 'a', 2); assert.equal(r.done, false)
  r = collectScarab(r.found, 'a', 2); assert.deepEqual(r.found, ['a']); assert.equal(r.done, false)
  r = collectScarab(r.found, 'b', 2); assert.equal(r.done, true)
})

test('guardian: inside strikes count, a miss resets, done at need', () => {
  let r = guardianStrike(0, true, 3); assert.equal(r.result, 'hit'); assert.equal(r.hits, 1)
  r = guardianStrike(r.hits, false, 3); assert.equal(r.result, 'miss'); assert.equal(r.hits, 0)
  r = guardianStrike(2, true, 3); assert.equal(r.result, 'done')
})

test('guardian position is a triangle wave within [0,1]', () => {
  assert.equal(guardianPosition(0), 0)
  assert.equal(guardianPosition(1), 1)
  assert.equal(guardianPosition(2), 0)
  for (let p = 0; p < 10; p += 0.037) {
    const v = guardianPosition(p)
    assert.ok(v >= 0 && v <= 1)
  }
})

test('challenge chain is five steps with non-decreasing difficulty and matching ids', () => {
  assert.equal(CHALLENGES.length, 5)
  assert.deepEqual(CHALLENGES.map(c => c.id), ['memory', 'glyph', 'mirror', 'scarab', 'guardian'])
  for (let i = 1; i < CHALLENGES.length; i++) assert.ok(CHALLENGES[i].difficulty >= CHALLENGES[i - 1].difficulty)
  assert.ok(LEVELS.scarab.spots.length >= LEVELS.scarab.need)
})
