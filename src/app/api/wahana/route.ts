import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireAdmin } from '@/lib/guard'

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Belum login' }, { status: 401 })

  const tenantId = (session.user as any).tenantId
  const where = tenantId ? { tenantId } : {}

  const wahana = await prisma.wahana.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(wahana)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })

  const body = await req.json()
  const tenantId = session.user.tenantId
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })
  }

  const w = await prisma.wahana.create({
    data: {
      tenantId,
      nama: body.nama,
      slug: body.slug || body.nama.toLowerCase().replace(/\s+/g, '-'),
      deskripsi: body.deskripsi,
      kapasitas: Number(body.kapasitas),
      tinggiMin: body.tinggiMin ? Number(body.tinggiMin) : null,
      durasiMenit: Number(body.durasiMenit) || 5,
      icon: body.icon || 'star',
      warna: body.warna || '#3b82f6',
      hargaTiket: body.hargaTiket ? Number(body.hargaTiket) : null,
    },
  })
  return NextResponse.json(w, { status: 201 })
}
