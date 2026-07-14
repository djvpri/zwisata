import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/guard'

export async function GET() {
  const session = await requireSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ isDemo: false })

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { isDemo: true, name: true, slug: true },
  })

  return NextResponse.json(tenant ?? { isDemo: false })
}
