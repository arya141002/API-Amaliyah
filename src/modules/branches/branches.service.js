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

module.exports = {
  listBranches,
  getBranch,
  createBranch,
  updateBranch,
  deactivateBranch,
};