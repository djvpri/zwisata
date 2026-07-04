import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/guard'

export async function GET() {
  const staff = await prisma.staff.findMany({ orderBy: { nama: 'asc' } })
  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })
  const body = await req.json()
  const s = await prisma.staff.create({ data: body })
  return NextResponse.json(s, { status: 201 })
}
