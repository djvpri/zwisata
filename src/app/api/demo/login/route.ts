export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { SignJWT } from 'jose'

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret'
}

export async function GET(req: NextRequest) {
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo@zomet.my.id' } })
  if (!demoUser) {
    return NextResponse.json({ error: 'Demo user not found' }, { status: 500 })
  }

  // Create JWT token matching NextAuth format
  const secret = new TextEncoder().encode(getAuthSecret())
  const token = await new SignJWT({
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email,
    role: demoUser.role,
    tenantId: demoUser.tenantId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  // Set NextAuth session cookie and redirect
  const res = NextResponse.redirect(new URL('/dashboard', req.url))
  res.cookies.set('next-auth.session-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
  return res
}
