const prisma = require('../../lib/prisma');
const ApiError = require('../../utils/ApiError');

async function list() {
  return prisma.ramadhanPeriod.findMany({ orderBy: { hijriYear: 'desc' } });
}

async function getById(id) {
  const period = await prisma.ramadhanPeriod.findUnique({ where: { id } });
  if (!period) throw ApiError.notFound('Periode Ramadhan tidak ditemukan');
  return period;
}

async function create(data) {
  return prisma.ramadhanPeriod.create({ data });
}

async function update(id, data) {
  const current = await getById(id);
  const start = data.startDate ?? current.startDate;
  const end = data.endDate ?? current.endDate;
  if (end <= start) throw ApiError.badRequest('Tanggal selesai harus setelah tanggal mulai');
  return prisma.ramadhanPeriod.update({ where: { id }, data });
}

async function remove(id) {
  await getById(id);
  await prisma.ramadhanPeriod.delete({ where: { id } });
}

// Dipakai juga oleh modul form siswa nanti
async function findByDate(date) {
  return prisma.ramadhanPeriod.findFirst({
    where: { startDate: { lte: date }, endDate: { gte: date } },
  });
}

async function check(dateString) {
  // tanpa parameter = hari ini menurut waktu Jakarta
  const text = dateString || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  const date = new Date(text); // "2027-02-20" → tengah malam UTC, cocok dengan kolom @db.Date
  if (isNaN(date)) throw ApiError.badRequest('Format tanggal harus YYYY-MM-DD');

  const period = await findByDate(date);
  return { date: text, isRamadhan: Boolean(period), period };
}

module.exports = { list, getById, create, update, remove, findByDate, check };