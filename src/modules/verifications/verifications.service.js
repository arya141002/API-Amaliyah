const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');
const { parseDateOnly, todayJakarta } = require('../../utils/date');
const { getHomeroomClassIds } = require('../../utils/teacherScope');

// Batas entri yang boleh dilihat peran ini
async function scopeFor(actor) {
  if (actor.role === 'ADMIN') return {};

  if (actor.role === 'GURU') {
    const classIds = await getHomeroomClassIds(actor.id);
    return { student: { classId: { in: classIds } } };
  }

  if (actor.role === 'ADMIN_SEKOLAH' || actor.role === 'KEPALA_SEKOLAH') {
    if (!actor.branchId) throw ApiError.forbidden('Akun belum terhubung ke cabang');
    return { student: { class: { branchId: actor.branchId } } };
  }

  throw ApiError.forbidden('Tidak punya akses ke verifikasi');
}

async function listEntries(actor, { classId, branchId, date, from, to }) {
  const where = { AND: [await scopeFor(actor)] };

  if (classId) where.AND.push({ student: { classId: Number(classId) } });
  if (branchId) where.AND.push({ student: { class: { branchId: Number(branchId) } } });

  if (date) {
    where.AND.push({ date: parseDateOnly(date) });
  } else {
    if (from) where.AND.push({ date: { gte: parseDateOnly(from) } });
    if (to) where.AND.push({ date: { lte: parseDateOnly(to) } });
    if (!from && !to) where.AND.push({ date: parseDateOnly(todayJakarta()) });
  }

  return prisma.dailyEntry.findMany({
    where,
    orderBy: [{ date: 'desc' }, { studentId: 'asc' }],
    include: {
      student: {
        select: {
          id: true,
          nis: true,
          user: { select: { name: true } },
          class: { select: { id: true, name: true } },
        },
      },
      verification: true,
      _count: { select: { details: true } },
    },
  });
}

// Ambil satu entri, dan balas 404 kalau di luar cakupan actor
async function findEntryInScope(actor, entryId) {
  const entry = await prisma.dailyEntry.findFirst({
    where: { AND: [{ id: entryId }, await scopeFor(actor)] },
  });
  if (!entry) throw ApiError.notFound('Entri tidak ditemukan');
  return entry;
}

async function getEntry(actor, entryId) {
  await findEntryInScope(actor, entryId);

  return prisma.dailyEntry.findUnique({
    where: { id: entryId },
    include: {
      student: {
        select: {
          id: true,
          nis: true,
          user: { select: { name: true } },
          class: { select: { id: true, name: true } },
        },
      },
      details: {
        include: { item: { select: { name: true, inputType: true, unit: true } } },
        orderBy: { itemId: 'asc' },
      },
      verification: true,
    },
  });
}

async function verifyEntry(actor, entryId, { status, note }) {
  if (actor.role !== 'GURU') {
    throw ApiError.forbidden('Hanya wali kelas yang dapat memverifikasi');
  }

  await findEntryInScope(actor, entryId);

  const teacher = await prisma.teacher.findUnique({ where: { userId: actor.id } });
  if (!teacher) throw ApiError.forbidden('Akun ini tidak memiliki profil guru');

  return prisma.verification.upsert({
    where: { entryId },
    update: { teacherId: teacher.id, status, note, verifiedAt: new Date() },
    create: { entryId, teacherId: teacher.id, status, note },
  });
}

async function removeVerification(actor, entryId) {
  if (actor.role !== 'GURU') {
    throw ApiError.forbidden('Hanya wali kelas yang dapat menghapus verifikasi');
  }

  await findEntryInScope(actor, entryId);

  const result = await prisma.verification.deleteMany({ where: { entryId } });
  if (result.count === 0) {
    throw ApiError.notFound('Entri ini belum diverifikasi');
  }
}

module.exports = { listEntries, getEntry, verifyEntry, removeVerification };