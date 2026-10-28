const ApiError = require('./ApiError');

// Tanggal hari ini menurut waktu Jakarta, format YYYY-MM-DD
const todayJakarta = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

// "2026-10-27" → Date tengah malam UTC (cocok dengan kolom @db.Date)
const parseDateOnly = (text) => {
  const date = new Date(`${text}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || isNaN(date) || date.toISOString().slice(0, 10) !== text) {
    throw ApiError.badRequest('Format tanggal harus YYYY-MM-DD dan harus tanggal yang valid');
  }
  return date;
};

const toDateString = (date) => date.toISOString().slice(0, 10);

module.exports = { todayJakarta, parseDateOnly, toDateString };