import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireAdmin } from '@/lib/guard'

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Belum login' }, { status: 401 })

  const tenantId = session.user.tenantId
  const where = tenantId ? { tenantId } : {}

  const tiket = await prisma.tiket.findMany({
    where,
    include: { wahana: { select: { nama: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tiket)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })

  const body = await req.json()
  const tenantId = session.user.tenantId
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })
  }

  const t = await prisma.tiket.create({
    data: {
      tenantId,
      slug: body.slug || body.nama.toLowerCase().replace(/\s+/g, '-'),
      wahanaId: body.wahanaId,
      nama: body.nama,
      harga: Number(body.harga),
      tipe: body.tipe || 'REGULER',
      kuotaHarian: body.kuotaHarian ? Number(body.kuotaHarian) : null,
    },
  })
  return NextResponse.json(t, { status: 201 })
}
