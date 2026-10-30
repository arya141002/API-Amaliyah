require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ───── pembantu tanggal ─────
const todayText = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
const dateOnly = (text) => new Date(`${text}T00:00:00.000Z`);
const addDays = (text, n) => {
  const d = dateOnly(text);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// ───── data contoh ─────
const CABANG = [
  { name: 'Cabang 1', address: 'Jl. Utama No. 1' },
  { name: 'Cabang 2', address: 'Jl. Kedua No. 2' },
];

const ADMIN_SEKOLAH = [
  { name: 'Admin Cabang 1', username: 'adminc1', password: 'rahasia123', cabang: 'Cabang 1' },
  { name: 'Admin Cabang 2', username: 'adminc2', password: 'rahasia123', cabang: 'Cabang 2' },
];

const GURU = [
  { name: 'Pak Budi', username: 'budi', password: 'guru12345', nip: '198001012005011001', cabang: 'Cabang 1' },
  { name: 'Bu Sari', username: 'sari', password: 'guru12345', nip: null, cabang: 'Cabang 1' },
  { name: 'Pak Bambang', username: 'bambang', password: 'guru12345', nip: null, cabang: 'Cabang 2' },
];

const SISWA = [
  { name: 'Ahmad Fauzi', username: 'ahmad', password: 'siswa12345', nis: '2026001', cabang: 'Cabang 1' },
  { name: 'Siti Aisyah', username: 'siti', password: 'siswa12345', nis: '2026002', cabang: 'Cabang 1' },
  { name: 'Rizky Pratama', username: 'rizky', password: 'siswa12345', nis: '2026003', cabang: 'Cabang 1' },
  { name: 'Dewi Lestari', username: 'dewi', password: 'siswa12345', nis: '2026004', cabang: 'Cabang 2' },
];

const KEPSEK = { name: 'Bapak Kepala Sekolah', username: 'kepsek', password: 'kepsek12345', cabang: 'Cabang 1' };

// Template pusat (branchId null)
const ITEMS = [
  { name: 'Sholat Subuh berjamaah', category: 'Sholat', inputType: 'RADIO', options: ['Tidak', 'Di rumah', 'Di masjid'], sortOrder: 1 },
  { name: 'Sholat Dzuhur berjamaah', category: 'Sholat', inputType: 'CHECKLIST', sortOrder: 2 },
  { name: 'Sholat Ashar berjamaah', category: 'Sholat', inputType: 'CHECKLIST', sortOrder: 3 },
  { name: 'Sholat Maghrib berjamaah', category: 'Sholat', inputType: 'CHECKLIST', sortOrder: 4 },
  { name: 'Sholat Isya berjamaah', category: 'Sholat', inputType: 'CHECKLIST', sortOrder: 5 },
  { name: 'Sholat Dhuha', category: 'Sholat Sunnah', inputType: 'CHECKLIST', sortOrder: 6 },
  { name: "Tilawah Al-Qur'an", category: "Al-Qur'an", inputType: 'NUMBER', unit: 'halaman', sortOrder: 7 },
  { name: 'Dzikir pagi/petang', category: 'Dzikir', inputType: 'CHECKLIST', sortOrder: 8 },
  // khusus Ramadhan
  { name: 'Puasa Ramadhan', category: 'Puasa', inputType: 'CHECKLIST', isRamadhan: true, sortOrder: 20 },
  { name: 'Sholat Tarawih', category: 'Sholat Sunnah', inputType: 'CHECKLIST', isRamadhan: true, sortOrder: 21 },
  { name: 'Tadarus', category: "Al-Qur'an", inputType: 'NUMBER', unit: 'juz', isRamadhan: true, sortOrder: 22 },
  { name: 'Berbagi takjil/sedekah', category: 'Sosial', inputType: 'CHECKLIST', isRamadhan: true, sortOrder: 23 },
];

// ───── pembantu database ─────
async function upsertCabang({ name, address }) {
  const found = await prisma.branch.findFirst({ where: { name } });
  if (found) {
    return prisma.branch.update({ where: { id: found.id }, data: { address, isActive: true } });
  }
  return prisma.branch.create({ data: { name, address } });
}

async function upsertSemester(branchId, { academicYear, term, startDate, endDate, isActive }) {
  return prisma.semester.upsert({
    where: { branchId_academicYear_term: { branchId, academicYear, term } },
    update: { startDate, endDate, isActive },
    create: { branchId, academicYear, term, startDate, endDate, isActive },
  });
}

async function upsertTemplateItem(item) {
  const found = await prisma.amaliahItem.findFirst({ where: { name: item.name, branchId: null } });
  if (found) {
    await prisma.amaliahItem.update({ where: { id: found.id }, data: { ...item, branchId: null, isActive: true } });
  } else {
    await prisma.amaliahItem.create({ data: { ...item, branchId: null } });
  }
}

// Salin semua template pusat ke satu cabang (sama seperti tombol import di API)
async function salinTemplate(branchId) {
  const template = await prisma.amaliahItem.findMany({ where: { branchId: null } });
  for (const t of template) {
    const { id, branchId: _ignored, ...data } = t;
    const found = await prisma.amaliahItem.findFirst({ where: { branchId, name: t.name } });
    if (found) {
      await prisma.amaliahItem.update({ where: { id: found.id }, data: { ...data, isActive: true } });
    } else {
      await prisma.amaliahItem.create({ data: { ...data, branchId } });
    }
  }
}

async function upsertUser({ name, username, password, role, branchId }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { username },
    update: { name, passwordHash, role, branchId, isActive: true },
    create: { name, username, passwordHash, role, branchId },
  });
}

async function upsertKelas(branchId, { name, gradeLevel, homeroomTeacherId }) {
  const found = await prisma.class.findFirst({ where: { branchId, name } });
  if (found) {
    return prisma.class.update({ where: { id: found.id }, data: { gradeLevel, homeroomTeacherId } });
  }
  return prisma.class.create({ data: { branchId, name, gradeLevel, homeroomTeacherId } });
}

async function main() {
  const today = todayText();
  const ramadhanToday = process.argv.includes('--ramadhan-hari-ini');

  // 1. Cabang
  const cabang = {};
  for (const c of CABANG) {
    cabang[c.name] = await upsertCabang(c);
  }

  // 2. Semester per cabang: GANJIL aktif, GENAP tidak aktif
  const semesterGanjil = {};
  for (const c of Object.values(cabang)) {
    await prisma.semester.updateMany({ where: { branchId: c.id }, data: { isActive: false } });
    semesterGanjil[c.id] = await upsertSemester(c.id, {
      academicYear: '2026/2027',
      term: 'GANJIL',
      startDate: dateOnly('2026-07-13'),
      endDate: dateOnly('2026-12-19'),
      isActive: true,
    });
    await upsertSemester(c.id, {
      academicYear: '2026/2027',
      term: 'GENAP',
      startDate: dateOnly('2027-01-04'),
      endDate: dateOnly('2027-06-19'),
      isActive: false,
    });
  }

  // 3. Periode Ramadhan 1448 (global)
  const ramStart = ramadhanToday ? addDays(today, -3) : '2027-02-08';
  const ramEnd = ramadhanToday ? addDays(today, 26) : '2027-03-09';
  await prisma.ramadhanPeriod.upsert({
    where: { hijriYear: 1448 },
    update: { startDate: dateOnly(ramStart), endDate: dateOnly(ramEnd) },
    create: { hijriYear: 1448, startDate: dateOnly(ramStart), endDate: dateOnly(ramEnd) },
  });

  // 4. Item: template pusat, lalu disalin ke tiap cabang
  for (const item of ITEMS) {
    await upsertTemplateItem(item);
  }
  for (const c of Object.values(cabang)) {
    await salinTemplate(c.id);
  }

  // 5. Akun admin sekolah
  for (const a of ADMIN_SEKOLAH) {
    await upsertUser({ ...a, role: 'ADMIN_SEKOLAH', branchId: cabang[a.cabang].id });
  }

  // 6. Akun guru
  const guru = {};
  for (const g of GURU) {
    const user = await upsertUser({ ...g, role: 'GURU', branchId: cabang[g.cabang].id });
    guru[g.username] = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: { nip: g.nip },
      create: { userId: user.id, nip: g.nip },
    });
  }

  // 7. Akun siswa
  const siswa = {};
  for (const s of SISWA) {
    const user = await upsertUser({ ...s, role: 'SISWA', branchId: cabang[s.cabang].id });
    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: { nis: s.nis },
      create: { userId: user.id, nis: s.nis },
    });
    siswa[s.username] = { student, cabang: s.cabang };
  }

  // 8. Akun kepala sekolah
  await upsertUser({ ...KEPSEK, role: 'KEPALA_SEKOLAH', branchId: cabang[KEPSEK.cabang].id });

  // 9. Kelas per cabang, lalu masukkan siswa sesuai cabangnya
  const kelas = {
    'Cabang 1': await upsertKelas(cabang['Cabang 1'].id, {
      name: 'X IPA 1',
      gradeLevel: 10,
      homeroomTeacherId: guru['budi'].id,
    }),
    'Cabang 2': await upsertKelas(cabang['Cabang 2'].id, {
      name: 'X IPA 1',
      gradeLevel: 10,
      homeroomTeacherId: guru['bambang'].id,
    }),
  };
  for (const { student, cabang: namaCabang } of Object.values(siswa)) {
    await prisma.student.update({ where: { id: student.id }, data: { classId: kelas[namaCabang].id } });
  }

  // 10. Entri contoh untuk 3 hari terakhir, memakai item cabang masing-masing
  for (const [username, { student, cabang: namaCabang }] of Object.entries(siswa)) {
    const branchId = cabang[namaCabang].id;
    const semester = semesterGanjil[branchId];
    const items = await prisma.amaliahItem.findMany({
      where: { branchId, isActive: true, isRamadhan: false },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    for (let back = 1; back <= 3; back++) {
      const date = dateOnly(addDays(today, -back));
      if (date < semester.startDate || date > semester.endDate) continue;

      const entry = await prisma.dailyEntry.upsert({
        where: { studentId_date: { studentId: student.id, date } },
        update: { semesterId: semester.id, notes: 'Data contoh' },
        create: { studentId: student.id, semesterId: semester.id, date, notes: 'Data contoh' },
      });
      await prisma.entryDetail.deleteMany({ where: { entryId: entry.id } });
      await prisma.entryDetail.createMany({
        data: items.map((item, n) => {
          if (item.inputType === 'CHECKLIST') {
            return { entryId: entry.id, itemId: item.id, boolValue: (n + back) % 4 !== 0 };
          }
          if (item.inputType === 'NUMBER') {
            return { entryId: entry.id, itemId: item.id, numberValue: 2 + back };
          }
          if (item.inputType === 'RADIO') {
            const options = Array.isArray(item.options) ? item.options : ['Tidak'];
            return { entryId: entry.id, itemId: item.id, textValue: options[(n + back) % options.length] };
          }
          return { entryId: entry.id, itemId: item.id, textValue: 'Alhamdulillah' };
        }),
      });
    }
  }

  // 11. Ringkasan
  console.log('\n=== AKUN UNTUK TES ===');
  console.table([
    { username: 'admin', password: '(dari .env)', peran: 'ADMIN', cabang: '-' },
    ...ADMIN_SEKOLAH.map((a) => ({ username: a.username, password: a.password, peran: 'ADMIN_SEKOLAH', cabang: a.cabang })),
    ...GURU.map((g) => ({ username: g.username, password: g.password, peran: 'GURU', cabang: g.cabang })),
    ...SISWA.map((s) => ({ username: s.username, password: s.password, peran: 'SISWA', cabang: s.cabang })),
    { username: KEPSEK.username, password: KEPSEK.password, peran: 'KEPALA_SEKOLAH', cabang: KEPSEK.cabang },
  ]);

  const itemsCabang1 = await prisma.amaliahItem.findMany({
    where: { branchId: cabang['Cabang 1'].id },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  console.log('\n=== ITEM AMALIAH CABANG 1 ===');
  console.table(
    itemsCabang1.map((i) => ({ id: i.id, nama: i.name, tipe: i.inputType, ramadhan: i.isRamadhan, aktif: i.isActive }))
  );

  const sampleItems = itemsCabang1.filter((i) => !i.isRamadhan);
  const sample = {
    notes: 'Alhamdulillah lancar',
    details: sampleItems.map((item) =>
      item.inputType === 'CHECKLIST'
        ? { itemId: item.id, boolValue: true }
        : item.inputType === 'NUMBER'
        ? { itemId: item.id, numberValue: 5 }
        : { itemId: item.id, textValue: '-' }
    ),
  };
  console.log(`\n=== BODY CONTOH: PUT /api/entries/${today} (login sebagai ahmad) ===`);
  console.log(JSON.stringify(sample, null, 2));

  console.log(
    `\nPeriode Ramadhan 1448: ${ramStart} s/d ${ramEnd}` +
      (ramadhanToday ? '  (MODE UJI: mencakup hari ini)' : '')
  );
}

main()
  .catch((e) => {
    console.error('Seed demo gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());