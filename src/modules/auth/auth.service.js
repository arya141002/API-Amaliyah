const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../lib/prisma');
const { jwtSecret, jwtExpiresIn } = require('../../config/env');
const ApiError = require('../../utils/ApiError');

/**
 * Fungsi login untuk autentikasi user
 * @param {string} username 
 * @param {string} password 
 * @returns {Object} Mengembalikan token dan data user (tanpa passwordHash)
 */
async function login(username, password) {
  // 2. Cari user berdasarkan username
  const user = await prisma.user.findUnique({
    where: { username },
  });

  // 3. Kalau user tidak ada, lempar ApiError.unauthorized
  if (!user) {
    throw ApiError.unauthorized('Username atau password salah');
  }

  // 4. Cocokkan password dengan bcrypt.compare
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Username atau password salah');
  }

  // 5. Kalau user.isActive false, lempar ApiError.forbidden
  // Catatan: Pastikan field 'isActive' ada di skema Prisma Anda
  if (user.isActive === false) {
    throw ApiError.forbidden('Akun Anda tidak aktif atau diblokir');
  }

  // 6. Buat token JWT
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  // 7. Kembalikan token dan data user tanpa passwordHash
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  };
}

module.exports = {
  login,
};
