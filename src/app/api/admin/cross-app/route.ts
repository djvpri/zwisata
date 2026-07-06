import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SHARED_SECRET = process.env.CROSS_APP_SECRET || ''

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tenant'
}

function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  return token === SHARED_SECRET
}

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const users = await prisma.user.findMany({
      where: { NOT: { role: 'ADMIN' } },
      select: { id: true, name: true, email: true, role: true, emailVerified: true, tenantId: true },
      orderBy: { createdAt: 'desc' },
    })
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ users, tenants })
  } catch (error) {
    console.error('Cross-app GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { action, email, data } = await req.json()

    // --- User actions ---
    if (action === 'list') {
      const users = await prisma.user.findMany({
        where: { NOT: { role: 'ADMIN' } },
        select: { id: true, name: true, email: true, role: true, tenantId: true },
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
        create: {
          email,
          name: data?.name || email,
          password: hashed,
          role: 'USER',
          tenantId: data?.tenantId || null,
        },
      })
      return NextResponse.json({ user, password: data?.password ? undefined : password })
    }

    if (action === 'delete') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await prisma.user.updateMany({ where: { email }, data: { role: 'DISABLED' } })
      return NextResponse.json({ success: true })
    }

    if (action === 'reactivate') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await prisma.user.updateMany({ where: { email }, data: { role: 'USER' } })
      return NextResponse.json({ success: true })
    }

    if (action === 'updateRole') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await prisma.user.updateMany({ where: { email }, data: { role: data?.role || 'USER' } })
      return NextResponse.json({ success: true })
    }

    if (action === 'moveTenant') {
      if (!email && !data?.userId) return NextResponse.json({ error: 'Email or userId required' }, { status: 400 })
      const where = email ? { email } : { id: data.userId }
      await prisma.user.update({ where, data: { tenantId: data?.tenantId || null } })
      return NextResponse.json({ success: true })
    }

    // --- Tenant actions ---
    if (action === 'createTenant') {
      if (!data?.name) return NextResponse.json({ error: 'Tenant name required' }, { status: 400 })
      const slug = slugify(data.name)
      const tenant = await prisma.tenant.create({
        data: {
          name: data.name,
          slug,
          plan: data?.plan || 'starter',
          active: true,
        },
      })
      return NextResponse.json({ tenant })
    }

    if (action === 'deleteTenant') {
      const tenantId = data?.tenantId || data?.id
      if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
      await prisma.tenant.update({ where: { id: tenantId }, data: { active: false } })
      return NextResponse.json({ success: true })
    }

    if (action === 'reactivateTenant') {
      const tenantId = data?.tenantId || data?.id
      if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
      await prisma.tenant.update({ where: { id: tenantId }, data: { active: true } })
      return NextResponse.json({ success: true })
    }

    if (action === 'updatePlan') {
      const tenantId = data?.tenantId || data?.id
      if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 })
      const update: any = { plan: data?.plan || 'starter' }
      if (data?.planExpires) update.expiresAt = new Date(data.planExpires)
      await prisma.tenant.update({ where: { id: tenantId }, data: update })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (error) {
    console.error('Cross-app POST error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
