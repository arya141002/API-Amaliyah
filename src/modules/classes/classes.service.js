const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

const include = {
  branch: { select: { id: true, name: true } },
  homeroomTeacher: { select: { id: true, user: { select: { name: true } } } },
  _count: { select: { students: true } },
};

async function validateHomeroomTeacher(branchId, homeroomTeacherId) {
  if (homeroomTeacherId === undefined || homeroomTeacherId === null) return;
  const teacher = await prisma.teacher.findFirst({
    where: { id: homeroomTeacherId, user: { branchId, role: 'GURU', isActive: true } },
  });
  if (!teacher) throw ApiError.badRequest('Guru wali kelas harus berasal dari cabang yang sama dan aktif');
}

async function list(actor) {
  return prisma.class.findMany({
    where: actor.role === 'ADMIN_SEKOLAH' ? { branchId: actor.branchId } : undefined,
    include,
    orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }],
  });
}

async function getById(id, actor) {
  const kelas = await prisma.class.findUnique({
    where: { id },
    include: {
      ...include,
      students: { select: { id: true, nis: true, name: true } },
    },
  });
  if (!kelas) throw ApiError.notFound('Kelas tidak ditemukan');
  if (actor?.role === 'ADMIN_SEKOLAH' && kelas.branchId !== actor.branchId) throw ApiError.notFound('Kelas tidak ditemukan');
  return kelas;
}

async function create(actor, data) {
  if (actor.role === 'ADMIN_SEKOLAH') data = { ...data, branchId: actor.branchId };
  await validateHomeroomTeacher(data.branchId, data.homeroomTeacherId);
  return prisma.class.create({ data, include });
}

async function update(actor, id, data) {
  const current = await getById(id, actor);
  if (actor.role === 'ADMIN_SEKOLAH') data = { ...data, branchId: actor.branchId };
  await validateHomeroomTeacher(data.branchId ?? current.branchId, data.homeroomTeacherId);
  return prisma.class.update({ where: { id }, data, include });
}

async function remove(id) {
  await getById(id);
  await prisma.class.delete({ where: { id } }); // siswa tetap ada, classId jadi null
}

// Memasukkan beberapa siswa sekaligus ke satu kelas
async function assignStudents(id, studentIds) {
  await getById(id);
  await prisma.student.updateMany({
    where: { id: { in: studentIds } },
    data: { classId: id },
  });
  return getById(id);
}

module.exports = { list, getById, create, update, remove, assignStudents };