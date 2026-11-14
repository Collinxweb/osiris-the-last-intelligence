// Procedural score built with Web Audio: a 16-step loop with bass, melody with echo,
// kick, tom and hi-hat percussion, and a tremolo tension layer. Nothing is downloaded.

export type Mood = 'explore' | 'puzzle' | 'tension'

const NOTE: Record<string, number> = {
  D2: 73.42, A2: 110, Bb2: 116.54, D3: 146.83, Eb3: 155.56, F3: 174.61, G3: 196, A3: 220,
  Bb3: 233.08, C4: 261.63, D4: 293.66, Eb4: 311.13, F4: 349.23, G4: 392, A4: 440
}
const BPM: Record<Mood, number> = { explore: 76, puzzle: 90, tension: 110 }
const BASS: (string | null)[] = ['D2', null, null, null, null, null, 'D2', null, 'A2', null, null, null, 'D2', null, 'Bb2', null]
// Four melodic bars in D Phrygian, cycled. Null is a rest.
const MELODY: (string | null)[][] = [
  ['D4', null, null, 'F4', null, 'Eb4', null, null, 'D4', null, 'C4', null, 'Bb3', null, null, null],
  ['A3', null, 'C4', null, 'D4', null, null, 'F4', null, 'Eb4', null, 'D4', null, null, 'A3', null],
  ['D4', null, 'F4', null, 'G4', null, 'A4', null, 'G4', null, 'F4', null, 'Eb4', null, 'D4', null],
  ['A4', null, null, 'G4', null, 'F4', null, 'Eb4', null, 'D4', null, null, 'C4', null, 'D4', null]
]

let ctx: AudioContext | null = null
let master: GainNode | null = null
let echoIn: AudioNode | null = null
let tensionEnv: GainNode | null = null
let noise: AudioBuffer | null = null
let schedulerId: number | null = null
let duckTimer: number | null = null
let nextTime = 0
let stepIndex = 0
let muted = false
let mood: Mood = 'explore'

const baseLevel = () => (muted ? 0.0001 : mood === 'puzzle' ? 0.5 : 0.6)

function build(): AudioContext {
  if (ctx) return ctx
  const c = new AudioContext()
  ctx = c

  master = c.createGain()
  master.gain.value = 0.0001
  master.connect(c.destination)

  // Echo for the melody: a dotted-eighth style delay with feedback.
  const delay = c.createDelay(1)
  delay.delayTime.value = 0.36
  const feedback = c.createGain()
  feedback.gain.value = 0.32
  const wet = c.createGain()
  wet.gain.value = 0.35
  delay.connect(feedback).connect(delay)
  delay.connect(wet).connect(master)
  echoIn = delay

  // Always-on low drone.
  const drone = c.createGain()
  drone.gain.value = 0.16
  const droneLp = c.createBiquadFilter()
  droneLp.type = 'lowpass'
  droneLp.frequency.value = 220
  for (const [type, freq] of [['triangle', 55], ['sine', 82.41], ['sine', 110.4]] as const) {
    const o = c.createOscillator()
    o.type = type
    o.frequency.value = freq
    o.connect(droneLp)
    o.start()
  }
  droneLp.connect(drone).connect(master)

  // Tension layer: a tritone pair (Bb1 + E2) with tremolo, faded in during 'tension'.
  tensionEnv = c.createGain()
  tensionEnv.gain.value = 0
  const trem = c.createGain()
  trem.gain.value = 0.5
  const lfo = c.createOscillator()
  lfo.frequency.value = 5.5
  const lfoDepth = c.createGain()
  lfoDepth.gain.value = 0.5
  lfo.connect(lfoDepth).connect(trem.gain)
  lfo.start()
  const tensionLp = c.createBiquadFilter()
  tensionLp.type = 'lowpass'
  tensionLp.frequency.value = 260
  for (const freq of [58.27, 82.41]) {
    const saw = c.createOscillator()
    saw.type = 'sawtooth'
    saw.frequency.value = freq
    saw.connect(tensionLp)
    saw.start()
  }
  tensionLp.connect(trem).connect(tensionEnv).connect(master)

  // One second of white noise, reused for hi-hats.
  noise = c.createBuffer(1, c.sampleRate, c.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return c
}

function envelope(g: GainNode, t: number, peak: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
}

function kick(t: number, vol: number) {
  const c = ctx!
  const o = c.createOscillator()
  const g = c.createGain()
  o.frequency.setValueAtTime(120, t)
  o.frequency.exponentialRampToValueAtTime(42, t + 0.18)
  envelope(g, t, vol, 0.4)
  o.connect(g).connect(master!)
  o.start(t)
  o.stop(t + 0.45)
}

function tom(t: number, vol: number) {
  const c = ctx!
  const o = c.createOscillator()
  const g = c.createGain()
  o.frequency.setValueAtTime(200, t)
  o.frequency.exponentialRampToValueAtTime(110, t + 0.22)
  envelope(g, t, vol, 0.28)
  o.connect(g).connect(master!)
  o.start(t)
  o.stop(t + 0.3)
}

function hat(t: number, vol: number) {
  const c = ctx!
  const s = c.createBufferSource()
  const f = c.createBiquadFilter()
  const g = c.createGain()
  s.buffer = noise
  f.type = 'highpass'
  f.frequency.value = 7000
  envelope(g, t, vol, 0.06)
  s.connect(f).connect(g).connect(master!)
  s.start(t, Math.random() * 0.5)
  s.stop(t + 0.08)
}

function note(t: number, freq: number, dur: number, vol: number, type: OscillatorType, cutoff: number, echo: boolean) {
  const c = ctx!
  const o = c.createOscillator()
  const f = c.createBiquadFilter()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  f.type = 'lowpass'
  f.frequency.value = cutoff
  envelope(g, t, vol, dur)
  o.connect(f).connect(g).connect(master!)
  if (echo && echoIn) g.connect(echoIn)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function scheduleStep(t: number, s: number) {
  const i = s % 16
  const bar = Math.floor(s / 16)
  const tense = mood === 'tension'
  const puzzle = mood === 'puzzle'

  if (i === 0 || i === 8 || (tense && (i === 10 || i === 14))) kick(t, tense ? 0.8 : 0.6)
  if (i === 6 || i === 14) tom(t, tense ? 0.2 : 0.14)

  const hatOn = tense ? true : puzzle ? i % 2 === 0 : i % 4 === 2
  if (hatOn) hat(t, tense ? 0.05 : i % 4 === 0 ? 0.06 : 0.04)

  const b = BASS[i]
  if (b) note(t, NOTE[b], 0.5, 0.11, 'triangle', 280, false)

  const m = MELODY[bar % MELODY.length][i]
  if (m) note(t, NOTE[m], 0.7, tense ? 0.045 : puzzle ? 0.07 : 0.085, tense ? 'sawtooth' : 'triangle', puzzle ? 1400 : 2200, true)
}

function pump() {
  if (!ctx || ctx.state !== 'running') return
  const stepDur = 60 / BPM[mood] / 4
  while (nextTime < ctx.currentTime + 0.12) {
    scheduleStep(nextTime, stepIndex)
    nextTime += stepDur
    stepIndex++
  }
}

export async function startMusic() {
  if (typeof window === 'undefined') return
  try {
    const c = build()
    await c.resume()
    nextTime = c.currentTime + 0.05
    master!.gain.cancelScheduledValues(c.currentTime)
    master!.gain.setTargetAtTime(baseLevel(), c.currentTime, 1.2)
    if (schedulerId === null) schedulerId = window.setInterval(pump, 25)
  } catch (error) {
    console.warn('OSIRIS audio could not start:', error)
  }
}

export function setMusicMuted(value: boolean) {
  muted = value
  try { localStorage.setItem('osiris-muted', value ? '1' : '0') } catch {}
  if (master && ctx) master.gain.setTargetAtTime(baseLevel(), ctx.currentTime, 0.35)
}

export function getMusicMuted() {
  try { muted = localStorage.getItem('osiris-muted') === '1' } catch {}
  return muted
}

export function setMusicScene(value: Mood) {
  mood = value
  if (master && ctx) master.gain.setTargetAtTime(baseLevel(), ctx.currentTime, 0.8)
  if (tensionEnv && ctx) tensionEnv.gain.setTargetAtTime(value === 'tension' ? 0.16 : 0, ctx.currentTime, 1.2)
}

export function duckMusic() {
  if (!master || !ctx || muted) return
  master.gain.setTargetAtTime(0.22, ctx.currentTime, 0.12)
  if (duckTimer !== null) window.clearTimeout(duckTimer)
  duckTimer = window.setTimeout(() => {
    if (master && ctx && !muted) master.gain.setTargetAtTime(baseLevel(), ctx.currentTime, 0.7)
    duckTimer = null
  }, 1500)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) {
      void ctx.suspend()
    } else {
      void ctx.resume().then(() => { nextTime = ctx!.currentTime + 0.05 })
    }
  })
}
