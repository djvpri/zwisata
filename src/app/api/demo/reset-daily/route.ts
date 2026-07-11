export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { bersihkanDataWisata, seedDataDemo } from '@/lib/demo-seed'

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'zwisata-demo-reset' })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.DEMO_RESET_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const expiredDemos = await prisma.tenant.findMany({
      where: {
        isDemo: true,
        demoExpiresAt: { not: null, lt: new Date() },
      },
    })

    if (expiredDemos.length === 0) {
      // No expired demos — seed fresh data
      const demos = await prisma.tenant.findMany({ where: { isDemo: true } })
      let reset = 0
      for (const d of demos) {
        await seedDataDemo(d.id)
        await prisma.tenant.update({
          where: { id: d.id },
          data: { demoExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) }, // 2 hours
        })
        reset++
      }
      return NextResponse.json({ message: 'No expired demos — seeded fresh', reset, total: demos.length })
    }

    let reset = 0
    for (const demo of expiredDemos) {
      await seedDataDemo(demo.id)
      await prisma.tenant.update({
        where: { id: demo.id },
        data: { demoExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) },
      })
      reset++
    }

    return NextResponse.json({ message: `${reset} demo tenant di-reset`, reset, total: expiredDemos.length })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to reset demo', detail: e.message }, { status: 500 })
  }
}
