import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/guard'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const w = await prisma.wahana.findUnique({ where: { id } })
  if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(w)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const w = await prisma.wahana.update({ where: { id }, data: body })
  return NextResponse.json(w)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Hanya admin' }, { status: 403 })
  const { id } = await params
  await prisma.wahana.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
