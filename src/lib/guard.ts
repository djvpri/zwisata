import { auth } from '@/lib/auth'

// Sesi login apa pun (pengunjung terdaftar)
export async function requireSession() {
  const session = await auth()
  return session?.user ? session : null
}

// Khusus admin
export async function requireAdmin() {
  const session = await auth()
  return session?.user?.role === 'ADMIN' ? session : null
}
