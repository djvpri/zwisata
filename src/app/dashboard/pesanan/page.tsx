'use client'
import { useEffect, useState } from 'react'

interface Tiket {
  id: string
  nama: string
  harga: number | null
  tipe: string
  wahana?: { nama: string } | null
}

interface PesananItem {
  id: string
  qty: number
  harga: number
  subtotal: number
  tiket: { nama: string }
}

interface Pesanan {
  id: string
  kode: string
  namaPemesan: string
  tglKunjungan: string
  total: number
  status: string
  items: PesananItem[]
}

interface CartItem {
  tiketId: string
  qty: number
}

const STATUS_COLOR: Record<string, string> = {
  MENUNGGU: 'bg-amber-100 text-amber-700',
  DIBAYAR: 'bg-blue-100 text-blue-700',
  DIPAKAI: 'bg-purple-100 text-purple-700',
  SELESAI: 'bg-green-100 text-green-700',
  DIBATALKAN: 'bg-red-100 text-red-700',
}

// Status berikutnya dalam alur normal
const NEXT_STATUS: Record<string, { label: string; status: string; style: string }> = {
  MENUNGGU: { label: 'Konfirmasi Bayar', status: 'DIBAYAR', style: 'bg-primary text-white hover:bg-primary-hover' },
  DIBAYAR:  { label: 'Tandai Dipakai',   status: 'DIPAKAI', style: 'bg-purple-600 text-white hover:bg-purple-700' },
  DIPAKAI:  { label: 'Selesai',           status: 'SELESAI', style: 'bg-green-600 text-white hover:bg-green-700' },
}

const inputCls = 'w-full px-3 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'

export default function PesananPage() {
  const [pesanan, setPesanan] = useState<Pesanan[]>([])
  const [tiketList, setTiketList] = useState<Tiket[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState('')
  const [error, setError] = useState('')
  const [filterTgl, setFilterTgl] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Form state
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [noHp, setNoHp] = useState('')
  const [tglKunjungan, setTglKunjungan] = useState('')
  const [cart, setCart] = useState<CartItem[]>([{ tiketId: '', qty: 1 }])

  const loadPesanan = (tgl?: string) => {
    const url = tgl ? `/api/pesanan?tgl=${tgl}` : '/api/pesanan'
    fetch(url).then(r => r.json()).then(d => setPesanan(Array.isArray(d) ? d : []))
  }

  useEffect(() => {
    loadPesanan(filterTgl || undefined)
  }, [filterTgl])

  useEffect(() => {
    fetch('/api/tiket').then(r => r.json()).then(d => setTiketList(Array.isArray(d) ? d : []))
  }, [])

  const total = cart.reduce((sum, item) => {
    const t = tiketList.find(t => t.id === item.tiketId)
    return sum + (t?.harga || 0) * item.qty
  }, 0)

  const addCartItem = () => setCart(prev => [...prev, { tiketId: '', qty: 1 }])

  const removeCartItem = (idx: number) =>
    setCart(prev => prev.filter((_, i) => i !== idx))

  const updateCart = (idx: number, field: keyof CartItem, value: string | number) =>
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))

  const ubahStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await fetch(`/api/pesanan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      loadPesanan(filterTgl || undefined)
    } finally {
      setUpdatingId(null)
    }
  }

  const resetForm = () => {
    setNama(''); setEmail(''); setNoHp(''); setTglKunjungan('')
    setCart([{ tiketId: '', qty: 1 }])
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validCart = cart.filter(c => c.tiketId && c.qty > 0)
    if (validCart.length === 0) { setError('Pilih minimal satu tiket'); return }

    setLoading(true); setError('')
    try {
      const items = validCart.map(c => {
        const t = tiketList.find(t => t.id === c.tiketId)!
        return { tiketId: c.tiketId, qty: Number(c.qty), harga: t.harga ?? 0 }
      })
      const res = await fetch('/api/pesanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namaPemesan: nama, emailPemesan: email, noHpPemesan: noHp, tglKunjungan, total, items }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan')
      setSukses(`Pesanan #${data.kode} berhasil dibuat`)
      setShowForm(false)
      resetForm()
      loadPesanan(filterTgl || undefined)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <button
          onClick={() => { setShowForm(s => !s); setSukses(''); setError('') }}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          {showForm ? 'Batal' : '+ Pesanan Baru'}
        </button>
      </div>

      {/* Notifikasi sukses */}
      {sukses && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
          <i className="bi bi-check-circle-fill" />
          {sukses}
        </div>
      )}

      {/* Form input pesanan */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-xl p-5 mb-6 bg-card space-y-4">
          <p className="font-semibold text-sm">Data Pemesan</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nama Pemesan <span className="text-destructive">*</span></label>
              <input
                value={nama} onChange={e => setNama(e.target.value)}
                placeholder="Budi Santoso"
                className={inputCls} required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tanggal Kunjungan <span className="text-destructive">*</span></label>
              <input
                type="date" value={tglKunjungan} onChange={e => setTglKunjungan(e.target.value)}
                className={inputCls} required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">No HP</label>
              <input
                value={noHp} onChange={e => setNoHp(e.target.value)}
                placeholder="08xx-xxxx-xxxx"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="budi@email.com"
                className={inputCls}
              />
            </div>
          </div>

          {/* Cart tiket */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">Tiket</p>
              <button
                type="button" onClick={addCartItem}
                className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
              >
                + Tambah baris
              </button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_56px_88px_24px] gap-2 px-0.5">
                <p className="text-xs text-muted-foreground">Tiket</p>
                <p className="text-xs text-muted-foreground text-center">Qty</p>
                <p className="text-xs text-muted-foreground text-right">Subtotal</p>
                <div />
              </div>

              {cart.map((item, idx) => {
                const tiket = tiketList.find(t => t.id === item.tiketId)
                const subtotal = (tiket?.harga || 0) * item.qty
                return (
                  <div key={idx} className="grid grid-cols-[1fr_56px_88px_24px] gap-2 items-center">
                    <select
                      value={item.tiketId}
                      onChange={e => updateCart(idx, 'tiketId', e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    >
                      <option value="">Pilih tiket</option>
                      {tiketList.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nama}{t.wahana ? ` (${t.wahana.nama})` : ''} — Rp{(t.harga ?? 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number" min={1} value={item.qty}
                      onChange={e => updateCart(idx, 'qty', +e.target.value)}
                      className="px-2 py-2 border rounded-lg bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-sm font-medium text-right">
                      {tiket ? `Rp${subtotal.toLocaleString()}` : '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeCartItem(idx)}
                      disabled={cart.length === 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-20 transition-colors"
                      aria-label="Hapus baris"
                    >
                      <i className="bi bi-x-circle text-base" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer form */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">Rp{total.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter tanggal */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground shrink-0">Filter tanggal:</label>
          <input
            type="date" value={filterTgl}
            onChange={e => setFilterTgl(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {filterTgl && (
          <button
            onClick={() => setFilterTgl('')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{pesanan.length} pesanan</span>
      </div>

      {/* Daftar pesanan */}
      <div className="space-y-2">
        {pesanan.map(p => {
          const nextAction = NEXT_STATUS[p.status]
          const canCancel = p.status === 'MENUNGGU' || p.status === 'DIBAYAR'
          const isUpdating = updatingId === p.id

          return (
            <div key={p.id} className="border rounded-xl p-4 bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">#{p.kode}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {p.namaPemesan} · {new Date(p.tglKunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {p.items?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.items.map(i => `${i.tiket.nama} ×${i.qty}`).join(', ')}
                    </p>
                  )}
                </div>
                <p className="text-sm font-bold shrink-0">Rp{p.total.toLocaleString()}</p>
              </div>

              {/* Tombol aksi status */}
              {(nextAction || canCancel) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  {nextAction && (
                    <button
                      onClick={() => ubahStatus(p.id, nextAction.status)}
                      disabled={isUpdating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${nextAction.style}`}
                    >
                      {isUpdating ? '...' : nextAction.label}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => ubahStatus(p.id, 'DIBATALKAN')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border text-destructive hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {pesanan.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <i className="bi bi-clipboard-data text-3xl mb-3 block opacity-40" />
            <p className="text-sm">
              {filterTgl ? 'Tidak ada pesanan di tanggal ini.' : 'Belum ada pesanan masuk.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
