export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { bersihkanDataWisata, seedDataDemo } from '@/lib/demo-seed'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.DEMO_RESET_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const demoTenant = await prisma.tenant.upsert({
      where: { slug: 'demo' },
      update: { isDemo: true, active: true },
      create: { name: 'Demo Wisata', slug: 'demo', isDemo: true, plan: 'starter' },
    })

    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@zomet.my.id' },
      update: {},
      create: {
        name: 'Admin Demo',
        email: 'demo@zomet.my.id',
        password: '$2b$10$demo',
        role: 'ADMIN',
        tenantId: demoTenant.id,
      },
    })

    const result = await seedDataDemo(demoTenant.id)

    return NextResponse.json({
      success: true,
      tenant: { id: demoTenant.id, slug: demoTenant.slug },
      user: { id: demoUser.id, email: demoUser.email },
      ...result,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to setup demo', detail: e.message }, { status: 500 })
  }
}
