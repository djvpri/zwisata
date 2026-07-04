import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/guard'

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tgl = searchParams.get('tgl')
  const where: { tglKunjungan?: { gte: Date; lt: Date }; userId?: string } = {}
  if (tgl) {
    const start = new Date(tgl)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    where.tglKunjungan = { gte: start, lt: end }
  }
  // Non-admin hanya boleh melihat pesanannya sendiri
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
