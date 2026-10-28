require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const username = process.env.SEED_ADMIN_USERNAME || 'admin';
    const plainPassword = process.env.SEED_ADMIN_PASSWORD;
    const name = 'Super Administrator';

    if (!plainPassword) {
    throw new Error('SEED_ADMIN_PASSWORD belum diisi di .env');
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const adminUser = await prisma.user.upsert({
        where: { username: username },
        update: {}, // Jika user sudah ada, tidak ada data yang diubah
        create: {
        name: name,
        username: username,
        passwordHash: hashedPassword, // Sesuaikan dengan nama kolom di schema.prisma Anda
        role: 'ADMIN',
        },
    });

    console.log(`Berhasil mengamankan akun admin: ${adminUser.username}`);
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    // 5. Tutup koneksi Prisma di dalam blok finally
    await prisma.$disconnect();
  });