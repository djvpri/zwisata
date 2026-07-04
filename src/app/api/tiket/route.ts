import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/guard'

export async function GET() {
  const tiket = await prisma.tiket.findMany({
    include: { wahana: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tiket)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })
  const body = await req.json()
  const t = await prisma.tiket.create({
    data: {
      nama: body.nama,
      slug: body.slug || body.nama.toLowerCase().replace(/\s+/g, '-'),
      deskripsi: body.deskripsi,
      tipe: body.tipe || 'MASUK',
      harga: Number(body.harga),
      wahanaId: body.wahanaId || null,
      kuotaHarian: body.kuotaHarian ? Number(body.kuotaHarian) : null,
    },
  })
  return NextResponse.json(t, { status: 201 })
}