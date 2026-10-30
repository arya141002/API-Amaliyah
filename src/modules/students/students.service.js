const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');
const { getBranchFilter, assertBranchAccess } = require('../../utils/branchScope');

const include = {
  class: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
};

async function validateClass(branchId, classId) {
  if (classId === undefined || classId === null) return;
  const kelas = await prisma.class.findUnique({ where: { id: classId }, select: { branchId: true } });
  if (!kelas || kelas.branchId !== branchId) throw ApiError.badRequest('Kelas tidak sesuai dengan cabang siswa');
}

async function createStudent(actor, { name, nis, branchId, classId }) {
  const targetBranchId = actor.role === 'ADMIN_SEKOLAH' ? actor.branchId : branchId;
  if (!targetBranchId) throw ApiError.badRequest('branchId wajib diisi');
  await validateClass(targetBranchId, classId);
  try {
    return await prisma.student.create({
      data: { name, nis, branchId: targetBranchId, classId: classId ?? null },
      include,
    });
  } catch (error) {
    if (error.code === 'P2002') throw ApiError.conflict('NIS sudah digunakan');
    throw error;
  }
}

async function listStudents(actor, { search, branchId, page = 1, limit = 20 }) {
  const take = Number(limit);
  const currentPage = Number(page);
  const where = { ...getBranchFilter(actor, branchId ? Number(branchId) : undefined) };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nis: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.student.findMany({ where, include, skip: (currentPage - 1) * take, take, orderBy: { name: 'asc' } }),
    prisma.student.count({ where }),
  ]);
  return { data, pagination: { total, page: currentPage, limit: take, totalPages: Math.ceil(total / take) || 1 } };
}

async function getStudent(actor, id) {
  const student = await prisma.student.findUnique({ where: { id }, include });
  if (!student) throw ApiError.notFound('Siswa tidak ditemukan');
  assertBranchAccess(actor, student.branchId);
  return student;
}

async function updateStudent(actor, id, { name, nis, branchId, classId, isActive }) {
  const student = await getStudent(actor, id);
  const targetBranchId = actor.role === 'ADMIN_SEKOLAH' ? actor.branchId : (branchId ?? student.branchId);
  await validateClass(targetBranchId, classId);
  try {
    return await prisma.student.update({
      where: { id },
      data: { name, nis, branchId: targetBranchId, classId, isActive },
      include,
    });
  } catch (error) {
    if (error.code === 'P2002') throw ApiError.conflict('NIS sudah digunakan');
    throw error;
  }
}

async function deactivateStudent(actor, id) {
  await getStudent(actor, id);
  return prisma.student.update({ where: { id }, data: { isActive: false }, include });
}

async function destroyStudent(actor, id) {
  await getStudent(actor, id);
  try {
    return await prisma.student.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2003') throw ApiError.conflict('Siswa masih memiliki data terkait dan tidak dapat dihapus permanen');
    throw error;
  }
}

module.exports = { createStudent, listStudents, getStudent, updateStudent, deactivateStudent, destroyStudent };
