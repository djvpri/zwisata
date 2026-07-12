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
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Antrian Realtime</h1>
        <button onClick={load} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Refresh">
          <i className="bi bi-arrow-clockwise text-lg" />
        </button>
      </div>

      <select
        value={wahanaId}
        onChange={e => setWahanaId(e.target.value)}
        className="mb-4 px-3 py-2.5 border rounded-xl bg-card text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Semua wahana</option>
        {wahana.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
      </select>

      <div className="space-y-2">
        {antrian.map(a => (
          <div key={a.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
            <div>
              <p className="font-bold text-lg">#{a.noAntrian} <span className="font-semibold text-base">— {a.namaPengunjung}</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.wahana?.nama} · Estimasi {a.estimasi} menit</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                a.status === 'MENUNGGU' ? 'bg-blue-100 text-blue-700'
                : a.status === 'DIPANGGIL' ? 'bg-purple-100 text-purple-700'
                : 'bg-green-100 text-green-700'
              }`}>
                {a.status}
              </span>
              {isAdmin && a.status === 'MENUNGGU' && (
                <button onClick={() => panggil(a.id)} className="text-xs px-2.5 py-1 border rounded-lg hover:bg-muted transition-colors">
                  Panggil
                </button>
              )}
              {isAdmin && a.status !== 'SELESAI' && (
                <button onClick={() => selesai(a.id)} className="text-xs px-2.5 py-1 border rounded-lg text-green-600 hover:bg-muted transition-colors">
                  ✓ Selesai
                </button>
              )}
            </div>
          </div>
        ))}
        {antrian.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <i className="bi bi-arrow-repeat text-3xl mb-3 block opacity-40" />
            <p className="text-sm">Tidak ada antrian aktif.</p>
          </div>
        )}
      </div>
    </div>
  )
}