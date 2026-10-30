const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

const include = {
  homeroomTeacher: { select: { id: true, user: { select: { name: true } } } },
  _count: { select: { students: true } },
};

async function list() {
  return prisma.class.findMany({
    include,
    orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }],
  });
}

async function getById(id) {
  const kelas = await prisma.class.findUnique({
    where: { id },
    include: {
      ...include,
      students: { select: { id: true, nis: true, name: true } },
    },
  });
  if (!kelas) throw ApiError.notFound('Kelas tidak ditemukan');
  return kelas;
}

async function create(data) {
  return prisma.class.create({ data, include });
}

async function update(id, data) {
  await getById(id);
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