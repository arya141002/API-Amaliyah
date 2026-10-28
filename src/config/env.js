require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET belum diisi di .env');
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};