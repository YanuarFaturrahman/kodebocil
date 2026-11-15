import { useState } from 'react'

export const ICON = { maze: '🧩', pattern: '🔢', urutan: '📋', quiz: '❓', memori: '🃏', lampu: '💡', pasang: '🔗', ganjil: '🔎', debug: '🐞', angka: '⚡', piksel: '🎨' }
export const KINDS = [['pattern', '🔢 Tebak pola'], ['maze', '🧩 Labirin robot'], ['memori', '🃏 Kartu memori'], ['urutan', '📋 Susun urutan'], ['quiz', '❓ Jika-Maka / Kuis'], ['lampu', '💡 Lampu ajaib'], ['pasang', '🔗 Pasangkan'], ['ganjil', '🔎 Cari yang beda'], ['debug', '🐞 Cari bug'], ['angka', '⚡ Ketuk angka urut'], ['piksel', '🎨 Gambar piksel']]
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const stars = t => t === 0 ? 3 : t < 3 ? 2 : 1

export function Memory({ c, onWin }) {
  const [cards] = useState(() => shuffle([...c.pairs, ...c.pairs]))
  const [open, setOpen] = useState([]), [done, setDone] = useState([]), [moves, setMoves] = useState(0), [busy, setBusy] = useState(false)
  const n = c.pairs.length, cols = cards.length <= 4 ? 2 : cards.length <= 6 ? 3 : 4
  const flip = i => {
    if (busy || open.includes(i) || done.includes(cards[i])) return
    const o = [...open, i]; setOpen(o)
    if (o.length < 2) return
    const m = moves + 1, hit = cards[o[0]] === cards[o[1]]
    setMoves(m); setBusy(true)
    setTimeout(() => {
      if (hit) { const d = [...done, cards[o[0]]]; setDone(d); if (d.length === n) onWin(m <= n + 2 ? 3 : m <= n * 2 ? 2 : 1) }
      setOpen([]); setBusy(false)
    }, 700)
  }
  return (<div className="stack"><div className="card">Langkah: <b>{moves}</b> • Pasangan: <b>{done.length}/{n}</b></div>
    <div className="mem" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
      {cards.map((e, i) => { const up = open.includes(i) || done.includes(e)
        return <button key={i} className={'mc' + (up ? ' up' : '') + (done.includes(e) ? ' ok' : '')} onClick={() => flip(i)} aria-label={up ? e : 'kartu tertutup'}>{up ? e : '❓'}</button> })}
    </div></div>)
}

export function Order({ c, onWin }) {
  const [pool, setPool] = useState(() => shuffle(c.steps)), [pick, setPick] = useState([]), [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const add = k => { setPick([...pick, pool[k]]); setPool(pool.filter((_, i) => i !== k)); setMsg('') }
  const undo = k => { setPool([...pool, pick[k]]); setPick(pick.filter((_, i) => i !== k)) }
  const check = () => {
    if (pick.every((s, i) => s === c.steps[i])) return onWin(stars(tries))
    setTries(tries + 1); setMsg('Urutannya belum tepat. Coba susun lagi!'); setPool(shuffle(c.steps)); setPick([])
  }
  return (<div className="stack">
    <div className="card"><b>Urutanmu:</b>{pick.length ? pick.map((s, i) => <button key={i} className="btn stp" onClick={() => undo(i)}>{i + 1}. {s}</button>) : <div><small>Ketuk langkah di bawah, mulai dari yang pertama.</small></div>}</div>
    <div className="card"><b>Langkah:</b>{pool.map((s, i) => <button key={i} className="btn ghost stp" onClick={() => add(i)}>{s}</button>)}</div>
    {msg && <div className="err">{msg}</div>}
    <button className="btn" disabled={pool.length > 0} onClick={check}>✅ Periksa urutan</button></div>)
}

export function Quiz({ c, onWin }) {
  const [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const pick = o => o === c.answer ? onWin(stars(tries)) : (setTries(tries + 1), setMsg('Belum tepat. Baca pelan-pelan lalu coba lagi!'))
  return (<div className="stack"><div className="card quiz"><p>{c.q}</p>{c.show && <div className="show">{c.show}</div>}</div>
    {msg && <div className="err">{msg}</div>}
    <div className="stack">{c.options.map(o => <button key={o} className="btn opt" onClick={() => pick(o)}>{o}</button>)}</div></div>)
}

export function Lamps({ c, onWin }) {
  const vals = Array.from({ length: c.bits }, (_, i) => 2 ** (c.bits - 1 - i))
  const [on, setOn] = useState([]), [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const sum = on.reduce((a, v) => a + v, 0)
  const toggle = v => { setOn(on.includes(v) ? on.filter(x => x !== v) : [...on, v]); setMsg('') }
  const check = () => sum === c.target ? onWin(stars(tries)) : (setTries(tries + 1), setMsg(sum > c.target ? 'Terlalu terang! Matikan beberapa lampu.' : 'Masih kurang. Nyalakan lampu lainnya!'))
  return (<div className="stack"><div className="card quiz"><p>Nyalakan lampu agar jumlah nilainya sama dengan target.</p><div className="show">🎯 {c.target}</div><p>Jumlah sekarang: <b>{sum}</b></p></div>
    <div className="pad">{vals.map(v => <button key={v} className={'lamp' + (on.includes(v) ? ' on' : '')} onClick={() => toggle(v)} aria-pressed={on.includes(v)}><span>{on.includes(v) ? '💡' : '⚫'}</span><b>{v}</b></button>)}</div>
    {msg && <div className="err">{msg}</div>}
    <button className="btn" onClick={check}>✅ Periksa</button></div>)
}

export function Match({ c, onWin }) {
  const [left] = useState(() => shuffle(c.pairs.map(p => p[0]))), [right] = useState(() => shuffle(c.pairs.map(p => p[1])))
  const [sel, setSel] = useState(null), [done, setDone] = useState([]), [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const pickR = r => {
    if (sel === null) return setMsg('Ketuk gambar di kiri dulu ya.')
    if (c.pairs.some(p => p[0] === sel && p[1] === r)) { const d = [...done, sel]; setDone(d); setSel(null); setMsg(''); if (d.length === c.pairs.length) onWin(stars(tries)) }
    else { setTries(tries + 1); setSel(null); setMsg('Belum cocok. Coba lagi!') }
  }
  return (<div className="stack"><p>Pasangkan gambar dengan artinya: ketuk gambar, lalu ketuk pasangannya.</p>
    <div className="match"><div className="stack">{left.map(l => <button key={l} disabled={done.includes(l)} className={'btn mt' + (sel === l ? ' sel' : '')} onClick={() => { setSel(l); setMsg('') }}>{l}</button>)}</div>
      <div className="stack">{right.map(r => <button key={r} disabled={c.pairs.some(p => p[1] === r && done.includes(p[0]))} className="btn ghost mt" onClick={() => pickR(r)}>{r}</button>)}</div></div>
    {msg && <div className="err">{msg}</div>}</div>)
}

export function Odd({ c, onWin }) {
  const [items] = useState(() => shuffle(c.items)), [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const pick = it => it === c.answer ? onWin(stars(tries)) : (setTries(tries + 1), setMsg('Itu sama dengan yang lain. Cari yang berbeda!'))
  return (<div className="stack"><div className="card quiz"><p>{c.q}</p></div>{msg && <div className="err">{msg}</div>}
    <div className="odd">{items.map((it, i) => <button key={i} className="btn sq" onClick={() => pick(it)}>{it}</button>)}</div></div>)
}

export function Debug({ c, onWin }) {
  const [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const pick = i => i === c.bug ? onWin(stars(tries)) : (setTries(tries + 1), setMsg('Langkah itu sudah benar. Cari bug-nya lagi! 🐞'))
  return (<div className="stack"><div className="card quiz"><p>🐞 {c.q}</p></div>{msg && <div className="err">{msg}</div>}
    <div className="card">{c.steps.map((s, i) => <button key={i} className="btn ghost stp" onClick={() => pick(i)}>{i + 1}. {s}</button>)}</div></div>)
}

export function Tap({ c, onWin }) {
  const order = [...c.values].sort((a, b) => c.desc ? b - a : a - b), [tiles] = useState(() => shuffle(c.values))
  const [k, setK] = useState(0), [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const tap = v => {
    if (v !== order[k]) { setTries(tries + 1); return setMsg('Bukan yang itu. Cari angka ' + (c.desc ? 'terbesar' : 'terkecil') + ' yang tersisa!') }
    setMsg(''); setK(k + 1); if (k + 1 === order.length) onWin(stars(tries))
  }
  return (<div className="stack"><div className="card quiz"><p>Ketuk angka dari yang {c.desc ? 'terbesar ke terkecil' : 'terkecil ke terbesar'}.</p></div>{msg && <div className="err">{msg}</div>}
    <div className="odd">{tiles.map(v => <button key={v} disabled={order.indexOf(v) < k} className="btn sq" onClick={() => tap(v)}>{v}</button>)}</div></div>)
}

export function Pixel({ c, onWin }) {
  const [on, setOn] = useState([]), [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const cells = Array.from({ length: c.n * c.n }, (_, i) => i), g = { gridTemplateColumns: `repeat(${c.n},1fr)` }
  const check = () => on.length === c.cells.length && c.cells.every(i => on.includes(i)) ? onWin(stars(tries)) : (setTries(tries + 1), setMsg('Belum sama dengan gambar contoh. Periksa lagi kotaknya!'))
  return (<div className="stack"><div className="pxrow">
    <div><b>Contoh</b><div className="pxg sm" style={g}>{cells.map(i => <i key={i} className={'px' + (c.cells.includes(i) ? ' on' : '')} />)}</div></div>
    <div><b>Gambarmu</b><div className="pxg" style={g}>{cells.map(i => <button key={i} className={'px' + (on.includes(i) ? ' on' : '')} aria-label={'kotak ' + (i + 1)} onClick={() => { setOn(on.includes(i) ? on.filter(x => x !== i) : [...on, i]); setMsg('') }} />)}</div></div></div>
    {msg && <div className="err">{msg}</div>}<button className="btn" onClick={check}>✅ Periksa</button></div>)
}
