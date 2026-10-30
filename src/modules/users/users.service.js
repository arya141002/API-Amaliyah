const bcrypt = require('bcryptjs');
const prisma = require('../../config/db'); // Gunakan satu tempat impor saja
const ApiError = require('../../utils/ApiError');
const { getBranchFilter, assertBranchAccess } = require('../../utils/branchScope');

// Peran yang selalu terikat ke satu cabang
const ROLE_CABANG = ['GURU', 'SISWA', 'KEPALA_SEKOLAH'];

// Field aman, tanpa passwordHash
const safeSelect = {
  id: true,
  name: true,
  username: true,
  role: true,
  isActive: true,
  createdAt: true,
  branchId: true,
};

const fullSelect = { ...safeSelect, student: true, teacher: true };

async function createUser(actor, { name, username, password, role, nis, nip, branchId }) {
  // Validasi panjang username & password sesuai dokumentasi
  if (!username || username.length < 3) {
    throw ApiError.badRequest('Username minimal 3 karakter');
  }
  if (!password || password.length < 8) {
    throw ApiError.badRequest('Password minimal 8 karakter');
  }

  // Hak akses pembuatan berdasarkan peran pelaksana (actor)
  if (actor.role === 'ADMIN_SEKOLAH') {
    if (!ROLE_CABANG.includes(role)) {
      throw ApiError.forbidden('Admin sekolah hanya boleh membuat GURU, SISWA, atau KEPALA_SEKOLAH');
    }
    // Dipaksa ke cabang sendiri
    branchId = actor.branchId;
  } else if (role === 'ADMIN') {
    branchId = null;
  } else if (role === 'ADMIN_SEKOLAH' || ROLE_CABANG.includes(role)) {
    if (!branchId) {
      throw ApiError.badRequest('branchId wajib diisi untuk peran ini');
    }
  }

  // Validasi wajib NIS untuk Siswa
  if (role === 'SISWA' && !nis) {
    throw ApiError.badRequest('nis wajib diisi untuk peran SISWA');
  }

  // Cek apakah username sudah digunakan (Harus 409 sesuai spesifikasi)
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw ApiError.conflict('Username sudah digunakan');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userData = {
    name,
    username,
    passwordHash,
    role,
    branchId: branchId ?? null,
  };

  if (role === 'SISWA') {
    userData.student = { create: { nis } };
  } else if (role === 'GURU' && nip) {
    userData.teacher = { create: { nip } };
  }

  return prisma.user.create({
    data: userData,
    select: fullSelect,
  });
}

async function listUsers(actor, { role, search, branchId, page = 1, limit = 20 }) {
  const take = parseInt(limit, 10);
  const currentPage = parseInt(page, 10);
  const skip = (currentPage - 1) * take;

  const where = {
    ...getBranchFilter(actor, branchId ? Number(branchId) : undefined),
  };

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: fullSelect,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page: currentPage,
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

async function getUser(actor, id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: fullSelect,
  });

  if (!user) {
    throw ApiError.notFound('User tidak ditemukan');
  }

  // Jika beda cabang, assertBranchAccess melempar 404 agar keberadaan data tidak bocor
  assertBranchAccess(actor, user.branchId);

  return user;
}

async function updateUser(actor, id, data) {
  const user = await getUser(actor, id);

  const { password, nis, nip, role, branchId, username, ...rest } = data;
  const updateData = { ...rest };

  // Validasi username unik jika diubah
  if (username && username !== user.username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) throw ApiError.conflict('Username sudah digunakan');
    updateData.username = username;
  }

  // Hanya ADMIN pusat yang boleh mengubah role dan branchId
  if (actor.role === 'ADMIN') {
    if (role !== undefined) updateData.role = role;
    if (branchId !== undefined) updateData.branchId = branchId;
  }

  if (password) {
    if (password.length < 8) throw ApiError.badRequest('Password minimal 8 karakter');
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  // Update relasi NIS / NIP
  if (nis !== undefined && user.role === 'SISWA') {
    updateData.student = { upsert: { create: { nis }, update: { nis } } };
  }
  if (nip !== undefined && user.role === 'GURU') {
    updateData.teacher = { upsert: { create: { nip }, update: { nip } } };
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: fullSelect,
  });
}

async function deactivateUser(actor, id) {
  if (id === actor.id) {
    throw ApiError.badRequest('Tidak dapat menonaktifkan akun sendiri');
  }

  await getUser(actor, id);

  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: safeSelect,
  });
}

async function destroyUser(actor, id) {
  if (id === actor.id) {
    throw ApiError.badRequest('Tidak dapat menghapus akun sendiri');
  }

  await getUser(actor, id);
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2003') {
      throw ApiError.conflict('User masih memiliki data terkait dan tidak dapat dihapus permanen');
    }
    throw error;
  }
}

module.exports = { createUser, listUsers, getUser, updateUser, deactivateUser, destroyUser };