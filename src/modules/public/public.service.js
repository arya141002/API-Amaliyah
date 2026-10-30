const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');
const { todayJakarta, toDateString } = require('../../utils/date');
const entriesService = require('../entries/entries.service');

// Siswa harus aktif, punya kelas, dan cabangnya aktif
async function findActiveStudent(studentId) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      userId: true,
      user: { select: { isActive: true } },
      class: { select: { branch: { select: { isActive: true } } } },
    },
  });

  if (!student || !student.user.isActive || !student.class || !student.class.branch.isActive) {
    throw ApiError.notFound('Siswa tidak ditemukan');
  }
  return student;
}

// Hanya status verifikasi yang boleh terlihat, catatan guru tidak
function publicForm(form) {
  return {
    ...form,
    verification: form.verification ? { status: form.verification.status } : null,
  };
}

function listBranches() {
  return prisma.branch.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

function listClasses(branchId) {
  return prisma.class.findMany({
    where: { branchId, branch: { isActive: true } },
    select: { id: true, name: true },
    orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }],
  });
}

async function searchStudents({ classId, q }) {
  const term = (q || '').trim();
  if (term.length < 2) {
    throw ApiError.badRequest('Ketik minimal 2 huruf nama siswa');
  }

  const students = await prisma.student.findMany({
    where: {
      classId,
      user: { isActive: true, name: { contains: term, mode: 'insensitive' } },
    },
    select: { id: true, user: { select: { name: true } } },
    orderBy: { user: { name: 'asc' } },
    take: 10,
  });

  return students.map((s) => ({ id: s.id, name: s.user.name }));
}

async function getForm(studentId, date) {
  const student = await findActiveStudent(studentId);
  return publicForm(await entriesService.getForm(student.userId, date));
}

async function saveEntry(studentId, date, body) {
  const student = await findActiveStudent(studentId);
  return publicForm(await entriesService.saveEntry(student.userId, date, body));
}

async function history(studentId) {
  const student = await findActiveStudent(studentId);

  const today = todayJakarta();
  const from = new Date(`${today}T00:00:00.000Z`);
  from.setUTCDate(from.getUTCDate() - 13);

  const entries = await entriesService.listEntries(student.userId, {
    from: toDateString(from),
    to: today,
  });

  return entries.map((e) => ({
    date: toDateString(e.date),
    score: e.score,
    status: e.verification ? e.verification.status : null,
  }));
}

module.exports = { listBranches, listClasses, searchStudents, getForm, saveEntry, history };