const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

// Filter query yang sudah ada: ?isRamadhan=true&isActive=false
function buildFilter(query) {
  const where = {};
  if (query.isRamadhan !== undefined) where.isRamadhan = query.isRamadhan === 'true';
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';
  return where;
}

// Admin pusat: tanpa ?branchId= melihat template (branchId null), dengan ?branchId= melihat cabang itu.
// Peran lain: hanya cabangnya sendiri.
function scopeFor(actor, requestedBranchId) {
  if (actor.role === 'ADMIN') {
    return requestedBranchId !== undefined ? { branchId: requestedBranchId } : { branchId: null };
  }
  if (!actor.branchId) {
    throw ApiError.forbidden('Akun Anda belum terhubung ke cabang');
  }
  return { branchId: actor.branchId };
}

// Cek apakah actor boleh melihat item ini. Balas 404 kalau tidak boleh, supaya tidak bocor.
function canSee(actor, branchId) {
  if (actor.role === 'ADMIN') return true;
  return branchId !== null && branchId === actor.branchId;
}

async function listItems(actor, query = {}) {
  const requested = query.branchId ? Number(query.branchId) : undefined;
  return prisma.amaliahItem.findMany({
    where: { ...scopeFor(actor, requested), ...buildFilter(query) },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
}

async function getItem(actor, id) {
  const item = await prisma.amaliahItem.findUnique({ where: { id } });
  if (!item || !canSee(actor, item.branchId)) {
    throw ApiError.notFound('Item amaliah tidak ditemukan');
  }
  return item;
}

async function createItem(actor, data) {
  const { branchId: requested, ...rest } = data;

  // Admin sekolah selalu membuat item di cabangnya, apa pun isi body
  const branchId = actor.role === 'ADMIN' ? (requested ?? null) : actor.branchId;
  if (actor.role !== 'ADMIN' && !actor.branchId) {
    throw ApiError.forbidden('Akun Anda belum terhubung ke cabang');
  }

  return prisma.amaliahItem.create({ data: { ...rest, branchId } });
}

async function updateItem(actor, id, data) {
  await getItem(actor, id);
  // Item tidak boleh dipindah ke cabang lain
  const { branchId, ...rest } = data;
  return prisma.amaliahItem.update({ where: { id }, data: rest });
}

// "Hapus" = nonaktifkan, agar riwayat isian siswa tidak rusak
async function deactivateItem(actor, id) {
  await getItem(actor, id);
  return prisma.amaliahItem.update({ where: { id }, data: { isActive: false } });
}

async function importTemplate(actor, requestedBranchId) {
  const branchId = actor.role === 'ADMIN' ? requestedBranchId : actor.branchId;
  if (!branchId) {
    throw ApiError.badRequest('branchId wajib diisi');
  }

  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) {
    throw ApiError.notFound('Cabang tidak ditemukan');
  }

  // Template pusat = item dengan branchId kosong dan masih aktif
  const template = await prisma.amaliahItem.findMany({
    where: { branchId: null, isActive: true },
  });

  // Lewati item yang namanya sudah ada di cabang ini
  const existing = await prisma.amaliahItem.findMany({
    where: { branchId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((item) => item.name));

  const toCopy = template
    .filter((item) => !existingNames.has(item.name))
    .map(({ id, branchId: _ignored, ...rest }) => ({ ...rest, branchId }));

  const result = await prisma.amaliahItem.createMany({
    data: toCopy,
    skipDuplicates: true,
  });

  return {
    copied: result.count,
    skipped: template.length - toCopy.length,
  };
}

module.exports = {
  listItems,
  getItem,
  createItem,
  updateItem,
  deactivateItem,
  importTemplate,
};