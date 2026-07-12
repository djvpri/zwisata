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
  { nama: 'Rudi Hermawan', email: 'rudi@demo.com', noHp: '081111111111', jumlah: 3 },
  { nama: 'Dewi Lestari', email: 'dewi@demo.com', noHp: '082222222222', jumlah: 4 },
  { nama: 'Ahmad Fauzi', email: 'ahmad@demo.com', noHp: '083333333333', jumlah: 2 },
  { nama: 'Maya Sari', email: 'maya@demo.com', noHp: '084444444444', jumlah: 5 },
]

// === SEED FUNCTIONS ===

function randomDate(daysBack: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack))
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

  // Pesanan
  const tiketMasuk = tikets.find(t => t.tipe === 'MASUK')!
  const pesanans = await Promise.all(
    DEMO_PEMESAN.map((p, i) => {
      const totalHarga = tiketMasuk.harga! * p.jumlah
      return prisma.pesanan.create({
        data: {
          tenantId,
          userId: demoUser.id,
          kode: `WIS-DEMO-${String(i + 1).padStart(3, '0')}`,
          namaPemesan: p.nama,
          emailPemesan: p.email,
          noHpPemesan: p.noHp,
          tglKunjungan: randomDate(7),
          total: totalHarga,
          status: i < 3 ? 'DIBAYAR' : 'MENUNGGU',
          items: {
            create: [{ tiketId: tiketMasuk.id, qty: p.jumlah, harga: tiketMasuk.harga!, subtotal: tiketMasuk.harga! * p.jumlah }],
          },
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
