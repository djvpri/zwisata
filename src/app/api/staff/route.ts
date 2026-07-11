import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireAdmin } from '@/lib/guard'

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Belum login' }, { status: 401 })

  const tenantId = session.user.tenantId
  const where = tenantId ? { tenantId } : {}

  const staff = await prisma.staff.findMany({
    where,
    orderBy: { nama: 'asc' },
  })
  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })

  const body = await req.json()
  const tenantId = session.user.tenantId
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })
  }

  const s = await prisma.staff.create({
    data: {
      tenantId,
      nama: body.nama,
      nip: body.nip,
      noHp: body.noHp,
      posisi: body.posisi || 'OPERATOR',
      aktif: body.aktif ?? true,
    },
  })
  return NextResponse.json(s, { status: 201 })
}
