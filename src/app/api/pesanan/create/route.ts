import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const userId = (session.user as any).id

  // Generate kode unik
  const count = await prisma.pesanan.count()
  const kode = 'WS' + Date.now().toString(36).toUpperCase() + count

  const items = body.items as { tiketId: string; qty: number }[]
  const tiketIds = items.map(i => i.tiketId)
  const tiketList = await prisma.tiket.findMany({ where: { id: { in: tiketIds } } })
  const tiketMap = new Map<string, typeof tiketList[0]>(tiketList.map(t => [t.id, t]))

  const total = items.reduce((sum, i) => {
    const t = tiketMap.get(i.tiketId)
    return sum + (t?.harga || 0) * i.qty
  }, 0)

  const pesanan = await prisma.pesanan.create({
    data: {
      kode,
      userId,
      namaPemesan: body.namaPemesan,
      emailPemesan: body.emailPemesan,
      noHpPemesan: body.noHpPemesan,
      tglKunjungan: new Date(body.tglKunjungan),
      total,
      items: {
        create: items.map(i => {
          const t = tiketMap.get(i.tiketId)!
          return { tiketId: i.tiketId, qty: i.qty, harga: t.harga, subtotal: t.harga * i.qty }
        }),
      },
    },
    include: { items: { include: { tiket: true } } },
  })
  return NextResponse.json(pesanan, { status: 201 })
}
