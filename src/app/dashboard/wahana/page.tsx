'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type Wahana = { id: string; nama: string; slug: string; kapasitas: number; status: string; hargaTiket: number | null; durasiMenit: number }

export default function WahanaPage() {
  const { data: session } = useSession()
  const [wahana, setWahana] = useState<Wahana[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', deskripsi: '', kapasitas: 20, durasiMenit: 5, hargaTiket: '' })

  const load = () => fetch('/api/wahana').then(r => r.json()).then(setWahana)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/wahana', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, hargaTiket: form.hargaTiket ? Number(form.hargaTiket) : null }) })
    setShowForm(false); setForm({ nama: '', deskripsi: '', kapasitas: 20, durasiMenit: 5, hargaTiket: '' }); load()
  }

  const toggleStatus = async (id: string, status: string) => {
    const next = status === 'AKTIF' ? 'MAINTENANCE' : 'AKTIF'
    await fetch('/api/wahana/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    load()
  }

  const hapus = async (id: string) => {
    if (!confirm('Hapus wahana ini?')) return
    await fetch('/api/wahana/' + id, { method: 'DELETE' }); load()
  }

  const user = session?.user as any
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 bg-card flex items-center justify-between sticky top-0 z-20">
        <a href="/dashboard" className="flex items-center gap-2 font-bold text-lg"><span>🎢</span> ZWisata</a>
        <span className="text-sm text-muted-foreground">Wahana</span>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Wahana</h1>
          {isAdmin && <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">{showForm ? 'Batal' : '+ Wahana'}</button>}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="border rounded-xl p-4 mb-6 space-y-3 bg-card">
            <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama wahana" className="w-full px-3 py-2 border rounded-lg bg-background" required />
            <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi" className="w-full px-3 py-2 border rounded-lg bg-background" />
            <div className="grid grid-cols-3 gap-3">
              <input type="number" value={form.kapasitas} onChange={e => setForm({ ...form, kapasitas: +e.target.value })} placeholder="Kapasitas" className="px-3 py-2 border rounded-lg bg-background" />
              <input type="number" value={form.durasiMenit} onChange={e => setForm({ ...form, durasiMenit: +e.target.value })} placeholder="Durasi (menit)" className="px-3 py-2 border rounded-lg bg-background" />
              <input type="number" value={form.hargaTiket} onChange={e => setForm({ ...form, hargaTiket: e.target.value })} placeholder="Harga tiket" className="px-3 py-2 border rounded-lg bg-background" />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-sm">Simpan</button>
          </form>
        )}
        <div className="space-y-3">
          {wahana.map(w => (
            <div key={w.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
              <div>
                <div className="font-semibold">{w.nama}</div>
                <div className="text-xs text-muted-foreground">Kapasitas {w.kapasitas} · {w.durasiMenit} menit{w.hargaTiket ? ` · Rp${w.hargaTiket.toLocaleString()}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'AKTIF' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'}`}>{w.status}</span>
                {isAdmin && (
                  <>
                    <button onClick={() => toggleStatus(w.id, w.status)} className="text-xs px-2 py-1 border rounded-lg hover:bg-muted">Toggle</button>
                    <button onClick={() => hapus(w.id)} className="text-xs px-2 py-1 border rounded-lg text-destructive hover:bg-muted">Hapus</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {wahana.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada wahana</p>}
        </div>
      </main>
    </div>
  )
}