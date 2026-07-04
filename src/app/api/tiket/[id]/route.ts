import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/guard'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })
  const { id } = await params
  await prisma.tiket.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
