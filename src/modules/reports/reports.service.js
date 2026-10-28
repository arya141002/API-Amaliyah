const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');
const { getHomeroomClassIds } = require('../../utils/teacherScope');

// Batas siswa yang boleh direkap oleh peran ini
async function studentScope(actor) {
  if (actor.role === 'ADMIN') return {};

  if (actor.role === 'GURU') {
    const classIds = await getHomeroomClassIds(actor.id);
    return { classId: { in: classIds } };
  }

  if (actor.role === 'ADMIN_SEKOLAH' || actor.role === 'KEPALA_SEKOLAH') {
    if (!actor.branchId) throw ApiError.forbidden('Akun belum terhubung ke cabang');
    return { class: { branchId: actor.branchId } };
  }

  throw ApiError.forbidden('Tidak punya akses ke rekap');
}

async function semesterRecap(actor, { semesterId, classId }) {
  const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
  if (!semester || (actor.role !== 'ADMIN' && semester.branchId !== actor.branchId)) {
    throw ApiError.notFound('Semester tidak ditemukan');
  }

  const where = { AND: [await studentScope(actor)] };
  if (classId) where.AND.push({ classId });

  const students = await prisma.student.findMany({
    where,
    select: {
      id: true,
      nis: true,
      user: { select: { name: true } },
      class: { select: { id: true, name: true } },
    },
    orderBy: { nis: 'asc' },
  });

  const ids = students.map((s) => s.id);

  const entries = await prisma.dailyEntry.findMany({
    where: { semesterId, studentId: { in: ids } },
    include: {
      details: { include: { item: { select: { inputType: true } } } },
      verification: { select: { status: true } },
    },
  });

  // Siapkan wadah hitung untuk tiap siswa
  const stats = new Map(
    ids.map((id) => [
      id,
      {
        totalEntries: 0,
        verified: 0,
        rejected: 0,
        scores: [],
        checklistDone: 0,
        checklistTotal: 0,
        numberTotal: 0,
      },
    ])
  );

  for (const e of entries) {
    const s = stats.get(e.studentId);
    s.totalEntries++;

    if (e.verification?.status === 'VERIFIED') s.verified++;
    if (e.verification?.status === 'REJECTED') s.rejected++;

    // Skor diambil dari entri, bukan dari verifikasi
    if (typeof e.score === 'number') s.scores.push(e.score);

    for (const d of e.details) {
      if (d.item.inputType === 'CHECKLIST') {
        s.checklistTotal++;
        if (d.boolValue === true) s.checklistDone++;
      }
      if (d.item.inputType === 'NUMBER' && typeof d.numberValue === 'number') {
        s.numberTotal += d.numberValue;
      }
    }
  }

  return students.map((st) => {
    const s = stats.get(st.id);
    return {
      studentId: st.id,
      nis: st.nis,
      name: st.user.name,
      class: st.class,
      totalEntries: s.totalEntries,
      verified: s.verified,
      rejected: s.rejected,
      checklistPercent: s.checklistTotal ? Math.round((s.checklistDone / s.checklistTotal) * 100) : null,
      numberTotal: s.numberTotal,
      averageScore: s.scores.length
        ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
        : null,
    };
  });
}

module.exports = { semesterRecap };