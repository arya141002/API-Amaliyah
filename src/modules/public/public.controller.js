const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const service = require('./public.service');

function parseId(value, label) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest(`${label} tidak valid`);
  }
  return id;
}

const branches = asyncHandler(async (req, res) => {
  const data = await service.listBranches();
  res.json({ success: true, data });
});

const classes = asyncHandler(async (req, res) => {
  const data = await service.listClasses(parseId(req.query.branchId, 'branchId'));
  res.json({ success: true, data });
});

const students = asyncHandler(async (req, res) => {
  const data = await service.searchStudents({
    classId: parseId(req.query.classId, 'classId'),
    q: req.query.q,
  });
  res.json({ success: true, data });
});

const form = asyncHandler(async (req, res) => {
  const data = await service.getForm(parseId(req.params.studentId, 'studentId'), req.query.date);
  res.json({ success: true, data });
});

const save = asyncHandler(async (req, res) => {
  const { notes, details } = req.body || {};
  if (!Array.isArray(details) || details.length === 0) {
    throw ApiError.badRequest('Isi minimal satu item');
  }
  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 500)) {
    throw ApiError.badRequest('Catatan harus berupa teks, maksimal 500 karakter');
  }

  const data = await service.saveEntry(
    parseId(req.params.studentId, 'studentId'),
    req.params.date,
    { notes, details }
  );
  res.json({ success: true, message: 'Amaliah tersimpan', data });
});

const history = asyncHandler(async (req, res) => {
  const data = await service.history(parseId(req.params.studentId, 'studentId'));
  res.json({ success: true, data });
});

module.exports = { branches, classes, students, form, save, history };