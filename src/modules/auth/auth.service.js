const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const { jwtSecret, jwtExpiresIn } = require('../../config/env');
const ApiError = require('../../utils/ApiError');

/**
 * Fungsi login untuk autentikasi user
 * @param {string} username 
 * @param {string} password 
 * @returns {Object} Mengembalikan token dan data user (tanpa passwordHash)
 */
async function login(username, password) {
  // Cari user berdasarkan username
  const user = await prisma.user.findUnique({
    where: { username },
  });

  // Jika user tidak ditemukan
  if (!user) {
    throw ApiError.unauthorized('Username atau password salah');
  }

  // Cocokkan password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Username atau password salah');
  }

  // Cek apakah akun aktif
  if (user.isActive === false) {
    throw ApiError.forbidden('Akun Anda tidak aktif atau diblokir');
  }

  // Buat token JWT
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  // Kembalikan token dan data user tanpa passwordHash
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