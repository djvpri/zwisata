'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
  { href: '/dashboard/wahana', label: 'Wahana', icon: 'bi-signpost-split' },
  { href: '/dashboard/tiket', label: 'Tiket', icon: 'bi-ticket-perforated' },
  { href: '/dashboard/pesanan', label: 'Pesanan', icon: 'bi-clipboard-data' },
  { href: '/dashboard/antrian', label: 'Antrian', icon: 'bi-arrow-repeat' },
  { href: '/dashboard/staff', label: 'Staff', icon: 'bi-people' },
  { href: '/dashboard/laporan', label: 'Laporan', icon: 'bi-bar-chart-line' },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <aside className="flex flex-col h-full bg-[#0F172A] text-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.08]">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 font-bold text-base">
          <i className="bi bi-signpost-split text-teal-400" />
          ZWisata
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-400/[0.12] text-teal-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <i className={`bi ${item.icon} text-base`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User & Signout */}
      {user && (
        <div className="px-3 py-4 border-t border-white/[0.08]">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <i className="bi bi-box-arrow-left text-base" />
            Keluar
          </button>
        </div>
      )}
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar — fixed */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col min-h-dvh lg:ml-64">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg transition-colors hover:bg-muted"
            aria-label="Buka menu"
          >
            <i className="bi bi-list text-xl" />
          </button>
          <span className="font-bold text-sm">ZWisata</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 lg:p-6 lg:pt-5">
          {children}
        </main>
      </div>
    </div>
  )
}
