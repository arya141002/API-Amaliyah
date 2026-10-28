const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
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
  if (actor.role === 'ADMIN_SEKOLAH') {
    if (!ROLE_CABANG.includes(role)) {
      throw ApiError.forbidden('Admin sekolah hanya boleh membuat guru, siswa, atau kepala sekolah');
    }
    // Admin sekolah selalu membuat user di cabangnya sendiri, apa pun isi body
    branchId = actor.branchId;
  } else if (role === 'ADMIN') {
    // Admin pusat tidak terikat cabang
    branchId = null;
  } else if (role === 'ADMIN_SEKOLAH' || ROLE_CABANG.includes(role)) {
    if (!branchId) {
      throw ApiError.badRequest('branchId wajib diisi untuk peran ini');
    }
  }

  // Cek apakah username sudah digunakan
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw ApiError.badRequest('Username sudah terdaftar');
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
  } else if (role === 'GURU') {
    userData.teacher = { create: { nip } };
  }

  return prisma.user.create({
    data: userData,
    select: fullSelect,
  });
}

async function listUsers(actor, { role, search, branchId, page = 1, limit = 10 }) {
  const take = parseInt(limit, 10);
  const currentPage = parseInt(page, 10);
  const skip = (currentPage - 1) * take;

  // Admin sekolah otomatis hanya melihat cabangnya sendiri
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
      totalPages: Math.ceil(total / take),
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

  // Kalau bukan milik cabangnya, balas 404 seolah tidak ada
  assertBranchAccess(actor, user.branchId);

  return user;
}

async function updateUser(actor, id, data) {
  // Pastikan user ada dan boleh diakses
  const user = await getUser(actor, id);

  const { password, nis, nip, role, branchId, ...rest } = data;
  const updateData = { ...rest };

  // Hanya admin pusat yang boleh mengubah peran dan cabang
  if (actor.role === 'ADMIN') {
    if (role !== undefined) updateData.role = role;
    if (branchId !== undefined) updateData.branchId = branchId;
  }

  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  // NIS hanya relevan untuk siswa, NIP hanya untuk guru
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
    throw ApiError.badRequest('Anda tidak dapat menonaktifkan akun sendiri');
  }

  // Pastikan user ada dan boleh diakses
  await getUser(actor, id);

  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: safeSelect,
  });
}

module.exports = { createUser, listUsers, getUser, updateUser, deactivateUser };