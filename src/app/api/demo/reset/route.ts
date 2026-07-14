import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/guard'
import { bersihkanDataWisata, seedDataDemo } from '@/lib/demo-seed'

export async function POST() {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { isDemo: true } })
  if (!tenant?.isDemo) {
    return NextResponse.json({ error: 'Bukan tenant demo' }, { status: 403 })
  }

  await bersihkanDataWisata(tenantId)
  await seedDataDemo(tenantId)

  return NextResponse.json({ ok: true })
}
