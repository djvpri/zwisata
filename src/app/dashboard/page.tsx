'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const MENU = [
  { href: '/dashboard/wahana', label: 'Wahana', desc: 'Kelola wahana', icon: 'bi-signpost-split', color: 'text-teal-600' },
  { href: '/dashboard/tiket', label: 'Tiket', desc: 'Atur harga tiket', icon: 'bi-ticket-perforated', color: 'text-blue-600' },
  { href: '/dashboard/pesanan', label: 'Pesanan', desc: 'Riwayat pesanan', icon: 'bi-clipboard-data', color: 'text-amber-600' },
  { href: '/dashboard/antrian', label: 'Antrian', desc: 'Antrian realtime', icon: 'bi-arrow-repeat', color: 'text-purple-600' },
  { href: '/dashboard/staff', label: 'Staff', desc: 'Manajemen operator', icon: 'bi-people', color: 'text-slate-600' },
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ wahana: 0, tiket: 0, pesanan: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/wahana').then(r => r.json()),
        fetch('/api/tiket').then(r => r.json()),
        fetch('/api/pesanan').then(r => r.json()),
      ]).then(([w, t, p]) => {
        setStats({ wahana: Array.isArray(w) ? w.length : 0, tiket: Array.isArray(t) ? t.length : 0, pesanan: Array.isArray(p) ? p.length : 0 })
      })
    }
  }, [status, router])

  if (status !== 'authenticated') return null

  const user = session.user as any

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Selamat datang, {user.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Wahana', value: stats.wahana, icon: 'bi-signpost-split', bg: 'bg-teal-50', fg: 'text-teal-700' },
          { label: 'Tiket', value: stats.tiket, icon: 'bi-ticket-perforated', bg: 'bg-blue-50', fg: 'text-blue-700' },
          { label: 'Pesanan', value: stats.pesanan, icon: 'bi-clipboard-data', bg: 'bg-amber-50', fg: 'text-amber-700' },
        ].map(c => (
          <div key={c.label} className="bg-card border rounded-xl p-5">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${c.bg} ${c.fg} mb-3`}>
              <i className={`bi ${c.icon} text-lg`} />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Menu</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MENU.map(m => (
          <Link
            key={m.href}
            href={m.href}
            className="bg-card border rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <i className={`bi ${m.icon} text-lg ${m.color} group-hover:text-primary transition-colors`} />
            </div>
            <div>
              <p className="font-semibold text-sm">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
            <i className="bi bi-chevron-right text-muted-foreground ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  )
}
