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
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Pesanan</h1>
      <div className="space-y-2">
        {pesanan.map(p => (
          <div key={p.id} className="border rounded-xl p-4 bg-card">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">#{p.kode}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>{p.status}</span>
            </div>
            <p className="text-sm text-muted-foreground">{p.namaPemesan} · {new Date(p.tglKunjungan).toLocaleDateString('id-ID')}</p>
            <p className="text-sm font-semibold mt-1">Rp{p.total.toLocaleString()} · {p.items?.length || 0} tiket</p>
          </div>
        ))}
        {pesanan.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <i className="bi bi-clipboard-data text-3xl mb-3 block opacity-40" />
            <p className="text-sm">Belum ada pesanan masuk.</p>
          </div>
        )}
      </div>
    </div>
  )
}