const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const service = require('./reports.service');

const semester = asyncHandler(async (req, res) => {
  const semesterId = Number(req.query.semesterId);
  if (!Number.isInteger(semesterId) || semesterId <= 0) {
    throw ApiError.badRequest('semesterId wajib diisi');
  }
  const classId = req.query.classId ? Number(req.query.classId) : undefined;

  const data = await service.semesterRecap(req.user, { semesterId, classId });
  res.json({ success: true, data });
});

module.exports = { semester };