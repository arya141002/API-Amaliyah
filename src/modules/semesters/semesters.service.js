const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

async function list() {
  return prisma.semester.findMany({ orderBy: { startDate: 'desc' } });
}

async function getActive() {
  const semester = await prisma.semester.findFirst({ where: { isActive: true } });
  if (!semester) throw ApiError.notFound('Belum ada semester aktif');
  return semester;
}

async function getById(id) {
  const semester = await prisma.semester.findUnique({ where: { id } });
  if (!semester) throw ApiError.notFound('Semester tidak ditemukan');
  return semester;
}

async function create(data) {
  return prisma.$transaction(async (tx) => {
    if (data.isActive) {
      await tx.semester.updateMany({ where: { isActive: true }, data: { isActive: false } });
    }
    return tx.semester.create({ data });
  });
}

async function update(id, data) {
  const current = await getById(id);

  const start = data.startDate ?? current.startDate;
  const end = data.endDate ?? current.endDate;
  if (end <= start) throw ApiError.badRequest('Tanggal selesai harus setelah tanggal mulai');

  return prisma.$transaction(async (tx) => {
    if (data.isActive) {
      await tx.semester.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }
    return tx.semester.update({ where: { id }, data });
  });
}

async function remove(id) {
  await getById(id);
  await prisma.semester.delete({ where: { id } }); // ditolak (409) kalau sudah ada entri
}

module.exports = { list, getActive, getById, create, update, remove };