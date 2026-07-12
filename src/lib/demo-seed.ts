import prisma from '@/lib/prisma'

// === DEMO DATA ===

const DEMO_WAHANA = [
  { nama: 'Wahana Roller Coaster', slug: 'roller-coaster', deskripsi: 'Wahana seru meliuk-liuk cepat', kapasitas: 20, tinggiMin: 120, durasiMenit: 5, status: 'AKTIF' },
  { nama: 'Kolam Renang', slug: 'kolam-renang', deskripsi: 'Kolam renang untuk semua umur', kapasitas: 50, tinggiMin: 0, durasiMenit: 60, status: 'AKTIF' },
  { nama: 'Flying Fox', slug: 'flying-fox', deskripsi: 'Meluncur dari ketinggian 30m', kapasitas: 5, tinggiMin: 130, durasiMenit: 3, status: 'AKTIF' },
  { nama: 'Outbound Trail', slug: 'outbound-trail', deskripsi: 'Jalur petualangan alam', kapasitas: 15, tinggiMin: 110, durasiMenit: 30, status: 'AKTIF' },
]

const DEMO_TIKET = [
  { nama: 'Tiket Masuk', slug: 'tiket-masuk', deskripsi: 'Akses masuk area wisata', tipe: 'MASUK', harga: 50000 },
  { nama: 'Tiket Roller Coaster', slug: 'tiket-rc', deskripsi: 'Satu kali naik roller coaster', tipe: 'WAHANA', harga: 25000 },
  { nama: 'Tiket Kolam Renang', slug: 'tiket-kr', deskripsi: 'Akses kolam renang 2 jam', tipe: 'WAHANA', harga: 30000 },
  { nama: 'Paket Keluarga', slug: 'paket-keluarga', deskripsi: 'Masuk + 4 wahana (2 dewasa + 2 anak)', tipe: 'PAKET', harga: 150000 },
]

const DEMO_STAFF = [
  { nama: 'Budi Santoso', nip: 'STF-001', noHp: '081234567890', posisi: 'OPERATOR' },
  { nama: 'Siti Aminah', nip: 'STF-002', noHp: '081234567891', posisi: 'KASIR' },
  { nama: 'Andi Pratama', nip: 'STF-003', noHp: '081234567892', posisi: 'OPERATOR' },
]

const DEMO_PEMESAN = [
  { nama: 'Rudi Hermawan', email: 'rudi@demo.com', noHp: '081111111111' },
  { nama: 'Dewi Lestari', email: 'dewi@demo.com', noHp: '082222222222' },
  { nama: 'Ahmad Fauzi', email: 'ahmad@demo.com', noHp: '083333333333' },
  { nama: 'Maya Sari', email: 'maya@demo.com', noHp: '084444444444' },
  { nama: 'Bima Prakasa', email: 'bima@demo.com', noHp: '085555555555' },
  { nama: 'Sari Indah', email: 'sari@demo.com', noHp: '086666666666' },
  { nama: 'Hendra Wijaya', email: 'hendra@demo.com', noHp: '087777777777' },
  { nama: 'Rina Kusuma', email: 'rina@demo.com', noHp: '088888888888' },
  { nama: 'Doni Saputra', email: 'doni@demo.com', noHp: '089999999999' },
  { nama: 'Lina Marlina', email: 'lina@demo.com', noHp: '081100001111' },
  { nama: 'Agus Setiawan', email: 'agus@demo.com', noHp: '081200002222' },
  { nama: 'Fitri Handayani', email: 'fitri@demo.com', noHp: '081300003333' },
]

// === SEED FUNCTIONS ===

function dateOffset(daysBack: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0)
  return d
}

export async function seedDataDemo(tenantId: string) {
  // Clean first
  await bersihkanDataWisata(tenantId)

  // Wahana
  const wahanas = await Promise.all(
    DEMO_WAHANA.map(w => prisma.wahana.create({ data: { ...w, tenantId } }))
  )

  // Tiket (link some to wahana)
  const tikets = await Promise.all(
    DEMO_TIKET.map((t, i) => {
      const data: any = { ...t, tenantId }
      if (t.tipe === 'WAHANA' && wahanas[i - 1]) {
        data.wahanaId = wahanas[i - 1].id
      }
      return prisma.tiket.create({ data })
    })
  )

  // Staff
  const staffs = await Promise.all(
    DEMO_STAFF.map(s => prisma.staff.create({ data: { ...s, tenantId } }))
  )

  // Create demo user for orders
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo Visitor',
      email: `demo-${tenantId.slice(-6)}@zomet.my.id`,
      role: 'USER',
      tenantId,
    },
  })

  const tiketMasuk = tikets.find(t => t.tipe === 'MASUK')!
  const tiketRC = tikets.find(t => t.slug === 'tiket-rc')!
  const tiketKR = tikets.find(t => t.slug === 'tiket-kr')!
  const tiketPaket = tikets.find(t => t.tipe === 'PAKET')!

  // Orders spread over last 28 days, varied statuses and tiket types
  const PESANAN_DEMO = [
    { i: 0, daysBack: 27, status: 'SELESAI', qty: 3, tiket: tiketMasuk, extra: null },
    { i: 1, daysBack: 24, status: 'SELESAI', qty: 2, tiket: tiketPaket, extra: null },
    { i: 2, daysBack: 21, status: 'SELESAI', qty: 4, tiket: tiketMasuk, extra: tiketRC },
    { i: 3, daysBack: 18, status: 'DIPAKAI', qty: 5, tiket: tiketMasuk, extra: null },
    { i: 4, daysBack: 15, status: 'SELESAI', qty: 2, tiket: tiketPaket, extra: null },
    { i: 5, daysBack: 12, status: 'SELESAI', qty: 3, tiket: tiketMasuk, extra: tiketKR },
    { i: 6, daysBack: 10, status: 'DIBAYAR', qty: 4, tiket: tiketMasuk, extra: null },
    { i: 7, daysBack: 7, status: 'SELESAI', qty: 2, tiket: tiketPaket, extra: tiketRC },
    { i: 8, daysBack: 5, status: 'DIBAYAR', qty: 3, tiket: tiketMasuk, extra: null },
    { i: 9, daysBack: 4, status: 'SELESAI', qty: 5, tiket: tiketMasuk, extra: tiketKR },
    { i: 10, daysBack: 2, status: 'DIBAYAR', qty: 2, tiket: tiketPaket, extra: null },
    { i: 11, daysBack: 0, status: 'MENUNGGU', qty: 4, tiket: tiketMasuk, extra: null },
  ]

  const pesanans = await Promise.all(
    PESANAN_DEMO.map(p => {
      const pemesan = DEMO_PEMESAN[p.i]
      const harga = p.tiket.harga!
      const subtotal1 = harga * p.qty
      const extraSubtotal = p.extra ? p.extra.harga! * p.qty : 0
      const total = subtotal1 + extraSubtotal
      const items: any[] = [{ tiketId: p.tiket.id, qty: p.qty, harga, subtotal: subtotal1 }]
      if (p.extra) items.push({ tiketId: p.extra.id, qty: p.qty, harga: p.extra.harga!, subtotal: extraSubtotal })

      return prisma.pesanan.create({
        data: {
          tenantId,
          userId: demoUser.id,
          kode: `WIS-DEMO-${String(p.i + 1).padStart(3, '0')}`,
          namaPemesan: pemesan.nama,
          emailPemesan: pemesan.email,
          noHpPemesan: pemesan.noHp,
          tglKunjungan: dateOffset(p.daysBack),
          total,
          status: p.status,
          items: { create: items },
        },
      })
    })
  )

  return {
    wahanas: wahanas.length,
    tikets: tikets.length,
    staff: staffs.length,
    pesanans: pesanans.length,
  }
}

export async function bersihkanDataWisata(tenantId: string) {
  // Delete in order (respect FK)
  await prisma.antrian.deleteMany({ where: { tenantId } })

  const pesanans = await prisma.pesanan.findMany({ where: { tenantId }, select: { id: true } })
  for (const p of pesanans) {
    await prisma.pesananItem.deleteMany({ where: { pesananId: p.id } })
  }
  await prisma.pesanan.deleteMany({ where: { tenantId } })

  await prisma.staff.deleteMany({ where: { tenantId } })
  await prisma.tiket.deleteMany({ where: { tenantId } })
  await prisma.wahana.deleteMany({ where: { tenantId } })

  // Delete demo users (not the tenant owner)
  await prisma.user.deleteMany({ where: { tenantId, role: 'USER' } })
}
