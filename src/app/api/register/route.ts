import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { name, email, password, tenantId } = await req.json()
  if (!email || !password || password.length < 6)
    return NextResponse.json({ error: 'Email & password min 6 karakter' }, { status: 400 })
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
  const hash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { name, email, password: hash, emailVerified: new Date(), tenantId: tenantId || null },
  })
  return NextResponse.json({ ok: true })
}