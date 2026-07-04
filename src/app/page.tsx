export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span>🎢</span> ZWisata
          </div>
          <div className="flex gap-3 text-sm">
            <a href="/login" className="px-4 py-2 rounded-xl border hover:bg-muted transition">Masuk</a>
            <a href="/register" className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover transition">Daftar</a>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Kelola Tempat Wisata Lebih Mudah</h1>
          <p className="text-muted-foreground text-lg mb-8">Manajemen wahana, tiket, antrian, dan pengunjung dalam satu platform. Bagian dari ZOne Ecosystem.</p>
          <a href="/register" className="inline-block px-8 py-3 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-primary-hover transition">Mulai Gratis →</a>
        </div>
      </main>
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        ZWisata · ZOne Ecosystem · 2026
      </footer>
    </div>
  )
}
