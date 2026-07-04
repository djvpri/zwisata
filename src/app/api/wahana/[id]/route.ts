import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const w = await prisma.wahana.findUnique({ where: { id } })
  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(w)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const w = await prisma.wahana.update({ where: { id }, data: body })
  return NextResponse.json(w)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.wahana.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
