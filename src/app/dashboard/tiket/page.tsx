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

  const inputCls = 'w-full px-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tiket</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            {showForm ? 'Batal' : '+ Tiket'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-xl p-5 mb-6 space-y-3 bg-card">
          <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama tiket" className={inputCls} required />
          <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi (opsional)" rows={2} className={`${inputCls} resize-none`} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipe</label>
              <select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} className={inputCls}>
                <option value="MASUK">Masuk</option>
                <option value="WAHANA">Per Wahana</option>
                <option value="COMBO">Paket Combo</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Harga (Rp)</label>
              <input type="number" value={form.harga} onChange={e => setForm({ ...form, harga: e.target.value })} placeholder="0" className={inputCls} required />
            </div>
          </div>
          {form.tipe === 'WAHANA' && (
            <select value={form.wahanaId} onChange={e => setForm({ ...form, wahanaId: e.target.value })} className={inputCls}>
              <option value="">Pilih wahana</option>
              {wahana.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
            </select>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Kuota harian (opsional)</label>
            <input type="number" value={form.kuotaHarian} onChange={e => setForm({ ...form, kuotaHarian: e.target.value })} placeholder="Kosongkan = tidak terbatas" className={inputCls} />
          </div>
          <button type="submit" className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
            Simpan
          </button>
        </form>
      )}

      <div className="space-y-2">
        {tiket.map(t => (
          <div key={t.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
            <div className="min-w-0">
              <p className="font-semibold text-sm">{t.nama}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t.tipe} · Rp{t.harga.toLocaleString()}
                {t.wahana ? ` · ${t.wahana.nama}` : ''}
                {t.kuotaHarian ? ` · Kuota ${t.kuotaHarian}/hari` : ''}
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => hapus(t.id)} className="text-xs px-2.5 py-1 border rounded-lg text-destructive hover:bg-muted transition-colors ml-4 shrink-0">
                Hapus
              </button>
            )}
          </div>
        ))}
        {tiket.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <i className="bi bi-ticket-perforated text-3xl mb-3 block opacity-40" />
            <p className="text-sm">Belum ada tiket. Tambah tiket pertama.</p>
          </div>
        )}
      </div>
    </div>
  )
}
