import { NextRequest, NextResponse } from 'next/server'
import { requireSession, requireAdmin } from '@/lib/guard'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wahanaId = searchParams.get('wahanaId')
  const where: { status: { not: string }; wahanaId?: string } = { status: { not: 'SELESAI' } }
  if (wahanaId) where.wahanaId = wahanaId
  const antrian = await prisma.antrian.findMany({
    where,
    include: { wahana: true },
    orderBy: { noAntrian: 'asc' },
  })
  return NextResponse.json(antrian)
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  // Retry ringan: nomor antrian rawan tabrakan saat request bersamaan
  // karena ada constraint unik (wahanaId, noAntrian)
  for (let attempt = 0; attempt < 3; attempt++) {
    const last = await prisma.antrian.findFirst({
      where: { wahanaId: body.wahanaId },
      orderBy: { noAntrian: 'desc' },
    })
    try {
      const a = await prisma.antrian.create({
        data: {
          wahanaId: body.wahanaId,
          noAntrian: (last?.noAntrian || 0) + 1,
          namaPengunjung: body.namaPengunjung,
          estimasi: body.estimasi || 10,
        },
      })
      return NextResponse.json(a, { status: 201 })
    } catch {
      // nomor keburu dipakai request lain — ulangi
    }
  }
  return NextResponse.json({ error: 'Gagal mengambil nomor antrian, coba lagi' }, { status: 409 })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })
  const body = await req.json()
  await prisma.antrian.update({ where: { id: body.id }, data: { status: body.status } })
  return NextResponse.json({ ok: true })
}
