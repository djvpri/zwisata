import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tgl = searchParams.get('tgl')
  const where: any = {}
  if (tgl) {
    const start = new Date(tgl)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    where.tglKunjungan = { gte: start, lt: end }
  }
  const pesanan = await prisma.pesanan.findMany({
    where,
    include: { items: { include: { tiket: true } }, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(pesanan)
}
