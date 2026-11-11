let context: AudioContext | null = null
let master: GainNode | null = null
let droneGain: GainNode | null = null
let motifTimer: number | null = null
let muted = false
let started = false
let scene: 'explore' | 'puzzle' = 'explore'
let duckTimer: number | null = null

const notes = [110, 130.81, 146.83, 164.81, 196, 220]

function tone(frequency: number, duration = 1.8, volume = 0.035) {
  if (!context || !master || muted || context.state !== 'running') return
  const osc = context.createOscillator()
  const gain = context.createGain()
  const filter = context.createBiquadFilter()
  osc.type = 'sine'
  osc.frequency.value = frequency
  filter.type = 'lowpass'
  filter.frequency.value = scene === 'puzzle' ? 620 : 900
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.25)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
  osc.connect(filter).connect(gain).connect(master)
  osc.start()
  osc.stop(context.currentTime + duration + 0.05)
}

function build() {
  if (!context) context = new AudioContext()
  if (master) return
  master = context.createGain()
  master.gain.value = 0.0001
  master.connect(context.destination)
  droneGain = context.createGain()
  droneGain.gain.value = 0.22
  const low = context.createOscillator()
  low.type = 'triangle'
  low.frequency.value = 55
  const fifth = context.createOscillator()
  fifth.type = 'sine'
  fifth.frequency.value = 82.41
  const lowFilter = context.createBiquadFilter()
  lowFilter.type = 'lowpass'
  lowFilter.frequency.value = 180
  low.connect(lowFilter)
  fifth.connect(lowFilter)
  lowFilter.connect(droneGain).connect(master)
  low.start()
  fifth.start()
}

export async function startMusic() {
  if (typeof window === 'undefined') return
  try {
    build()
    await context!.resume()
    started = true
    if (master) {
      master.gain.cancelScheduledValues(context!.currentTime)
      master.gain.setTargetAtTime(muted ? 0.0001 : 0.62, context!.currentTime, 1.2)
    }
    if (motifTimer === null) {
      let step = 0
      motifTimer = window.setInterval(() => {
        if (!context || context.state !== 'running' || muted) return
        const sequence = scene === 'puzzle' ? [0, 3, 2, 1] : [0, 2, 3, 2, 4, 3]
        const base = notes[sequence[step % sequence.length]]
        tone(base * 2, scene === 'puzzle' ? 1.15 : 1.7, scene === 'puzzle' ? 0.018 : 0.013)
        if (step % 4 === 0) tone(65.41, 2.2, 0.012)
        step++
      }, 2100)
    }
  } catch (error) {
    console.warn('OSIRIS audio could not start:', error)
  }
}

export function setMusicMuted(value: boolean) {
  muted = value
  try { localStorage.setItem('osiris-muted', value ? '1' : '0') } catch {}
  if (master && context) master.gain.setTargetAtTime(value ? 0.0001 : 0.62, context.currentTime, 0.35)
}

export function getMusicMuted() {
  try { muted = localStorage.getItem('osiris-muted') === '1' } catch {}
  return muted
}

export function setMusicScene(value: 'explore' | 'puzzle') {
  scene = value
  if (master && context) master.gain.setTargetAtTime(value === 'puzzle' ? 0.42 : 0.62, context.currentTime, 0.8)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!context || !started) return
    if (document.hidden) context.suspend().catch(() => {})
    else context.resume().catch(() => {})
  })
}

export function duckMusic() {
  if (!master || !context || muted) return
  master.gain.setTargetAtTime(0.22, context.currentTime, 0.12)
  if (duckTimer !== null) window.clearTimeout(duckTimer)
  duckTimer = window.setTimeout(() => {
    if (master && context && !muted) master.gain.setTargetAtTime(scene === 'puzzle' ? 0.42 : 0.62, context.currentTime, 0.7)
    duckTimer = null
  }, 1500)
}
