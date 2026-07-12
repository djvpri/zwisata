import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession, requireAdmin } from '@/lib/guard'

const VALID_STATUS = ['MENUNGGU', 'DIBAYAR', 'DIPAKAI', 'SELESAI', 'DIBATALKAN']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

  const { id } = await params
  const { status } = await req.json()

  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const pesanan = await prisma.pesanan.update({
    where: { id, tenantId },
    data: { status },
  })
  return NextResponse.json(pesanan)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

  const { id } = await params
  await prisma.pesananItem.deleteMany({ where: { pesananId: id } })
  await prisma.pesanan.delete({ where: { id, tenantId } })
  return NextResponse.json({ ok: true })
}
