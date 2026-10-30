const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { jwtSecret } = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * Middleware untuk memastikan request membawa token JWT yang valid
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // 1. Ambil header authorization dan pisahkan dengan ' '
  const authHeader = req.headers.authorization;
  
  // 2. Cek apakah formatnya Bearer dan token tersedia
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw ApiError.unauthorized('Token tidak ditemukan');
  }

  // 3. Verifikasi token dengan try/catch
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (error) {
    throw ApiError.unauthorized('Token tidak valid atau sudah kedaluwarsa');
  }

  // 4. Ambil user dari database pakai payload.sub (tanpa passwordHash)
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      username: true,
      branchId: true,
      role: true,
      isActive: true,
    },
  });

  // 5. Kalau user tidak ada atau isActive false, lempar 401 (Unauthorized)
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Akun tidak ditemukan atau sudah dinonaktifkan');
  }

  // 6. Simpan data user ke req.user, lalu lanjutkan ke middleware/controller berikutnya
  req.user = user;
  next();
});

/**
 * Middleware tambahan untuk membatasi akses berdasarkan role (Fungsi kedua)
 * @param {...string} allowedRoles Daftar role yang diizinkan (misal: 'ADMIN')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Unauthorized');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('Anda tidak memiliki izin untuk mengakses sumber daya ini');
    }

    next();
  };
};

module.exports = { authenticate, authorize };