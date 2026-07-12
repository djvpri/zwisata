import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'ZWisata — Sistem Membership Taman Wisata',
  description: 'Tiket, antrian, dan wahana dalam satu sistem. Membership Rp100.000/bulan atau Rp1.000.000/tahun.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
