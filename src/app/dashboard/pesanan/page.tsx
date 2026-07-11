'use client'
import { useEffect, useState } from 'react'

export default function PesananPage() {
  const [pesanan, setPesanan] = useState<any[]>([])
  useEffect(() => { fetch('/api/pesanan').then(r => r.json()).then(setPesanan) }, [])

  const statusColor = (s: string) => {
    const map: Record<string, string> = { MENUNGGU: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', DIBAYAR: 'bg-blue-100 text-blue-700', DIPAKAI: 'bg-purple-100 text-purple-700', SELESAI: 'bg-green-100 text-green-700', DIBATALKAN: 'bg-red-100 text-red-700' }
    return map[s] || 'bg-gray-100'
  }

  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 bg-card flex items-center justify-between sticky top-0 z-20">
        <a href="/dashboard" className="flex items-center gap-2 font-bold text-lg"><i className="bi bi-signpost-split"></i> ZWisata</a>
        <span className="text-sm text-muted-foreground">Pesanan</span>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-4">Pesanan</h1>
        <div className="space-y-3">
          {pesanan.map(p => (
            <div key={p.id} className="border rounded-xl p-4 bg-card">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">#{p.kode}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span>
              </div>
              <div className="text-sm text-muted-foreground">{p.namaPemesan} · {new Date(p.tglKunjungan).toLocaleDateString('id-ID')}</div>
              <div className="text-sm font-semibold mt-1">Rp{p.total.toLocaleString()} · {p.items?.length || 0} tiket</div>
            </div>
          ))}
          {pesanan.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada pesanan</p>}
        </div>
      </main>
    </div>
  )
}