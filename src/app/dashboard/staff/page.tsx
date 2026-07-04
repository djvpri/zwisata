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

  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 bg-card flex items-center justify-between sticky top-0 z-20">
        <a href="/dashboard" className="flex items-center gap-2 font-bold text-lg"><span>🎢</span> ZWisata</a>
        <span className="text-sm text-muted-foreground">Staff</span>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Staff</h1>
          {isAdmin && <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">{showForm ? 'Batal' : '+ Staff'}</button>}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="border rounded-xl p-4 mb-6 space-y-3 bg-card">
            <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama" className="w-full px-3 py-2 border rounded-lg bg-background" required />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.nip} onChange={e => setForm({ ...form, nip: e.target.value })} placeholder="NIP" className="px-3 py-2 border rounded-lg bg-background" />
              <input value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} placeholder="No HP" className="px-3 py-2 border rounded-lg bg-background" />
            </div>
            <select value={form.posisi} onChange={e => setForm({ ...form, posisi: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-background">
              <option value="OPERATOR">Operator</option>
              <option value="TICKETING">Ticketing</option>
              <option value="KEBERSIHAN">Kebersihan</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-sm">Simpan</button>
          </form>
        )}
        <div className="space-y-3">
          {staff.map(s => (
            <div key={s.id} className="border rounded-xl p-4 flex items-center justify-between bg-card">
              <div>
                <div className="font-semibold">{s.nama}</div>
                <div className="text-xs text-muted-foreground">{s.posisi}{s.nip ? ' · ' + s.nip : ''}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.aktif ? 'Aktif' : 'Nonaktif'}</span>
            </div>
          ))}
          {staff.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada staff</p>}
        </div>
      </main>
    </div>
  )
}