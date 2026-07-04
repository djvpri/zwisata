'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ wahana: 0, tiket: 0, pesanan: 0, pengunjung: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/wahana').then(r => r.json()),
        fetch('/api/tiket').then(r => r.json()),
        fetch('/api/pesanan').then(r => r.json()),
      ]).then(([w, t, p]) => {
        setStats({ wahana: w.length, tiket: t.length, pesanan: p.length, pengunjung: 0 })
      })
    }
  }, [status, router])

  if (status !== 'authenticated') return null

  const user = session.user as any
  const cards = [
    { label: 'Wahana', value: stats.wahana, color: 'bg-blue-500', icon: '🎢' },
    { label: 'Tiket', value: stats.tiket, color: 'bg-green-500', icon: '🎫' },
    { label: 'Pesanan', value: stats.pesanan, color: 'bg-amber-500', icon: '📋' },
  ]

  return (
    <div className="min-h-screen">
      <header className="border-b px-4 py-3 bg-card flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-lg"><span>🎢</span> ZWisata</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm px-3 py-1.5 rounded-lg border hover:bg-muted transition">Keluar</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-6">Selamat datang, {user.name} 👋</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cards.map(c => (
            <div key={c.label} className="border rounded-xl p-5 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-2xl font-bold">{c.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/dashboard/wahana" className="border rounded-xl p-4 hover:bg-muted transition flex items-center gap-3">
            <span className="text-2xl">🎢</span>
            <div><div className="font-semibold">Wahana</div><div className="text-xs text-muted-foreground">Kelola wahana</div></div>
          </a>
          <a href="/dashboard/tiket" className="border rounded-xl p-4 hover:bg-muted transition flex items-center gap-3">
            <span className="text-2xl">🎫</span>
            <div><div className="font-semibold">Tiket</div><div className="text-xs text-muted-foreground">Atur harga tiket</div></div>
          </a>
          <a href="/dashboard/pesanan" className="border rounded-xl p-4 hover:bg-muted transition flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div><div className="font-semibold">Pesanan</div><div className="text-xs text-muted-foreground">Riwayat pesanan</div></div>
          </a>
          <a href="/dashboard/antrian" className="border rounded-xl p-4 hover:bg-muted transition flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div><div className="font-semibold">Antrian</div><div className="text-xs text-muted-foreground">Antrian realtime</div></div>
          </a>
          <a href="/dashboard/staff" className="border rounded-xl p-4 hover:bg-muted transition flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div><div className="font-semibold">Staff</div><div className="text-xs text-muted-foreground">Manajemen operator</div></div>
          </a>
        </div>
      </main>
    </div>
  )
}
