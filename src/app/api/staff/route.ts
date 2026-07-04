import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const staff = await prisma.staff.findMany({ orderBy: { nama: 'asc' } })
  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const s = await prisma.staff.create({ data: body })
  return NextResponse.json(s, { status: 201 })
}
