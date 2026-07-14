export const dynamic = 'force-dynamic'
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
    const demos = await prisma.tenant.findMany({ where: { isDemo: true }, select: { id: true, slug: true } })

    const direset: string[] = []
    for (const demo of demos) {
      await bersihkanDataWisata(demo.id)
      await seedDataDemo(demo.id)
      direset.push(demo.slug)
    }

    return NextResponse.json({ ok: true, direset, total: demos.length })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to reset demo', detail: e.message }, { status: 500 })
  }
}
