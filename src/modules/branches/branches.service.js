const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

async function listBranches() {
  return prisma.branch.findMany({ orderBy: { name: 'asc' } });
}

async function getBranch(id) {
  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) throw new ApiError(404, 'Cabang tidak ditemukan');
  return branch;
}

async function createBranch(data) {
  return prisma.branch.create({ data });
}

async function updateBranch(id, data) {
  await getBranch(id);
  return prisma.branch.update({ where: { id }, data });
}

// Cabang tidak dihapus permanen, karena semester, kelas, dan entri
// siswa masih menempel padanya. Cukup dinonaktifkan.
async function deactivateBranch(id) {
  await getBranch(id);
  return prisma.branch.update({ where: { id }, data: { isActive: false } });
}

async function destroyBranch(id) {
  await getBranch(id);

  const [userCount, classCount, semesterCount, itemCount] = await Promise.all([
    prisma.user.count({ where: { branchId: id } }),
    prisma.class.count({ where: { branchId: id } }),
    prisma.semester.count({ where: { branchId: id } }),
    prisma.amaliahItem.count({ where: { branchId: id } }),
  ]);

  const related = [];
  if (userCount) related.push(`${userCount} pengguna`);
  if (classCount) related.push(`${classCount} kelas`);
  if (semesterCount) related.push(`${semesterCount} semester`);
  if (itemCount) related.push(`${itemCount} item amaliyah`);

  if (related.length > 0) {
    throw ApiError.conflict(
      `Cabang masih digunakan oleh ${related.join(', ')}. Nonaktifkan saja atau hapus data terkait terlebih dahulu.`
    );
  }

  return prisma.branch.delete({ where: { id } });
}

module.exports = {
  listBranches,
  getBranch,
  createBranch,
  updateBranch,
  deactivateBranch,
  destroyBranch,
};