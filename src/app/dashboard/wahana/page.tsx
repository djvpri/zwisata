'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type Wahana = { id: string; nama: string; slug: string; kapasitas: number; status: string; hargaTiket: number | null; durasiMenit: number }

export default function WahanaPage() {
  const { data: session } = useSession()
  const [wahana, setWahana] = useState<Wahana[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', deskripsi: '', kapasitas: 20, durasiMenit: 5, hargaTiket: '' })

  const load = () => fetch('/api/wahana').then(r => r.json()).then(d => setWahana(Array.isArray(d) ? d : []))
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
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Wahana</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            {showForm ? 'Batal' : '+ Wahana'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-xl p-5 mb-6 space-y-3 bg-card">
          <input
            value={form.nama}
            onChange={e => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama wahana"
            className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
          <textarea
            value={form.deskripsi}
            onChange={e => setForm({ ...form, deskripsi: e.target.value })}
            placeholder="Deskripsi (opsional)"
            rows={2}
            className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kapasitas</label>
              <input type="number" value={form.kapasitas} onChange={e => setForm({ ...form, kapasitas: +e.target.value })} className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Durasi (menit)</label>
              <input type="number" value={form.durasiMenit} onChange={e => setForm({ ...form, durasiMenit: +e.target.value })} className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Harga tiket</label>
              <input type="number" value={form.hargaTiket} onChange={e => setForm({ ...form, hargaTiket: e.target.value })} placeholder="Rp" className="w-full px-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <button type="submit" className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
            Simpan
          </button>
        </form>
      )}

      <div className="space-y-2">
        {wahana.map(w => (
          <div key={w.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
            <div className="min-w-0">
              <p className="font-semibold text-sm">{w.nama}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kapasitas {w.kapasitas} · {w.durasiMenit} menit{w.hargaTiket ? ` · Rp${w.hargaTiket.toLocaleString()}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                w.status === 'AKTIF'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {w.status}
              </span>
              {isAdmin && (
                <>
                  <button
                    onClick={() => toggleStatus(w.id, w.status)}
                    className="text-xs px-2.5 py-1 border rounded-lg hover:bg-muted transition-colors"
                  >
                    {w.status === 'AKTIF' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => hapus(w.id)}
                    className="text-xs px-2.5 py-1 border rounded-lg text-destructive hover:bg-muted transition-colors"
                  >
                    Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {wahana.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <i className="bi bi-signpost-split text-3xl mb-3 block opacity-40" />
            <p className="text-sm">Belum ada wahana. Tambah wahana pertama.</p>
          </div>
        )}
      </div>
    </div>
  )
}