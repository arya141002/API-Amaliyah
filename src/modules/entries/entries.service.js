const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');
const { todayJakarta, parseDateOnly, toDateString } = require('../../utils/date');
const ramadhanService = require('../ramadhan-periods/ramadhan-periods.service');

const MAX_BACKDATE_DAYS = 7; // batas pengisian mundur, ubah sesuai kebijakan sekolah

// Ambil profil siswa beserta cabangnya
async function getStudent(userId) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw ApiError.forbidden('Akun Anda tidak memiliki profil siswa');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true },
  });
  if (!user?.branchId) throw ApiError.badRequest('Akun Anda belum terhubung ke cabang');

  return { ...student, branchId: user.branchId };
}

// Semester dicari per cabang, karena tiap cabang punya jadwal sendiri
function findSemesterByDate(branchId, date) {
  return prisma.semester.findFirst({
    where: {
      branchId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
  });
}

// Item yang tampil di form untuk cabang dan tanggal tertentu
async function getItemsForDate(branchId, date) {
  const period = await ramadhanService.findByDate(date);
  const items = await prisma.amaliahItem.findMany({
    where: {
      branchId,
      isActive: true,
      ...(period ? {} : { isRamadhan: false }),
    },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return { items, isRamadhan: Boolean(period) };
}

// Mengembalikan pesan alasan kalau tanggal tidak boleh diisi/diubah, null kalau boleh
function editProblem(dateText, entry) {
  const today = todayJakarta();
  if (dateText > today) return 'Tidak bisa mengisi tanggal yang belum tiba';

  const limit = new Date(`${today}T00:00:00.000Z`);
  limit.setUTCDate(limit.getUTCDate() - MAX_BACKDATE_DAYS);
  if (dateText < toDateString(limit)) {
    return `Pengisian mundur dibatasi ${MAX_BACKDATE_DAYS} hari`;
  }

  if (entry?.verification) return 'Entri sudah diverifikasi guru dan tidak bisa diubah';
  return null;
}

async function getForm(userId, dateString) {
  const student = await getStudent(userId);
  const dateText = dateString || todayJakarta();
  const date = parseDateOnly(dateText);

  const [semester, { items, isRamadhan }, entry] = await Promise.all([
    findSemesterByDate(student.branchId, date),
    getItemsForDate(student.branchId, date),
    prisma.dailyEntry.findUnique({
      where: { studentId_date: { studentId: student.id, date } },
      include: { details: true, verification: true },
    }),
  ]);

  const saved = new Map((entry?.details ?? []).map((d) => [d.itemId, d]));
  const problem = editProblem(dateText, entry);

  return {
    date: dateText,
    isRamadhan,
    semester,
    canEdit: !problem && Boolean(semester),
    lockReason: problem || (semester ? null : 'Tanggal ini di luar semester cabang Anda'),
    notes: entry?.notes ?? null,
    score: entry?.score ?? null,
    verification: entry?.verification ?? null,
    items: items.map((item) => {
      const d = saved.get(item.id);
      return {
        ...item,
        value: d ? { boolValue: d.boolValue, numberValue: d.numberValue, textValue: d.textValue } : null,
      };
    }),
  };
}

async function saveEntry(userId, dateText, { notes, details }) {
  const student = await getStudent(userId);
  const date = parseDateOnly(dateText);

  const semester = await findSemesterByDate(student.branchId, date);
  if (!semester) throw ApiError.badRequest('Tanggal ini di luar semester cabang Anda');

  const existing = await prisma.dailyEntry.findUnique({
    where: { studentId_date: { studentId: student.id, date } },
    include: { verification: true },
  });
  const problem = editProblem(dateText, existing);
  if (problem) throw ApiError.badRequest(problem);

  // Hanya item milik cabang siswa yang boleh diisi
  const { items } = await getItemsForDate(student.branchId, date);
  const allowed = new Map(items.map((i) => [i.id, i]));

  const seen = new Set();
  const rows = details.map((d) => {
    const item = allowed.get(d.itemId);
    if (!item) throw ApiError.badRequest(`Item ${d.itemId} tidak tersedia untuk cabang Anda pada tanggal ini`);
    if (seen.has(d.itemId)) throw ApiError.badRequest(`Item ${d.itemId} terkirim lebih dari sekali`);
    seen.add(d.itemId);

    if (item.inputType === 'CHECKLIST') {
      if (typeof d.boolValue !== 'boolean') {
        throw ApiError.badRequest(`"${item.name}" harus diisi ya/tidak (boolValue)`);
      }
      return { itemId: item.id, boolValue: d.boolValue };
    }
    if (item.inputType === 'NUMBER') {
      if (typeof d.numberValue !== 'number') {
        throw ApiError.badRequest(`"${item.name}" harus diisi angka (numberValue)`);
      }
      if (d.numberValue < 0) {
        throw ApiError.badRequest(`"${item.name}" tidak boleh negatif`);
      }
      return { itemId: item.id, numberValue: d.numberValue };
    }
    if (typeof d.textValue !== 'string') {
      throw ApiError.badRequest(`"${item.name}" harus diisi teks (textValue)`);
    }
    return { itemId: item.id, textValue: d.textValue.trim() };
  });

    // Skor otomatis: persentase ceklis yang dikerjakan dari seluruh ceklis di form
  const checklistTotal = items.filter((i) => i.inputType === 'CHECKLIST').length;
  const checklistDone = rows.filter((r) => r.boolValue === true).length;
  const score = checklistTotal ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  await prisma.$transaction(async (tx) => {
    const entry = await tx.dailyEntry.upsert({
      where: { studentId_date: { studentId: student.id, date } },
      update: { notes, semesterId: semester.id, score },
      create: { studentId: student.id, semesterId: semester.id, date, notes, score },
    });
    await tx.entryDetail.deleteMany({ where: { entryId: entry.id } });
    await tx.entryDetail.createMany({ data: rows.map((r) => ({ ...r, entryId: entry.id })) });
  });

  return getForm(userId, dateText);
}

async function listEntries(userId, { semesterId, from, to }) {
  const student = await getStudent(userId);

  const where = { studentId: student.id };
  if (semesterId) where.semesterId = Number(semesterId);
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = parseDateOnly(from);
    if (to) where.date.lte = parseDateOnly(to);
  }

  return prisma.dailyEntry.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      verification: { select: { status: true, note: true, verifiedAt: true } },
      _count: { select: { details: true } },
    },
  });
}

module.exports = { getForm, saveEntry, listEntries };