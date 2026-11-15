import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { api, getUser } from './api'
import { Worlds, World } from './Worlds'
import { Splash, Confetti, Bg } from './Fx'
import { sfx, music } from './sfx'
import { Memory, Order, Quiz, Lamps, Match, Odd, Debug, Tap, Pixel, ICON, KINDS } from './Games'

const AVATARS = ['🐯', '🐼', '🦊', '🐸', '🦄', '🐙', '🚀', '🤖']
const NAV = {
  child: [['/', '🏠', 'Beranda'], ['/play', '🎮', 'Main'], ['/badges', '🏅', 'Lencana'], ['/rank', '🏆', 'Peringkat']],
  parent: [['/', '👨‍👩‍👧', 'Anak'], ['/rank', '🏆', 'Peringkat']],
  admin: [['/', '📊', 'Statistik'], ['/rank', '🏆', 'Peringkat']],
}
const level = xp => Math.floor(xp / 100) + 1

export default function App() {
  const [user, setUser] = useState(getUser())
  const [open, setOpen] = useState(false)
  const nav = useNavigate(), loc = useLocation()
  const [boot, setBoot] = useState(() => !sessionStorage.getItem('kb_boot')), [mute, setMute] = useState(sfx.muted()), [mus, setMus] = useState(music.on())
  const scene = /^\/play\/\d+/.test(loc.pathname) ? 'night' : 'day'
  useEffect(() => {
    const h = e => { if (e.target.closest('.btn,.lv-card,.wl-card,.blink,.dlink,.burger,.mc,.lamp,.px')) sfx.play('tap') }
    document.addEventListener('click', h); return () => document.removeEventListener('click', h)
  }, [])
  const save = u => { localStorage.setItem('kb_user', JSON.stringify(u)); setUser(u) }
  const out = () => { localStorage.removeItem('kb_user'); setUser(null); nav('/') }
  if (boot) return <Splash onDone={() => { sessionStorage.setItem('kb_boot', '1'); setBoot(false) }} />
  if (!user) return <Auth onDone={save} />
  const items = NAV[user.role]
  const links = (cls, onClick) => items.map(([to, ic, t]) => (
    <NavLink key={to} to={to} end={to === '/'} className={cls} onClick={onClick}><span>{ic}</span>{t}</NavLink>))
  return (
    <div className="app"><Bg scene={scene} />
      <header className="top">
        <Link to="/" className="logo">🤖 KodeBocil</Link>
        <div className="tools"><button className={'sfxbtn' + (mus ? '' : ' off')} aria-label="Musik" title="Musik" onClick={() => setMus(music.toggle())}>🎵</button><button className="sfxbtn" aria-label="Efek suara" title="Efek suara" onClick={() => setMute(sfx.toggle())}>{mute ? '🔇' : '🔊'}</button><button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>☰</button></div>
        {open && <div className="scrim" onClick={() => setOpen(false)} />}
        {open && <div className="drawer">{links('dlink', () => setOpen(false))}
          <button className="dlink" onClick={out}><span>🚪</span>Keluar</button></div>}
      </header>
      <main key={loc.pathname} className="page">
        <Routes>
          {user.role === 'child' && <>
            <Route path="/" element={<Home />} /><Route path="/play" element={<Worlds />} /><Route path="/play/c/:cid" element={<World />} />
            <Route path="/play/:id" element={<Lesson />} /><Route path="/badges" element={<Badges />} /></>}
          {user.role === 'parent' && <Route path="/" element={<Parent />} />}
          {user.role === 'admin' && <Route path="/" element={<Admin />} />}
          <Route path="/rank" element={<Rank />} /><Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <nav className="bottom">{links('blink')}<button className="blink" onClick={out}><span>🚪</span>Keluar</button></nav>
    </div>)
}

function Auth({ onDone }) {
  const [reg, setReg] = useState(false), [f, setF] = useState({ name: '', username: '', password: '' }), [err, setErr] = useState('')
  const go = e => { e.preventDefault(); api(reg ? '/register' : '/login', f).then(onDone).catch(() => setErr(reg ? 'Username sudah dipakai atau sandi kurang dari 6 huruf.' : 'Username atau sandi salah.')) }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return (
    <div className="auth"><Bg /><div className="card pop">
      <div className="mascot">🤖</div><h1>KodeBocil</h1><p>Belajar coding sambil bermain!</p>
      <form onSubmit={go}>
        {reg && <input placeholder="Nama orangtua" value={f.name} onChange={set('name')} required />}
        <input placeholder="Username" value={f.username} onChange={set('username')} required />
        <input type="password" placeholder={reg ? 'Sandi (min. 6 huruf)' : 'Sandi / PIN'} value={f.password} onChange={set('password')} required />
        {err && <div className="err">{err}</div>}
        <button className="btn">{reg ? 'Daftar sebagai orangtua' : 'Masuk'}</button>
      </form>
      <button className="link" onClick={() => { setReg(!reg); setErr('') }}>{reg ? 'Sudah punya akun? Masuk' : 'Orangtua baru? Daftar di sini'}</button>
    </div></div>)
}

function XpBar({ xp }) {
  const p = xp % 100
  return <div className="xp"><b>Level {level(xp)}</b><div className="bar"><i style={{ width: p + '%' }} /></div><small>{p}/100 XP menuju level berikutnya</small></div>
}

const TIPS = ['Pelan-pelan saja, salah itu bagian dari belajar!', 'Baca perintahnya sekali lagi sebelum menjalankan robot.', 'Selesaikan level dengan sedikit percobaan untuk dapat 3 bintang ⭐', 'Istirahat sebentar ya, minum air dulu 💧']
function Home() {
  const [m, setM] = useState(null), [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  useEffect(() => { api('/me').then(setM) }, [])
  if (!m) return <p className="load">Memuat…</p>
  const lv = level(m.xp), p = m.xp % 100
  return (<div className="stack">
    <div className="hero2"><div className="hero-av"><span>{m.avatar}</span><b className="lvl">Lv {lv}</b></div>
      <div className="grow"><h2>Halo, {m.name}! 👋</h2><div className="bubble">🤖 {tip}</div></div></div>
    <div className="stats"><div className="stat"><span>⭐</span><b>{m.xp}</b><small>Total XP</small></div>
      <div className="stat"><span>🏆</span><b>{lv}</b><small>Level</small></div>
      <div className="stat"><span>🎯</span><b>{100 - p}</b><small>XP ke level berikutnya</small></div></div>
    <div className="card"><XpBar xp={m.xp} /></div>
    <Link to="/play" className="btn huge wiggle">🎮 Mulai Bermain</Link>
    <div className="quick"><Link to="/badges" className="card qlink">🏅<b>Lencana</b></Link><Link to="/rank" className="card qlink">🏆<b>Peringkat</b></Link></div></div>)
}

function Play() {
  const [ls, setLs] = useState([])
  useEffect(() => { api('/lessons').then(setLs) }, [])
  const worlds = [...new Set(ls.map(l => l.world))]
  return (<div className="stack"><h2>Peta Petualangan</h2>
    {worlds.map(w => <section key={w}><h3 className="world">{ls.find(l => l.world === w).emoji} {w}</h3>
      <div className="grid">{ls.filter(l => l.world === w).map(l => (
        <Link key={l.id} to={'/play/' + l.id} className={'card lv ' + l.kind}>
          <div className="ic">{ICON[l.kind] || '🎮'}</div><b>{l.title}</b><small>{l.description}</small>
          <div className="stars">{[1, 2, 3].map(s => <span key={s} className={s <= l.stars ? 'on' : ''}>★</span>)}</div></Link>))}</div></section>)}
  </div>)
}

function Lesson() {
  const { id } = useParams(), nav = useNavigate()
  const [l, setL] = useState(null), [res, setRes] = useState(null)
  useEffect(() => { music.start(+id); return () => music.stop() }, [id])
  useEffect(() => { if (res) music.stop() }, [res])
  useEffect(() => { api('/lessons').then(a => setL(a.find(x => x.id == id))) }, [id])
  if (!l) return <p className="load">Memuat…</p>
  const back = l.category_id ? '/play/c/' + l.category_id : '/play'
  const win = stars => api(`/lessons/${id}/complete`, { stars }).then(r => { sfx.play('win'); setRes({ ...r, stars }) })
  return (<div className="stack"><button className="link" onClick={() => nav(back)}>⬅ Kembali ke dunia</button>
    <div className="lesson-head"><span className="lh-ic">{ICON[l.kind] || '🎮'}</span><div><h2>{l.title}</h2><p>{l.description}</p></div><span className="lh-xp">+{l.xp_reward} XP</span></div>
    {{ maze: <Maze key={l.id} c={l.content} onWin={win} />, pattern: <Pattern key={l.id} c={l.content} onWin={win} />, memori: <Memory key={l.id} c={l.content} onWin={win} />,
      urutan: <Order key={l.id} c={l.content} onWin={win} />, quiz: <Quiz key={l.id} c={l.content} onWin={win} />, lampu: <Lamps key={l.id} c={l.content} onWin={win} />,
      pasang: <Match key={l.id} c={l.content} onWin={win} />, ganjil: <Odd key={l.id} c={l.content} onWin={win} />, debug: <Debug key={l.id} c={l.content} onWin={win} />,
      angka: <Tap key={l.id} c={l.content} onWin={win} />, piksel: <Pixel key={l.id} c={l.content} onWin={win} /> }[l.kind]}
    {res && <div className="modal"><Confetti /><div className="card pop"><div className="mascot">🎉</div><h2>Hebat!</h2>
      <div className="stars big">{[1, 2, 3].map(s => <span key={s} className={s <= res.stars ? 'on' : ''}>★</span>)}</div>
      <p>{res.gained > 0 ? '+' + res.gained + ' XP.' : 'Level ini sudah pernah selesai, XP hanya didapat sekali.'} Total {res.xp} XP</p>
      {res.new_badges.map(b => <p key={b.name} className="badge-new">{b.emoji} Lencana baru: {b.name}!</p>)}
      <Link to={back} className="btn">Lanjut bermain</Link></div></div>}
  </div>)
}

function Maze({ c, onWin }) {
  const [cmds, setCmds] = useState([]), [pos, setPos] = useState(c.start), [tries, setTries] = useState(0), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const D = { up: [0, -1, '⬆️'], down: [0, 1, '⬇️'], left: [-1, 0, '⬅️'], right: [1, 0, '➡️'] }
  const wall = (x, y) => x < 0 || y < 0 || x >= c.n || y >= c.n || c.walls.some(w => w[0] === x && w[1] === y)
  const run = async () => {
    setBusy(true); setMsg(''); let p = [...c.start]; setPos(p)
    for (const k of cmds) {
      await new Promise(r => setTimeout(r, 450))
      const nx = [p[0] + D[k][0], p[1] + D[k][1]]
      if (wall(...nx)) { setMsg('Aduh, menabrak tembok! Coba lagi.'); setTries(tries + 1); setBusy(false); return }
      p = nx; setPos(p)
    }
    setBusy(false)
    if (p[0] === c.goal[0] && p[1] === c.goal[1]) onWin(tries === 0 ? 3 : tries < 3 ? 2 : 1)
    else { setMsg('Belum sampai ke bintang. Tambah perintah!'); setTries(tries + 1) }
  }
  return (<div className="stack">
    <div className="maze" style={{ gridTemplateColumns: `repeat(${c.n},1fr)` }}>
      {Array.from({ length: c.n * c.n }, (_, i) => { const x = i % c.n, y = Math.floor(i / c.n)
        return <div key={i} className={'cell' + (wall(x, y) ? ' wall' : '')}>{pos[0] === x && pos[1] === y ? '🤖' : x === c.goal[0] && y === c.goal[1] ? '⭐' : wall(x, y) ? '🌳' : ''}</div> })}
    </div>
    <div className="card"><b>Perintah robot:</b><div className="cmds">{cmds.length ? cmds.map((k, i) => <span key={i}>{D[k][2]}</span>) : <small>Tekan tombol panah di bawah</small>}</div></div>
    <div className="pad">{Object.keys(D).map(k => <button key={k} disabled={busy} className="btn sq" onClick={() => setCmds([...cmds, k])}>{D[k][2]}</button>)}</div>
    {msg && <div className="err">{msg}</div>}
    <div className="row"><button className="btn ghost" disabled={busy} onClick={() => { setCmds([]); setPos(c.start); setMsg('') }}>🗑️ Hapus</button>
      <button className="btn" disabled={busy || !cmds.length} onClick={run}>▶️ Jalankan</button></div></div>)
}

function Pattern({ c, onWin }) {
  const [tries, setTries] = useState(0), [msg, setMsg] = useState('')
  const pick = o => o === c.answer ? onWin(tries === 0 ? 3 : tries < 3 ? 2 : 1) : (setTries(tries + 1), setMsg('Hampir! Perhatikan polanya lagi.'))
  return (<div className="stack"><div className="card seq">{c.seq.map((s, i) => <span key={i}>{s}</span>)}<span className="q">❓</span></div>
    {msg && <div className="err">{msg}</div>}
    <div className="pad">{c.options.map(o => <button key={o} className="btn sq" onClick={() => pick(o)}>{o}</button>)}</div></div>)
}

function Badges() {
  const [b, setB] = useState([])
  useEffect(() => { api('/badges').then(setB) }, [])
  return (<div className="stack"><h2>Koleksi Lencana</h2><div className="grid">{b.map(x => (
    <div key={x.name} className={'card badge' + (x.owned ? '' : ' lock')}><div className="ic">{x.owned ? x.emoji : '🔒'}</div><b>{x.name}</b><small>{x.xp_required} XP</small></div>))}</div></div>)
}

function Rank() {
  const [r, setR] = useState([])
  useEffect(() => { api('/leaderboard').then(setR) }, [])
  return (<div className="stack"><h2>Peringkat Juara</h2>{r.map((x, i) => (
    <div key={i} className="card rank"><span className="pos">{['🥇', '🥈', '🥉'][i] || i + 1}</span><span className="av">{x.avatar}</span><b>{x.name}</b><span className="grow" />Lv {level(x.xp)} • {x.xp} XP</div>))}
    {!r.length && <p>Belum ada pemain.</p>}</div>)
}

function Parent() {
  const [kids, setKids] = useState([]), [f, setF] = useState({ name: '', username: '', password: '', avatar: '🐯' }), [err, setErr] = useState('')
  const load = () => api('/children').then(setKids)
  useEffect(() => { load() }, [])
  const add = e => { e.preventDefault(); api('/children', f).then(() => { setF({ name: '', username: '', password: '', avatar: '🐯' }); setErr(''); load() }).catch(() => setErr('Username sudah dipakai atau PIN kurang dari 4 karakter.')) }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return (<div className="stack"><h2>Pantau Anak</h2>
    {kids.map(k => <div key={k.id} className="card"><div className="rank"><span className="av">{k.avatar}</span><b>{k.name}</b><span className="grow" />Lv {level(k.xp)}</div>
      <small>Login: {k.username}</small><div className="bar"><i style={{ width: (k.total ? k.done / k.total * 100 : 0) + '%' }} /></div>
      <small>{k.done} dari {k.total} level selesai • {k.xp} XP</small></div>)}
    <form className="card" onSubmit={add}><h3>Tambah akun anak</h3>
      <input placeholder="Nama anak" value={f.name} onChange={set('name')} required />
      <input placeholder="Username anak" value={f.username} onChange={set('username')} required />
      <input placeholder="PIN (min. 4 karakter)" value={f.password} onChange={set('password')} required />
      <div className="avs">{AVATARS.map(a => <button type="button" key={a} className={f.avatar === a ? 'sel' : ''} onClick={() => setF({ ...f, avatar: a })}>{a}</button>)}</div>
      {err && <div className="err">{err}</div>}<button className="btn">Simpan</button></form></div>)
}

const EMPTY = { title: '', description: '', kind: 'pattern', category_id: '', xp_reward: 20, n: 5, start: '0,0', goal: '4,4', walls: '', seq: '🍎,🍌,🍎,🍌', options: '🍌,🍎,🍇', answer: '🍌', steps: '', q: '', show: '', pairs: '🍎,🍌,🍇', bits: 3, target: 5, lines: '', bug: 1, items: '', values: '', desc: 'asc', cells: [] }
const nums = s => s.split(',').map(x => parseInt(x.trim(), 10))
const list = s => s.split(',').map(x => x.trim()).filter(Boolean)
function solvable(n, st, g, walls) {
  const bad = new Set(walls.map(w => w.join())), seen = new Set([st.join()]), q = [st]
  while (q.length) { const [x, y] = q.shift(); if (x === g[0] && y === g[1]) return true
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const p = [x + dx, y + dy]
      if (p[0] < 0 || p[1] < 0 || p[0] >= n || p[1] >= n || bad.has(p.join()) || seen.has(p.join())) continue
      seen.add(p.join()); q.push(p) } }
  return false
}
function build(f) {
  if (!f.title.trim()) throw 'Judul wajib diisi.'
  const answer = f.answer.trim(), options = list(f.options)
  if (f.kind === 'pattern') {
    const seq = list(f.seq)
    if (seq.length < 3) throw 'Urutan pola minimal 3 item (pisahkan dengan koma).'
    if (options.length < 2 || !options.includes(answer)) throw 'Pilihan minimal 2 dan harus memuat jawaban benar.'
    return { seq, options, answer }
  }
  if (f.kind === 'quiz') {
    if (!f.q.trim()) throw 'Pertanyaan wajib diisi.'
    if (options.length < 2 || !options.includes(answer)) throw 'Pilihan minimal 2 dan harus memuat jawaban benar.'
    return { q: f.q.trim(), show: f.show.trim(), options, answer }
  }
  if (f.kind === 'urutan') {
    const steps = f.steps.split('\n').map(x => x.trim()).filter(Boolean)
    if (steps.length < 3 || steps.length > 8) throw 'Isi 3 sampai 8 langkah, satu langkah per baris, urut dari yang pertama.'
    return { steps }
  }
  if (f.kind === 'memori') {
    const pairs = list(f.pairs)
    if (pairs.length < 2 || pairs.length > 8 || new Set(pairs).size !== pairs.length) throw 'Isi 2 sampai 8 gambar yang berbeda (pisahkan dengan koma).'
    return { pairs }
  }
  if (f.kind === 'lampu') {
    const bits = +f.bits, target = +f.target
    if (!(bits >= 2 && bits <= 6)) throw 'Jumlah lampu 2 sampai 6.'
    if (!(Number.isInteger(target) && target >= 1 && target < 2 ** bits)) throw 'Target harus 1 sampai ' + (2 ** bits - 1) + '.'
    return { bits, target }
  }
  if (f.kind === 'pasang') {
    const pairs = f.lines.split('\n').map(x => x.split('|').map(y => y.trim())).filter(p => p[0] && p[1])
    if (pairs.length < 3 || pairs.length > 6) throw 'Isi 3 sampai 6 pasangan, satu per baris, format: gambar|arti.'
    return { pairs }
  }
  if (f.kind === 'ganjil') {
    const items = list(f.items), a = f.answer.trim()
    if (items.length < 4 || items.filter(x => x === a).length !== 1) throw 'Isi minimal 4 item, dan jawaban harus muncul tepat satu kali.'
    return { q: f.q.trim() || 'Mana yang berbeda?', items, answer: a }
  }
  if (f.kind === 'debug') {
    const steps = f.lines.split('\n').map(x => x.trim()).filter(Boolean), bug = +f.bug - 1
    if (steps.length < 3 || !(bug >= 0 && bug < steps.length)) throw 'Isi minimal 3 langkah (satu per baris) dan nomor langkah yang salah harus valid.'
    return { q: f.q.trim() || 'Ada satu langkah yang salah. Ketuk langkah itu!', steps, bug }
  }
  if (f.kind === 'angka') {
    const values = nums(f.values)
    if (values.length < 3 || values.length > 12 || values.some(Number.isNaN) || new Set(values).size !== values.length) throw 'Isi 3 sampai 12 angka yang berbeda (pisahkan dengan koma).'
    return { values, desc: f.desc === 'desc' }
  }
  if (f.kind === 'piksel') {
    const size = +f.n
    if (!(size >= 2 && size <= 6)) throw 'Ukuran kotak 2 sampai 6.'
    const cells = f.cells.filter(i => i < size * size)
    if (!cells.length) throw 'Nyalakan minimal satu kotak pada gambar.'
    return { n: size, cells: [...cells].sort((a, b) => a - b) }
  }
  const n = +f.n, start = nums(f.start), goal = nums(f.goal), walls = f.walls.split(';').map(x => x.trim()).filter(Boolean).map(nums)
  const ok = p => p.length === 2 && p.every(v => Number.isInteger(v) && v >= 0 && v < n)
  if (!(n >= 3 && n <= 8)) throw 'Ukuran labirin 3 sampai 8.'
  if (!ok(start) || !ok(goal) || !walls.every(ok)) throw 'Koordinat harus berbentuk x,y di dalam ukuran labirin (mulai dari 0).'
  if (walls.some(w => w.join() === start.join() || w.join() === goal.join())) throw 'Tembok tidak boleh menimpa posisi robot atau bintang.'
  if (!solvable(n, start, goal, walls)) throw 'Labirin ini tidak bisa diselesaikan. Kurangi tembok.'
  return { n, start, goal, walls }
}
const toFields = l => { const c = l.content, b = { ...EMPTY, title: l.title, description: l.description, kind: l.kind, category_id: l.category_id ?? '', xp_reward: l.xp_reward }
  if (l.kind === 'pattern') return { ...b, seq: c.seq.join(','), options: c.options.join(','), answer: c.answer }
  if (l.kind === 'quiz') return { ...b, q: c.q, show: c.show || '', options: c.options.join(','), answer: c.answer }
  if (l.kind === 'urutan') return { ...b, steps: c.steps.join('\n') }
  if (l.kind === 'memori') return { ...b, pairs: c.pairs.join(',') }
  if (l.kind === 'lampu') return { ...b, bits: c.bits, target: c.target }
  if (l.kind === 'pasang') return { ...b, lines: c.pairs.map(p => p.join('|')).join('\n') }
  if (l.kind === 'ganjil') return { ...b, q: c.q, items: c.items.join(','), answer: c.answer }
  if (l.kind === 'debug') return { ...b, q: c.q, lines: c.steps.join('\n'), bug: c.bug + 1 }
  if (l.kind === 'angka') return { ...b, values: c.values.join(','), desc: c.desc ? 'desc' : 'asc' }
  if (l.kind === 'piksel') return { ...b, n: c.n, cells: c.cells }
  return { ...b, n: c.n, start: c.start.join(','), goal: c.goal.join(','), walls: c.walls.map(w => w.join(',')).join(';') } }

function GameForm({ cats, edit, onSaved, onCancel }) {
  const [f, setF] = useState(edit ? toFields(edit) : EMPTY), [err, setErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const save = e => { e.preventDefault()
    let content; try { content = build(f) } catch (x) { return setErr(typeof x === 'string' ? x : 'Isian tidak valid.') }
    const body = { title: f.title.trim(), description: f.description, kind: f.kind, category_id: f.category_id === '' ? null : +f.category_id, xp_reward: +f.xp_reward || 20, content }
    api(edit ? '/admin/lessons/' + edit.id : '/admin/lessons', body, edit ? 'PUT' : 'POST').then(onSaved).catch(() => setErr('Gagal menyimpan game.')) }
  const row = (label, k, props = {}) => <><label>{label}</label><input value={f[k]} onChange={set(k)} {...props} /></>
  return (<form className="card" onSubmit={save}><h3>{edit ? 'Edit game' : 'Tambah game'}</h3>
    <input placeholder="Judul game" value={f.title} onChange={set('title')} /><input placeholder="Deskripsi singkat" value={f.description} onChange={set('description')} />
    <select value={f.kind} onChange={set('kind')}>{KINDS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
    <select value={f.category_id} onChange={set('category_id')}><option value="">Tanpa kategori</option>{cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select>
    <input type="number" min="5" placeholder="XP hadiah" value={f.xp_reward} onChange={set('xp_reward')} />
    {f.kind === 'pattern' && <>{row('Urutan pola (pisahkan koma)', 'seq')}{row('Pilihan jawaban (pisahkan koma)', 'options')}{row('Jawaban benar', 'answer')}</>}
    {f.kind === 'quiz' && <>{row('Pertanyaan', 'q')}{row('Gambar/emoji pendukung (boleh kosong)', 'show')}{row('Pilihan jawaban (pisahkan koma)', 'options')}{row('Jawaban benar', 'answer')}</>}
    {f.kind === 'urutan' && <><label>Langkah-langkah (satu per baris, urut dari yang pertama)</label><textarea rows="5" value={f.steps} onChange={set('steps')} /></>}
    {f.kind === 'memori' && row('Gambar kartu (2-8, beda semua, pisahkan koma)', 'pairs')}
    {f.kind === 'lampu' && <>{row('Jumlah lampu (2-6)', 'bits', { type: 'number' })}{row('Target angka', 'target', { type: 'number' })}</>}
    {f.kind === 'pasang' && <><label>Pasangan (satu per baris, format gambar|arti)</label><textarea rows="5" value={f.lines} onChange={set('lines')} /></>}
    {f.kind === 'ganjil' && <>{row('Pertanyaan', 'q')}{row('Daftar item (pisahkan koma)', 'items')}{row('Item yang berbeda (jawaban)', 'answer')}</>}
    {f.kind === 'debug' && <>{row('Pertanyaan', 'q')}<label>Langkah-langkah (satu per baris)</label><textarea rows="5" value={f.lines} onChange={set('lines')} />{row('Nomor langkah yang salah', 'bug', { type: 'number' })}</>}
    {f.kind === 'angka' && <>{row('Angka (pisahkan koma, berbeda semua)', 'values')}<select value={f.desc} onChange={set('desc')}><option value="asc">Urut kecil ke besar</option><option value="desc">Urut besar ke kecil</option></select></>}
    {f.kind === 'piksel' && <>{row('Ukuran kotak (2-6)', 'n', { type: 'number' })}<label>Klik kotak untuk menyalakan gambar</label>
      <div className="pxg" style={{ gridTemplateColumns: `repeat(${Math.min(6, Math.max(2, +f.n || 2))},1fr)` }}>{Array.from({ length: Math.min(6, Math.max(2, +f.n || 2)) ** 2 }, (_, i) =>
        <button type="button" key={i} className={'px' + (f.cells.includes(i) ? ' on' : '')} onClick={() => setF({ ...f, cells: f.cells.includes(i) ? f.cells.filter(x => x !== i) : [...f.cells, i] })} />)}</div></>}
    {f.kind === 'maze' && <>{row('Ukuran papan (3-8)', 'n', { type: 'number' })}{row('Posisi robot (x,y mulai dari 0)', 'start')}{row('Posisi bintang (x,y)', 'goal')}{row('Tembok (x,y dipisah titik koma, contoh 1,0;1,1)', 'walls')}</>}
    {err && <div className="err">{err}</div>}
    <div className="row"><button className="btn">Simpan</button>{edit && <button type="button" className="btn ghost" onClick={onCancel}>Batal</button>}</div></form>)
}
function CatForm({ edit, onSaved, onCancel }) {
  const [f, setF] = useState(edit || { name: '', emoji: '🗺️' }), [err, setErr] = useState('')
  const save = e => { e.preventDefault(); if (!f.name.trim()) return setErr('Nama kategori wajib diisi.')
    api(edit ? '/admin/categories/' + edit.id : '/admin/categories', { name: f.name.trim(), emoji: f.emoji || '🗺️' }, edit ? 'PUT' : 'POST').then(() => { setF({ name: '', emoji: '🗺️' }); setErr(''); onSaved() }).catch(() => setErr('Nama kategori sudah dipakai.')) }
  return (<form className="card" onSubmit={save}><h3>{edit ? 'Edit kategori' : 'Tambah kategori'}</h3>
    <input placeholder="Emoji" maxLength="4" value={f.emoji} onChange={e => setF({ ...f, emoji: e.target.value })} />
    <input placeholder="Nama kategori" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    {err && <div className="err">{err}</div>}
    <div className="row"><button className="btn">Simpan</button>{edit && <button type="button" className="btn ghost" onClick={onCancel}>Batal</button>}</div></form>)
}

function Admin() {
  const [tab, setTab] = useState('game'), [s, setS] = useState(null), [ls, setLs] = useState([]), [cats, setCats] = useState([]), [eg, setEg] = useState(null), [ec, setEc] = useState(null)
  const load = () => { api('/admin/stats').then(setS); api('/lessons').then(setLs); api('/categories').then(setCats) }
  useEffect(() => { load() }, [])
  const saved = () => { setEg(null); setEc(null); load() }
  const delGame = l => confirm(`Hapus game "${l.title}"? Progres anak untuk game ini ikut terhapus.`) && api('/admin/lessons/' + l.id, null, 'DELETE').then(load)
  const delCat = c => confirm(`Hapus kategori "${c.name}"? Game di dalamnya menjadi tanpa kategori.`) && api('/admin/categories/' + c.id, null, 'DELETE').then(load)
  return (<div className="stack"><h2>Panel Admin</h2>
    {s && <div className="grid">{[['Anak', s.children, '🧒'], ['Orangtua', s.parents, '👪'], ['Game', s.lessons, '🧩'], ['Selesai', s.completions, '✅']].map(([t, v, i]) => <div key={t} className="card badge"><div className="ic">{i}</div><b>{v}</b><small>{t}</small></div>)}</div>}
    <div className="tabs">{[['game', '🧩 Game'], ['cat', '🗂️ Kategori']].map(([k, t]) => <button key={k} className={'btn' + (tab === k ? '' : ' ghost')} onClick={() => setTab(k)}>{t}</button>)}</div>
    {tab === 'game' ? <>
      <div className="card"><h3>Daftar game ({ls.length})</h3>{ls.map(l => <div key={l.id} className="rank item"><span>{ICON[l.kind] || '🎮'}</span><div className="grow"><b>{l.title}</b><br /><small>{l.emoji} {l.world} • {l.xp_reward} XP</small></div>
        <button className="btn ghost sm" onClick={() => { setEg(l); window.scrollTo(0, document.body.scrollHeight) }}>Edit</button><button className="btn ghost sm" onClick={() => delGame(l)}>Hapus</button></div>)}
        {!ls.length && <p>Belum ada game.</p>}</div>
      <GameForm key={eg ? eg.id : 'new'} cats={cats} edit={eg} onSaved={saved} onCancel={() => setEg(null)} /></> : <>
      <div className="card"><h3>Daftar kategori</h3>{cats.map(c => <div key={c.id} className="rank item"><span>{c.emoji}</span><div className="grow"><b>{c.name}</b><br /><small>{c.games} game</small></div>
        <button className="btn ghost sm" onClick={() => setEc(c)}>Edit</button><button className="btn ghost sm" onClick={() => delCat(c)}>Hapus</button></div>)}
        {!cats.length && <p>Belum ada kategori.</p>}</div>
      <CatForm key={ec ? ec.id : 'new'} edit={ec} onSaved={saved} onCancel={() => setEc(null)} /></>}
  </div>)
}
