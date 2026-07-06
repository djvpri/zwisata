import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SHARED_SECRET = process.env.CROSS_APP_SECRET || ''

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (token !== SHARED_SECRET) return false
  return true
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const users = await prisma.user.findMany({
      where: { NOT: { role: 'ADMIN' } },
      select: { id: true, name: true, email: true, role: true, emailVerified: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Cross-app GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { action, email, data } = await req.json()

    if (action === 'list') {
      const users = await prisma.user.findMany({
        where: { NOT: { role: 'ADMIN' } },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ users })
    }

    if (action === 'create') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      const password = data?.password || randomBytes(12).toString('hex')
      const hashed = await bcrypt.hash(password, 10)
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: data?.name || email, password: hashed, role: 'USER' },
      })
      return NextResponse.json({ user, password: data?.password ? undefined : password })
    }

    if (action === 'delete') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await prisma.user.deleteMany({ where: { email } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (error) {
    console.error('Cross-app POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
