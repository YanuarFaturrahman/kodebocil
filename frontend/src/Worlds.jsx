import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from './api'
import { ICON } from './Games'

const TIERS = [['Pemula', '#2fbf71'], ['Mudah', '#3ba7ff'], ['Sedang', '#ffb300'], ['Sulit', '#ff6b6b'], ['Pakar', '#7b5cff']]
const keyOf = l => l.category_id ?? 'none'

function groups(ls) {
  const gs = []
  ls.forEach(l => {
    let g = gs.find(g => g.key === keyOf(l))
    if (!g) { g = { key: keyOf(l), name: l.world, emoji: l.emoji, items: [] }; gs.push(g) }
    g.items.push(l)
  })
  gs.forEach((g, i) => {
    const k = Math.min(4, Math.floor(i * 5 / gs.length))
    g.tier = TIERS[k][0]; g.color = TIERS[k][1]; g.flames = k + 1
    g.done = g.items.filter(l => l.stars).length; g.stars = g.items.reduce((a, l) => a + l.stars, 0)
  })
  return gs
}
const Stars = ({ n }) => <span className="stars">{[1, 2, 3].map(s => <span key={s} className={s <= n ? 'on' : ''}>★</span>)}</span>

export function Worlds() {
  const [ls, setLs] = useState(null)
  useEffect(() => { api('/lessons').then(setLs) }, [])
  if (!ls) return <p className="load">Memuat…</p>
  const gs = groups(ls), done = ls.filter(l => l.stars).length
  return (
    <div className="stack">
      <div className="wl-head"><h2>🌍 Pilih Dunia Petualangan</h2>
        <p>{done} dari {ls.length} level selesai • ⭐ {ls.reduce((a, l) => a + l.stars, 0)}/{ls.length * 3}</p>
        <div className="bar"><i style={{ width: (ls.length ? done / ls.length * 100 : 0) + '%' }} /></div></div>
      <div className="wl-grid">
        {gs.map((g, i) => (
          <Link key={g.key} to={'/play/c/' + g.key} className="wl-card" style={{ '--c': g.color, '--i': i }}>
            <span className="wl-em">{g.emoji}</span><b>{g.name}</b>
            <span><span className="rm-chip">{g.tier}</span> <span title="Tingkat kesulitan">{'🔥'.repeat(g.flames)}</span></span>
            <div className="bar"><i style={{ width: g.done / g.items.length * 100 + '%' }} /></div>
            <small>{g.done}/{g.items.length} level • ⭐ {g.stars}/{g.items.length * 3}</small>
          </Link>))}
      </div>
      {!ls.length && <div className="card">Belum ada game. Minta admin menambahkannya ya.</div>}
    </div>)
}

export function World() {
  const { cid } = useParams(), nav = useNavigate()
  const [ls, setLs] = useState(null), [msg, setMsg] = useState('')
  useEffect(() => { api('/lessons').then(setLs) }, [])
  if (!ls) return <p className="load">Memuat…</p>
  const g = groups(ls).find(g => String(g.key) === cid)
  if (!g) return <div className="card"><p>Dunia tidak ditemukan.</p><Link to="/play" className="btn">Kembali</Link></div>
  const lock = () => { setMsg('Selesaikan level sebelumnya dulu ya! 🔒'); setTimeout(() => setMsg(''), 2200) }
  return (
    <div className="stack" style={{ '--c': g.color }}>
      <Link to="/play" className="link">⬅ Semua dunia</Link>
      <div className="wl-banner"><span className="wl-em">{g.emoji}</span>
        <div className="grow"><h2>{g.name}</h2><span className="rm-chip">{g.tier}</span> {'🔥'.repeat(g.flames)}
          <div className="bar"><i style={{ width: g.done / g.items.length * 100 + '%' }} /></div>
          <small>{g.done}/{g.items.length} level selesai</small></div></div>
      <div className="lv-grid">
        {g.items.map((l, i) => {
          const locked = i > 0 && g.items[i - 1].stars === 0
          return (
            <button key={l.id} style={{ '--i': i }} className={'lv-card ' + (locked ? 'lock' : l.stars ? 'done' : 'now')} onClick={() => locked ? lock() : nav('/play/' + l.id)}>
              <span className="lv-n">{locked ? '🔒' : i + 1}</span><span className="lv-ic">{ICON[l.kind] || '🎮'}</span>
              <b>{l.title}</b><small>{l.description}</small><Stars n={l.stars} />
            </button>)
        })}
      </div>
      {msg && <div className="rm-toast" role="status">{msg}</div>}
    </div>)
}
