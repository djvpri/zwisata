import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/guard'

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const dari = searchParams.get('dari')
  const sampai = searchParams.get('sampai')

  const startDate = dari ? new Date(dari) : (() => { const d = new Date(); d.setDate(d.getDate() - 29); d.setHours(0, 0, 0, 0); return d })()
  const endDate = sampai ? (() => { const d = new Date(sampai); d.setHours(23, 59, 59, 999); return d })() : (() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d })()

  const pesanan = await prisma.pesanan.findMany({
    where: {
      tenantId,
      status: { in: ['DIBAYAR', 'DIPAKAI', 'SELESAI'] },
      tglKunjungan: { gte: startDate, lte: endDate },
    },
    include: {
      items: { include: { tiket: { select: { nama: true } } } },
    },
    orderBy: { tglKunjungan: 'asc' },
  })

  // Agregasi per hari
  const perHari: Record<string, { tanggal: string; pendapatan: number; pesanan: number; tiket: Record<string, { nama: string; qty: number; subtotal: number }> }> = {}

  for (const p of pesanan) {
    const tgl = p.tglKunjungan.toISOString().slice(0, 10)
    if (!perHari[tgl]) {
      perHari[tgl] = { tanggal: tgl, pendapatan: 0, pesanan: 0, tiket: {} }
    }
    perHari[tgl].pendapatan += p.total
    perHari[tgl].pesanan += 1

    for (const item of p.items) {
      const nama = item.tiket.nama
      if (!perHari[tgl].tiket[nama]) {
        perHari[tgl].tiket[nama] = { nama, qty: 0, subtotal: 0 }
      }
      perHari[tgl].tiket[nama].qty += item.qty
      perHari[tgl].tiket[nama].subtotal += item.subtotal
    }
  }

  const harian = Object.values(perHari).map(h => ({
    ...h,
    tiket: Object.values(h.tiket),
  }))

  const totalPendapatan = harian.reduce((s, h) => s + h.pendapatan, 0)
  const totalPesanan = harian.reduce((s, h) => s + h.pesanan, 0)
  const jumlahHariAktif = harian.length

  return NextResponse.json({
    ringkasan: {
      totalPendapatan,
      totalPesanan,
      rataHarian: jumlahHariAktif > 0 ? Math.round(totalPendapatan / jumlahHariAktif) : 0,
      jumlahHariAktif,
    },
    harian,
  })
}
