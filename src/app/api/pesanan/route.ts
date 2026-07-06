import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/guard'

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const tgl = searchParams.get('tgl')
  const where: { tglKunjungan?: { gte: Date; lt: Date }; userId?: string; tenantId: string } = { tenantId }
  if (tgl) {
    const start = new Date(tgl)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    where.tglKunjungan = { gte: start, lt: end }
  }
  if (session.user.role !== 'ADMIN') {
    where.userId = session.user.id
  }
  const pesanan = await prisma.pesanan.findMany({
    where,
    include: { items: { include: { tiket: true } }, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(pesanan)
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

  const body = await req.json()
  const kode = 'PSN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
  const p = await prisma.pesanan.create({
    data: {
      kode,
      tenantId,
      userId: session.user.id,
      namaPemesan: body.namaPemesan || session.user.name || '',
      emailPemesan: body.emailPemesan || session.user.email || '',
      noHpPemesan: body.noHpPemesan || '',
      tglKunjungan: new Date(body.tglKunjungan || Date.now()),
      total: Number(body.total) || 0,
      status: body.status || 'MENUNGGU',
      items: {
        create: body.items?.map((item: any) => ({
          tiketId: item.tiketId,
          qty: Number(item.qty),
          harga: Number(item.harga),
          subtotal: Number(item.qty) * Number(item.harga),
        })) || [],
      },
    },
  })
  return NextResponse.json(p, { status: 201 })
}
