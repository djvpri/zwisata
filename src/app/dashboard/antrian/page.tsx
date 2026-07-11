'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function AntrianPage() {
  const { data: session } = useSession()
  const [antrian, setAntrian] = useState<any[]>([])
  const [wahanaId, setWahanaId] = useState('')
  const [wahana, setWahana] = useState<any[]>([])

  const load = () => {
    const url = wahanaId ? '/api/antrian?wahanaId=' + wahanaId : '/api/antrian'
    fetch(url).then(r => r.json()).then(setAntrian)
  }
  useEffect(() => { fetch('/api/wahana').then(r => r.json()).then(setWahana) }, [])
  useEffect(() => { load() }, [wahanaId])

  const panggil = async (id: string) => {
    await fetch('/api/antrian', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'DIPANGGIL' }) })
    load()
  }
  const selesai = async (id: string) => {
    await fetch('/api/antrian', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'SELESAI' }) })
    load()
  }

  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 bg-card flex items-center justify-between sticky top-0 z-20">
        <a href="/dashboard" className="flex items-center gap-2 font-bold text-lg"><i className="bi bi-signpost-split"></i> ZWisata</a>
        <span className="text-sm text-muted-foreground">Antrian</span>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4">Antrian Realtime</h1>
        <select value={wahanaId} onChange={e => setWahanaId(e.target.value)} className="mb-4 px-3 py-2 border rounded-xl bg-card w-full sm:w-64">
          <option value="">Semua wahana</option>
          {wahana.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
        </select>
        <div className="space-y-3">
          {antrian.map(a => (
            <div key={a.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
              <div>
                <div className="font-semibold text-lg">#{a.noAntrian} — {a.namaPengunjung}</div>
                <div className="text-xs text-muted-foreground">{a.wahana?.nama} · Estimasi {a.estimasi} menit</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'MENUNGGU' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{a.status}</span>
                {isAdmin && a.status === 'MENUNGGU' && <button onClick={() => panggil(a.id)} className="text-xs px-2 py-1 border rounded-lg hover:bg-muted">Panggil</button>}
                {isAdmin && a.status !== 'SELESAI' && <button onClick={() => selesai(a.id)} className="text-xs px-2 py-1 border rounded-lg text-green-600 hover:bg-muted">✓</button>}
              </div>
            </div>
          ))}
          {antrian.length === 0 && <p className="text-center text-muted-foreground py-8">Tidak ada antrian</p>}
        </div>
      </main>
    </div>
  )
}