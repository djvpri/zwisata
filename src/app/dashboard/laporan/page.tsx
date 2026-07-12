'use client'
import { useEffect, useState, useCallback } from 'react'

interface TiketRekap { nama: string; qty: number; subtotal: number }
interface HariData { tanggal: string; pendapatan: number; pesanan: number; tiket: TiketRekap[] }
interface Ringkasan { totalPendapatan: number; totalPesanan: number; rataHarian: number; jumlahHariAktif: number }

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1).replace('.0', '')} jt`
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)} rb`
  return `Rp${n.toLocaleString()}`
}

function formatTgl(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

function isoHariIni() {
  return new Date().toISOString().slice(0, 10)
}

function iso30HariLalu() {
  const d = new Date()
  d.setDate(d.getDate() - 29)
  return d.toISOString().slice(0, 10)
}

export default function LaporanPage() {
  const [dari, setDari] = useState(iso30HariLalu)
  const [sampai, setSampai] = useState(isoHariIni)
  const [ringkasan, setRingkasan] = useState<Ringkasan | null>(null)
  const [harian, setHarian] = useState<HariData[]>([])
  const [loading, setLoading] = useState(false)
  const [expand, setExpand] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/laporan?dari=${dari}&sampai=${sampai}`)
      .then(r => r.json())
      .then(d => {
        setRingkasan(d.ringkasan)
        setHarian(d.harian ?? [])
      })
      .finally(() => setLoading(false))
  }, [dari, sampai])

  useEffect(() => { load() }, [load])

  const maxPendapatan = Math.max(...harian.map(h => h.pendapatan), 1)

  const PRESET = [
    { label: '7 hari', dari: (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10) })() },
    { label: '30 hari', dari: iso30HariLalu() },
    { label: 'Bulan ini', dari: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01` })() },
  ]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Laporan Pendapatan</h1>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card border rounded-xl">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground shrink-0">Dari</label>
          <input type="date" value={dari} onChange={e => setDari(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground shrink-0">Sampai</label>
          <input type="date" value={sampai} onChange={e => setSampai(e.target.value)}
            className="px-3 py-1.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1.5 ml-auto">
          {PRESET.map(p => (
            <button key={p.label} onClick={() => { setDari(p.dari); setSampai(isoHariIni()) }}
              className="px-2.5 py-1 rounded-lg text-xs border hover:bg-muted transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm">Memuat data...</div>
      ) : (
        <>
          {/* Ringkasan */}
          {ringkasan && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Pendapatan', value: `Rp${ringkasan.totalPendapatan.toLocaleString()}`, sub: 'status: Dibayar/Dipakai/Selesai', icon: 'bi-cash-stack', color: 'text-teal-600 bg-teal-50' },
                { label: 'Total Pesanan', value: ringkasan.totalPesanan, sub: 'pesanan lunas', icon: 'bi-clipboard-check', color: 'text-blue-600 bg-blue-50' },
                { label: 'Rata-rata/Hari', value: formatRp(ringkasan.rataHarian), sub: 'hari ada transaksi', icon: 'bi-graph-up', color: 'text-purple-600 bg-purple-50' },
                { label: 'Hari Aktif', value: `${ringkasan.jumlahHariAktif} hari`, sub: 'ada transaksi lunas', icon: 'bi-calendar-check', color: 'text-amber-600 bg-amber-50' },
              ].map(c => (
                <div key={c.label} className="bg-card border rounded-xl p-4">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${c.color} mb-2`}>
                    <i className={`bi ${c.icon} text-sm`} />
                  </div>
                  <p className="text-lg font-bold leading-tight">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>
          )}

          {harian.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <i className="bi bi-bar-chart text-3xl mb-3 block opacity-40" />
              <p className="text-sm">Tidak ada transaksi lunas di periode ini.</p>
              <p className="text-xs mt-1">Hanya pesanan berstatus Dibayar, Dipakai, atau Selesai yang dihitung.</p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="bg-card border rounded-xl p-5 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pendapatan per Hari</p>
                <div className="space-y-2">
                  {harian.map(h => (
                    <div key={h.tanggal} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 shrink-0 text-right">{formatTgl(h.tanggal)}</span>
                      <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-md transition-all duration-500 flex items-center pl-2"
                          style={{ width: `${Math.max((h.pendapatan / maxPendapatan) * 100, 2)}%` }}
                        >
                          {h.pendapatan / maxPendapatan > 0.25 && (
                            <span className="text-[10px] text-white font-medium">{formatRp(h.pendapatan)}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-semibold w-20 shrink-0">{formatRp(h.pendapatan)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabel rinci */}
              <div className="bg-card border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tanggal</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Pesanan</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Pendapatan</th>
                      <th className="w-8 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {harian.map(h => (
                      <>
                        <tr
                          key={h.tanggal}
                          className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => setExpand(expand === h.tanggal ? null : h.tanggal)}
                        >
                          <td className="px-4 py-3 font-medium">
                            {new Date(h.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">{h.pesanan}</td>
                          <td className="px-4 py-3 text-right font-semibold">Rp{h.pendapatan.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            <i className={`bi ${expand === h.tanggal ? 'bi-chevron-up' : 'bi-chevron-down'} text-xs`} />
                          </td>
                        </tr>
                        {expand === h.tanggal && h.tiket.length > 0 && (
                          <tr key={`${h.tanggal}-detail`} className="border-b last:border-0 bg-muted/20">
                            <td colSpan={4} className="px-4 py-3">
                              <div className="space-y-1">
                                {h.tiket.map(t => (
                                  <div key={t.nama} className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t.nama} ×{t.qty}</span>
                                    <span className="font-medium">Rp{t.subtotal.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 border-t">
                      <td className="px-4 py-3 text-xs font-semibold">Total</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold">{ringkasan?.totalPesanan}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-primary">Rp{ringkasan?.totalPendapatan.toLocaleString()}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
