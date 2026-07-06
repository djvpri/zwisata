import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import prisma from '@/lib/prisma'

function getCrossAppSecret(): string {
  const secret = process.env.CROSS_APP_SECRET
  if (!secret) throw new Error('CROSS_APP_SECRET belum di-set di environment')
  return secret
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.emailVerified) return null

        const valid = await bcrypt.compare(password, user.password || '')
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
    // Login SSO dari Z One: token = JWT yang ditandatangani Z One
    // dengan CROSS_APP_SECRET, payload { app: 'zwisata', email, name }
    Credentials({
      id: 'sso',
      name: 'sso',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        const token = credentials?.token as string | undefined
        if (!token) return null

        let email: string
        let name: string | null = null
        try {
          const secret = new TextEncoder().encode(getCrossAppSecret())
          const { payload } = await jwtVerify(token, secret)
          if (payload.app !== 'zwisata') return null
          email = String(payload.email || '').trim().toLowerCase()
          if (!email) return null
          name = payload.name ? String(payload.name) : null
        } catch {
          return null
        }

        // User Z One dianggap terverifikasi (login via Google di hub).
        // Kalau belum ada di ZWisata, buat otomatis sebagai USER biasa.
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          user = await prisma.user.create({
            data: { email, name, emailVerified: new Date(), role: 'USER' },
          })
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: string }).role ?? 'USER'
        // Include tenantId from user
        const u = user as { tenantId?: string | null }
        if (u.tenantId) token.tenantId = u.tenantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string | undefined
      }
      return session
    },
  },
})
