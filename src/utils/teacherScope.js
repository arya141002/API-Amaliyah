const prisma = require('../lib/prisma');
const ApiError = require('./ApiError');

// Mengembalikan id kelas yang diwalikan guru ini
async function getHomeroomClassIds(userId) {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) {
    throw ApiError.forbidden('Akun ini tidak memiliki profil guru');
  }

  const classes = await prisma.class.findMany({
    where: { homeroomTeacherId: teacher.id },
    select: { id: true },
  });
  return classes.map((c) => c.id);
}

module.exports = { getHomeroomClassIds };