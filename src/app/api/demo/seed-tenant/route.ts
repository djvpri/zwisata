import { NextResponse } from 'next/server'
import { seedDataDemo } from '@/lib/demo-seed'
import { requireAdmin } from '@/lib/guard'

export async function POST() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })

  const tenantId = session.user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'Tenant tidak ditemukan' }, { status: 400 })

  try {
    const result = await seedDataDemo(tenantId)
    return NextResponse.json({ success: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal seed data', detail: e.message }, { status: 500 })
  }
}
