'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Gagal daftar') }
      else router.push('/login')
    } catch { setError('Gagal menghubungi server') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <i className="bi bi-signpost-split text-3xl mb-2"></i>
          <h1 className="text-2xl font-bold">Daftar ZWisata</h1>
          <p className="text-muted-foreground text-sm">Buat akun baru</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Nama" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-card" required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-card" required />
          <input type="password" placeholder="Password (min 6)" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-card" required minLength={6} />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover disabled:opacity-50 transition">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Sudah punya akun? <a href="/login" className="text-primary underline">Masuk</a>
        </p>
        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-muted-foreground underline">← Kembali</a>
        </div>
      </div>
    </div>
  )
}