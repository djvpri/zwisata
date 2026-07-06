import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      tenantId?: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    tenantId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    tenantId?: string | null
  }
}
