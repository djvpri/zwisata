'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function SsoContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!token) return

    signIn('sso', { token, redirect: false })
      .then((res) => {
        if (res?.error) {
          setStatus('error')
          setMsg('Login SSO gagal. Coba lagi dari Z One, atau hubungi admin.')
        } else {
          window.location.replace('/dashboard')
        }
      })
      .catch(() => {
        setStatus('error')
        setMsg('Tidak dapat terhubung ke server ZWisata')
      })
  }, [token])

  const showError = !token || status === 'error'
  const errorMsg = !token ? 'Token tidak ditemukan. Buka ZWisata lewat Z One lagi.' : msg

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        {!showError ? (
          <>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Menghubungkan akun dari Z One...</p>
          </>
        ) : (
          <>
            <p className="text-red-600 font-medium mb-2">Gagal Login</p>
            <p className="text-gray-500 text-sm mb-4">{errorMsg}</p>
            <a href="https://zone.zomet.my.id" className="text-blue-600 text-sm underline">
              Kembali ke Z One
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function SsoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SsoContent />
    </Suspense>
  )
}
