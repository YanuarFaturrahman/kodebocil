let ctx, mg, noise
const muted = () => localStorage.getItem('kb_mute') === '1'
const musicOn = () => localStorage.getItem('kb_music') !== '0'
const audio = () => {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    mg = ctx.createGain(); mg.gain.value = 0.0001; mg.connect(ctx.destination)
    noise = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate)
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  ctx.resume?.(); return ctx
}
const tone = (f, d, s, type = 'sine', v = 0.08, out) => {
  const c = audio(), o = c.createOscillator(), g = c.createGain()
  o.type = type; o.frequency.setValueAtTime(f, s)
  g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(0.0001, s + d)
  o.connect(g); g.connect(out || c.destination); o.start(s); o.stop(s + d + 0.02)
}
const kick = (s, out) => {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.frequency.setValueAtTime(140, s); o.frequency.exponentialRampToValueAtTime(45, s + 0.12)
  g.gain.setValueAtTime(0.22, s); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.15)
  o.connect(g); g.connect(out); o.start(s); o.stop(s + 0.16)
}
const hat = (s, out) => {
  const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain()
  n.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000
  g.gain.setValueAtTime(0.05, s); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.04)
  n.connect(f); f.connect(g); g.connect(out); n.start(s); n.stop(s + 0.05)
}

export const sfx = {
  muted,
  toggle() { const m = !muted(); localStorage.setItem('kb_mute', m ? '1' : '0'); if (!m) this.play('tap'); return m },
  play(k) {
    if (muted()) return
    try {
      const t = audio().currentTime
      if (k === 'tap') tone(660, 0.08, t, 'triangle')
      if (k === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, t + i * 0.12, 'square', 0.05))
    } catch { /* browser belum mengizinkan suara */ }
  },
}

// Musik latar ceria (dibuat langsung oleh browser, tanpa file audio)
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21], PROG = [0, -3, -7, -5]
const TRACKS = [
  { bpm: 116, root: 261.63, mel: [4, 5, 6, 5, 4, 2, 0, 2, 3, 4, 5, 4, 3, 1, 0, 1, 2, 4, 5, 6, 5, 4, 2, -1, 4, 6, 5, 4, 2, 1, 0, -1] },
  { bpm: 104, root: 293.66, mel: [0, 2, 4, 2, 0, 2, 4, 6, 5, 4, 2, 4, 5, 4, 2, 0, 3, 5, 6, 5, 3, 5, 6, 8, 7, 6, 5, 4, 2, 0, -1, -1] },
  { bpm: 124, root: 329.63, mel: [6, -1, 4, 6, 7, 6, 4, -1, 5, -1, 3, 5, 6, 5, 3, -1, 4, 6, 7, 9, 7, 6, 4, 2, 3, 4, 5, 3, 2, 0, -1, -1] },
]
let timer = null, step = 0, next = 0, trk = TRACKS[0], want = false
const beat = (i, t) => {
  const m = trk.mel[i]
  if (m >= 0) tone(trk.root * 2 ** (SCALE[m] / 12), 0.28, t, 'triangle', 0.07, mg)
  if (i % 2 === 0) { const b = trk.root / 2 * 2 ** (PROG[i >> 3] / 12); tone(i % 4 === 0 ? b : b * 1.5, 0.3, t, 'sine', 0.1, mg) }
  if (i % 4 === 0) kick(t, mg)
  if (i % 2 === 1) hat(t, mg)
}
const sched = () => { while (next < ctx.currentTime + 0.35) { beat(step, next); next += 30 / trk.bpm; step = (step + 1) % 32 } }

export const music = {
  on: musicOn,
  start(seed = 0) { want = true; trk = TRACKS[Math.abs(seed) % TRACKS.length]; if (musicOn()) this.run() },
  run() {
    if (timer) return
    try {
      audio(); mg.gain.cancelScheduledValues(ctx.currentTime)
      mg.gain.setValueAtTime(0.0001, ctx.currentTime); mg.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1)
      step = 0; next = ctx.currentTime + 0.1; timer = setInterval(sched, 100)
    } catch { timer = null }
  },
  halt() {
    if (!timer) return
    clearInterval(timer); timer = null
    mg.gain.cancelScheduledValues(ctx.currentTime); mg.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08)
  },
  stop() { want = false; this.halt() },
  toggle() {
    const on = !musicOn(); localStorage.setItem('kb_music', on ? '1' : '0')
    if (on) { if (want) this.run() } else this.halt()
    return on
  },
}
document.addEventListener('visibilitychange', () => { if (ctx) document.hidden ? ctx.suspend() : ctx.resume() })
