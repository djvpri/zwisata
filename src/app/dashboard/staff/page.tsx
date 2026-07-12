'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function StaffPage() {
  const { data: session } = useSession()
  const [staff, setStaff] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', nip: '', noHp: '', posisi: 'OPERATOR' })

  const load = () => fetch('/api/staff').then(r => r.json()).then(setStaff)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false); setForm({ nama: '', nip: '', noHp: '', posisi: 'OPERATOR' }); load()
  }

  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  const inputCls = 'w-full px-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Staff</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            {showForm ? 'Batal' : '+ Staff'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-xl p-5 mb-6 space-y-3 bg-card">
          <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" className={inputCls} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">NIP (opsional)</label>
              <input value={form.nip} onChange={e => setForm({ ...form, nip: e.target.value })} placeholder="—" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">No HP</label>
              <input value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="08xx" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Posisi</label>
            <select value={form.posisi} onChange={e => setForm({ ...form, posisi: e.target.value })} className={inputCls}>
              <option value="OPERATOR">Operator</option>
              <option value="TICKETING">Ticketing</option>
              <option value="KEBERSIHAN">Kebersihan</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>
          <button type="submit" className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
            Simpan
          </button>
        </form>
      )}

      <div className="space-y-2">
        {staff.map(s => (
          <div key={s.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                {s.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{s.nama}</p>
                <p className="text-xs text-muted-foreground">{s.posisi}{s.nip ? ` · ${s.nip}` : ''}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {s.aktif ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <i className="bi bi-people text-3xl mb-3 block opacity-40" />
            <p className="text-sm">Belum ada staff terdaftar.</p>
          </div>
        )}
      </div>
    </div>
  )
}