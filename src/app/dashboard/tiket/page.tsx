'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TiketPage() {
  const { data: session } = useSession()
  const [tiket, setTiket] = useState<any[]>([])
  const [wahana, setWahana] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', deskripsi: '', tipe: 'MASUK', harga: '', wahanaId: '', kuotaHarian: '' })

  const load = () => { fetch('/api/tiket').then(r => r.json()).then(setTiket); fetch('/api/wahana').then(r => r.json()).then(setWahana) }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/tiket', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, harga: Number(form.harga), kuotaHarian: form.kuotaHarian ? Number(form.kuotaHarian) : null }) })
    setShowForm(false); load()
  }

  const hapus = async (id: string) => {
    if (!confirm('Hapus tiket?')) return
    await fetch('/api/tiket/' + id, { method: 'DELETE' }); load()
  }

  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 bg-card flex items-center justify-between sticky top-0 z-20">
        <a href="/dashboard" className="flex items-center gap-2 font-bold text-lg"><i className="bi bi-signpost-split"></i> ZWisata</a>
        <span className="text-sm text-muted-foreground">Tiket</span>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Tiket</h1>
          {isAdmin && <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">{showForm ? 'Batal' : '+ Tiket'}</button>}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="border rounded-xl p-4 mb-6 space-y-3 bg-card">
            <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama tiket" className="w-full px-3 py-2 border rounded-lg bg-background" required />
            <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi" className="w-full px-3 py-2 border rounded-lg bg-background" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className="px-3 py-2 border rounded-lg bg-background">
                <option value="MASUK">Masuk</option>
                <option value="WAHANA">Per Wahana</option>
                <option value="COMBO">Paket Combo</option>
              </select>
              <input type="number" value={form.harga} onChange={e => setForm({ ...form, harga: e.target.value })} placeholder="Harga (Rp)" className="px-3 py-2 border rounded-lg bg-background" required />
            </div>
            {form.tipe === 'WAHANA' && (
              <select value={form.wahanaId} onChange={e => setForm({ ...form, wahanaId: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-background">
                <option value="">Pilih wahana</option>
                {wahana.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
              </select>
            )}
            <input type="number" value={form.kuotaHarian} onChange={e => setForm({ ...form, kuotaHarian: e.target.value })} placeholder="Kuota harian (opsional)" className="w-full px-3 py-2 border rounded-lg bg-background" />
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-sm">Simpan</button>
          </form>
        )}
        <div className="space-y-3">
          {tiket.map(t => (
            <div key={t.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
              <div>
                <div className="font-semibold">{t.nama}</div>
                <div className="text-xs text-muted-foreground">{t.tipe} · Rp{t.harga.toLocaleString()} {t.wahana && '· ' + t.wahana.nama}{t.kuotaHarian && ' · Kuota: ' + t.kuotaHarian + '/hari'}</div>
              </div>
              {isAdmin && <button onClick={() => hapus(t.id)} className="text-xs px-2 py-1 border rounded-lg text-destructive hover:bg-muted">Hapus</button>}
            </div>
          ))}
          {tiket.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada tiket</p>}
        </div>
      </main>
    </div>
  )
}
