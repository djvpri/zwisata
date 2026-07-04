import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wahanaId = searchParams.get('wahanaId')
  const where: any = { status: { not: 'SELESAI' } }
  if (wahanaId) where.wahanaId = wahanaId
  const antrian = await prisma.antrian.findMany({
    where,
    include: { wahana: true },
    orderBy: { noAntrian: 'asc' },
  })
  return NextResponse.json(antrian)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const last = await prisma.antrian.findFirst({
    where: { wahanaId: body.wahanaId },
    orderBy: { noAntrian: 'desc' },
  })
  const a = await prisma.antrian.create({
    data: {
      wahanaId: body.wahanaId,
      noAntrian: (last?.noAntrian || 0) + 1,
      namaPengunjung: body.namaPengunjung,
      estimasi: body.estimasi || 10,
    },
  })
  return NextResponse.json(a, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  await prisma.antrian.update({ where: { id: body.id }, data: { status: body.status } })
  return NextResponse.json({ ok: true })
}