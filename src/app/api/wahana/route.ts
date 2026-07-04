import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const wahana = await prisma.wahana.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(wahana)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const w = await prisma.wahana.create({
    data: {
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
