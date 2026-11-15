import { useEffect, useState } from 'react'

const MSG = ['Membangunkan robot… 🤖', 'Menghitung bintang… ⭐', 'Menyiapkan labirin… 🧩', 'Mengisi baterai… 🔋', 'Siap bermain! 🚀']

const DOTS = [[6, 14, 0, '#ff6b6b'], [18, 9, 3, '#ffd23f'], [32, 12, 6, '#2fbf71'], [47, 8, 1, '#7b5cff'], [61, 13, 5, '#3ba7ff'], [74, 10, 2, '#ff6b6b'], [86, 15, 7, '#ffd23f'], [95, 9, 4, '#2fbf71']]
const GROUND = [['🌳', 3], ['🌷', 20], ['🍄', 44], ['🌻', 68], ['🌳', 92]]
export function Bg({ scene = 'day' }) {
  return (
    <div className={'bg ' + scene} aria-hidden="true">
      <div className="sun" /><div className="stars" />
      <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" />
      {DOTS.map((d, i) => <i key={i} className="dot" style={{ left: d[0] + '%', width: d[1], height: d[1], background: d[3], animationDelay: -d[2] + 's', animationDuration: 12 + d[1] + 's' }} />)}
      <svg className="hills h2" viewBox="0 0 1440 320" preserveAspectRatio="none"><path d="M0 200 C240 120 420 280 720 200 S1200 120 1440 220 V320 H0Z" /></svg>
      <svg className="hills h1" viewBox="0 0 1440 320" preserveAspectRatio="none"><path d="M0 250 C200 190 380 300 640 240 S1100 180 1440 260 V320 H0Z" /></svg>
      {GROUND.map((g, i) => <em key={i} className="gr" style={{ left: g[1] + '%', animationDelay: -i + 's' }}>{g[0]}</em>)}
      {['🚀', '🎈', '🪐', '⭐', '🦋', '🌈'].map((e, i) => <span key={i}>{e}</span>)}
    </div>)
}

export function Splash({ onDone }) {
  const [pct, setPct] = useState(0), [ready, setReady] = useState(false), [out, setOut] = useState(false)
  useEffect(() => {
    const t0 = Date.now(), cap = setTimeout(() => setReady(true), 4000)
    ;(document.fonts?.ready || Promise.resolve()).then(() => setTimeout(() => setReady(true), Math.max(0, 1900 - (Date.now() - t0))))
    return () => clearTimeout(cap)
  }, [])
  useEffect(() => {
    const id = setInterval(() => setPct(p => ready ? Math.min(100, p + 4) : Math.min(88, p + Math.random() * 3)), 60)
    return () => clearInterval(id)
  }, [ready])
  const full = pct >= 100
  useEffect(() => {
    if (!full) return
    const a = setTimeout(() => setOut(true), 450), b = setTimeout(onDone, 950)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [full])
  const n = Math.floor(pct)
  return (
    <div className={'splash' + (out ? ' out' : '')} role="status" aria-label={`Memuat ${n} persen`}>
      <div className="sp-bg" aria-hidden="true">{['☁️', '⭐', '☁️', '🎈', '⭐', '🪐'].map((e, i) => <span key={i}>{e}</span>)}</div>
      <div className="sp-logo"><div className="sp-bot">🤖</div><h1>KodeBocil</h1><p>Belajar coding sambil bermain!</p></div>
      <div className="sp-wrap">
        <span className="sp-rocket" style={{ left: n + '%' }}>🚀</span>
        <div className="sp-track"><div className="sp-fill" style={{ width: n + '%' }} /></div>
      </div>
      <div className="sp-pct">{n}%</div>
      <div className="sp-msg">{MSG[Math.min(MSG.length - 1, Math.floor(n / 100 * MSG.length))]}</div>
    </div>)
}

export function Confetti() {
  const [bits] = useState(() => Array.from({ length: 40 }, (_, i) => ({
    l: Math.random() * 100, d: Math.random() * 0.9, t: 1.8 + Math.random() * 1.6, c: ['#ffd23f', '#ff6b6b', '#3ba7ff', '#2fbf71', '#7b5cff'][i % 5],
  })))
  return <div className="confetti" aria-hidden="true">{bits.map((b, i) => <i key={i} style={{ left: b.l + '%', background: b.c, animationDelay: b.d + 's', animationDuration: b.t + 's' }} />)}</div>
}
