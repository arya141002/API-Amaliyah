const asyncHandler = require('../../utils/asyncHandler');
const service = require('./students.service');

const create = asyncHandler(async (req, res) => {
  const data = await service.createStudent(req.user, req.body);
  res.status(201).json({ success: true, message: 'Siswa berhasil dibuat', data });
});
const list = asyncHandler(async (req, res) => {
  const data = await service.listStudents(req.user, req.query);
  res.json({ success: true, data });
});
const detail = asyncHandler(async (req, res) => {
  const data = await service.getStudent(req.user, Number(req.params.id));
  res.json({ success: true, data });
});
const update = asyncHandler(async (req, res) => {
  const data = await service.updateStudent(req.user, Number(req.params.id), req.body);
  res.json({ success: true, message: 'Siswa berhasil diubah', data });
});
const deactivate = asyncHandler(async (req, res) => {
  await service.deactivateStudent(req.user, Number(req.params.id));
  res.json({ success: true, message: 'Siswa dinonaktifkan' });
});
const destroy = asyncHandler(async (req, res) => {
  await service.destroyStudent(req.user, Number(req.params.id));
  res.json({ success: true, message: 'Siswa dihapus permanen' });
});

module.exports = { create, list, detail, update, deactivate, destroy };
