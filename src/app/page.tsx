import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'

const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['500', '600', '700', '800'] })

const WA_LINK =
  'https://wa.me/6282153533164?text=' +
  encodeURIComponent('Halo, saya tertarik dengan sistem membership ZWisata untuk tempat wisata saya.')

const FITUR = [
  {
    judul: 'Manajemen Wahana',
    isi: 'Catat kapasitas, tinggi minimum, dan durasi tiap wahana. Nonaktifkan sementara saat perawatan.',
  },
  {
    judul: 'Tiket & Harga',
    isi: 'Tiket masuk dan tiket per wahana dengan harga masing-masing, lengkap dengan kuota harian.',
  },
  {
    judul: 'Antrian Digital',
    isi: 'Nomor antrian per wahana dengan status real-time. Pengunjung tidak perlu berdiri menunggu.',
  },
  {
    judul: 'Pesanan Online',
    isi: 'Pengunjung pesan tiket sebelum datang. Semua pesanan masuk ke satu daftar per tanggal kunjungan.',
  },
  {
    judul: 'Data Staff',
    isi: 'Simpan data operator dan petugas loket di satu tempat, dengan posisi dan status aktifnya.',
  },
]

const LANGKAH = [
  { no: '1', judul: 'Pengunjung pesan tiket', isi: 'Lewat halaman pemesanan online, sebelum berangkat.' },
  { no: '2', judul: 'Tunjukkan kode di loket', isi: 'Petugas mencocokkan kode pesanan, tanpa antre panjang.' },
  { no: '3', judul: 'Ambil antrian wahana', isi: 'Nomor antrian digital per wahana, status terlihat langsung.' },
]

const FAQ = [
  {
    q: 'Apakah perlu install aplikasi?',
    a: 'Tidak. ZWisata berjalan di browser — bisa dibuka dari HP, tablet, atau komputer loket.',
  },
  {
    q: 'Bagaimana cara aktivasi setelah membayar?',
    a: 'Hubungi kami via WhatsApp. Akun Anda diaktifkan di hari yang sama, lengkap dengan pendampingan pengaturan awal.',
  },
  {
    q: 'Apakah bisa berhenti kapan saja?',
    a: 'Bisa. Paket bulanan berhenti otomatis jika tidak diperpanjang. Tidak ada kontrak jangka panjang.',
  },
]

function Notch({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      aria-hidden
      className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-paper ${
        side === 'left' ? '-left-3.5' : '-right-3.5'
      }`}
    />
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ===== NAV ===== */}
      <header className="px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-5 border-b border-garis">
          <div className={`${display.className} flex items-center gap-2 font-bold text-xl tracking-tight`}>
            <i className="bi bi-signpost-split" aria-hidden></i> ZWisata
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full border border-ink/20 hover:border-ink transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-ink text-paper hover:bg-ink/85 transition-colors"
            >
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center py-16 sm:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-daun mb-4">
              Sistem membership untuk pengelola tempat wisata
            </p>
            <h1
              className={`${display.className} text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6`}
            >
              Dari loket sampai wahana, satu sistem yang mengurus semuanya.
            </h1>
            <p className="text-lg text-ink/70 max-w-xl mb-8">
              ZWisata membantu pengelola taman rekreasi menjual tiket, mengatur antrian wahana, dan
              memantau pesanan pengunjung — cukup dari HP atau komputer loket.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={WA_LINK}
                className="px-6 py-3 rounded-full bg-daun text-paper font-semibold hover:bg-daun/90 transition-colors"
              >
                Tanya via WhatsApp
              </a>
              <Link
                href="/register"
                className="px-6 py-3 rounded-full border border-ink/25 font-semibold hover:border-ink transition-colors"
              >
                Coba dulu, gratis
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink/50">
              Mulai Rp100.000/bulan · Bagian dari ekosistem Zomet
            </p>
          </div>

          {/* Karcis dekoratif */}
          <div className="hidden sm:flex justify-center lg:justify-end" aria-hidden>
            <div className="relative rotate-3 hover:rotate-1 transition-transform motion-reduce:transform-none w-full max-w-sm">
              <div className="relative bg-karcis rounded-2xl border-2 border-ink shadow-[6px_6px_0_0_rgba(23,53,44,1)] p-6">
                <Notch side="left" />
                <Notch side="right" />
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1">Karcis Masuk</p>
                <p className={`${display.className} text-2xl font-extrabold leading-tight mb-4`}>
                  Taman Wisata Anda
                </p>
                <div className="flex justify-between text-xs font-mono mb-4">
                  <span>DEWASA × 1</span>
                  <span>No. 000100</span>
                </div>
                <div className="border-t-2 border-dashed border-ink/50 pt-3 flex justify-between items-center">
                  <span className="text-[10px] tracking-[0.2em] uppercase">Simpan potongan ini</span>
                  <span className="text-xs font-mono">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FITUR ===== */}
      <section className="px-4 sm:px-6 py-16 border-t border-garis">
        <div className="max-w-6xl mx-auto">
          <h2 className={`${display.className} text-3xl sm:text-4xl font-bold tracking-tight mb-10`}>
            Lima pekerjaan loket, satu layar.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-garis border border-garis rounded-2xl overflow-hidden">
            {FITUR.map((f) => (
              <div key={f.judul} className="bg-paper p-6">
                <h3 className={`${display.className} font-bold text-lg mb-2`}>{f.judul}</h3>
                <p className="text-sm text-ink/70 leading-relaxed">{f.isi}</p>
              </div>
            ))}
            <div className="bg-ink text-paper p-6 flex flex-col justify-between gap-3">
              <p className={`${display.className} font-bold text-lg`}>Terhubung dengan Z One</p>
              <p className="text-sm text-paper/70 leading-relaxed">
                Satu akun untuk seluruh aplikasi ekosistem Zomet. Masuk sekali, semua terbuka.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ALUR ===== */}
      <section className="px-4 sm:px-6 py-16 border-t border-garis">
        <div className="max-w-6xl mx-auto">
          <h2 className={`${display.className} text-3xl sm:text-4xl font-bold tracking-tight mb-10`}>
            Begini jalannya di lapangan
          </h2>
          <ol className="grid sm:grid-cols-3 gap-6">
            {LANGKAH.map((l) => (
              <li key={l.no}>
                <span
                  className={`${display.className} inline-flex w-10 h-10 items-center justify-center rounded-full bg-karcis border-2 border-ink font-extrabold mb-3`}
                >
                  {l.no}
                </span>
                <h3 className={`${display.className} font-bold mb-1`}>{l.judul}</h3>
                <p className="text-sm text-ink/70">{l.isi}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== HARGA ===== */}
      <section id="harga" className="px-4 sm:px-6 py-16 border-t border-garis">
        <div className="max-w-6xl mx-auto">
          <h2 className={`${display.className} text-3xl sm:text-4xl font-bold tracking-tight mb-2`}>
            Pilih karcis membership Anda
          </h2>
          <p className="text-ink/70 mb-10">Harga penuh, tanpa biaya tersembunyi. Berhenti kapan saja.</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {/* Bulanan */}
            <div className="relative bg-white rounded-2xl border-2 border-ink p-7 transition-transform hover:-translate-y-1 motion-reduce:transform-none">
              <Notch side="left" />
              <Notch side="right" />
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-ink/60 mb-2">
                Membership · Bulanan
              </p>
              <p className={`${display.className} text-4xl font-extrabold mb-1`}>
                Rp100.000
                <span className="text-base font-semibold text-ink/50"> /bulan</span>
              </p>
              <p className="text-sm text-ink/60 mb-6">Cocok untuk mulai atau musim ramai saja.</p>
              <ul className="text-sm space-y-2 mb-6">
                <li>✓ Semua fitur, tanpa dikunci</li>
                <li>✓ Wahana, tiket, dan antrian tak terbatas</li>
                <li>✓ Berhenti otomatis jika tidak diperpanjang</li>
              </ul>
              <div className="border-t-2 border-dashed border-ink/30 pt-4">
                <a
                  href={WA_LINK}
                  className="block text-center px-5 py-3 rounded-full border-2 border-ink font-semibold hover:bg-ink hover:text-paper transition-colors"
                >
                  Ambil paket bulanan
                </a>
              </div>
            </div>

            {/* Tahunan */}
            <div className="relative bg-karcis rounded-2xl border-2 border-ink p-7 shadow-[6px_6px_0_0_rgba(23,53,44,1)] transition-transform hover:-translate-y-1 motion-reduce:transform-none">
              <Notch side="left" />
              <Notch side="right" />
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-ink text-paper text-xs font-bold tracking-wide">
                HEMAT 2 BULAN
              </span>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-ink/60 mb-2">
                Membership · Tahunan
              </p>
              <p className={`${display.className} text-4xl font-extrabold mb-1`}>
                Rp1.000.000
                <span className="text-base font-semibold text-ink/60"> /tahun</span>
              </p>
              <p className="text-sm text-ink/70 mb-6">
                Setara Rp83 ribu/bulan — dua bulan gratis dibanding bayar bulanan.
              </p>
              <ul className="text-sm space-y-2 mb-6">
                <li>✓ Semua yang ada di paket bulanan</li>
                <li>✓ Harga terkunci setahun penuh</li>
                <li>✓ Prioritas bantuan via WhatsApp</li>
              </ul>
              <div className="border-t-2 border-dashed border-ink/40 pt-4">
                <a
                  href={WA_LINK}
                  className="block text-center px-5 py-3 rounded-full bg-ink text-paper font-semibold hover:bg-ink/85 transition-colors"
                >
                  Ambil paket tahunan
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="px-4 sm:px-6 py-16 border-t border-garis">
        <div className="max-w-3xl mx-auto">
          <h2 className={`${display.className} text-3xl font-bold tracking-tight mb-8`}>
            Pertanyaan yang sering masuk
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group bg-white border border-garis rounded-xl px-5 py-4">
                <summary className="cursor-pointer font-semibold list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-ink/40 group-open:rotate-45 transition-transform motion-reduce:transform-none">
                    +
                  </span>
                </summary>
                <p className="text-sm text-ink/70 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA AKHIR ===== */}
      <section className="px-4 sm:px-6 py-16 border-t border-garis">
        <div className="max-w-6xl mx-auto bg-ink text-paper rounded-3xl px-8 py-12 text-center">
          <h2 className={`${display.className} text-3xl sm:text-4xl font-bold tracking-tight mb-3`}>
            Musim liburan berikutnya, loket Anda sudah siap.
          </h2>
          <p className="text-paper/70 mb-8 max-w-xl mx-auto">
            Ceritakan tempat wisata Anda — kami bantu siapkan wahana, tiket, dan antriannya sampai jalan.
          </p>
          <a
            href={WA_LINK}
            className="inline-block px-8 py-3 rounded-full bg-karcis text-ink font-bold hover:brightness-95 transition"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </section>

      <footer className="px-4 sm:px-6 py-8 text-center text-sm text-ink/50">
        ZWisata · Ekosistem Zomet · 2026
      </footer>
    </div>
  )
}
