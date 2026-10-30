const asyncHandler = require('../../utils/asyncHandler');
const { parseId } = require('../../utils/crudController');
const service = require('./classes.service');

module.exports = {
  list: asyncHandler(async (req, res) => res.json({ success: true, data: await service.list(req.user) })),
  detail: asyncHandler(async (req, res) => res.json({ success: true, data: await service.getById(parseId(req.params.id), req.user) })),
  create: asyncHandler(async (req, res) => res.status(201).json({ success: true, message: 'Kelas berhasil dibuat', data: await service.create(req.user, req.body) })),
  update: asyncHandler(async (req, res) => res.json({ success: true, message: 'Kelas berhasil diubah', data: await service.update(req.user, parseId(req.params.id), req.body) })),
  remove: asyncHandler(async (req, res) => { await service.remove(parseId(req.params.id)); res.json({ success: true, message: 'Kelas berhasil dihapus' }); }),
  assignStudents: asyncHandler(async (req, res) => {
    const data = await service.assignStudents(parseId(req.params.id), req.body.studentIds);
    res.json({ success: true, message: 'Siswa dimasukkan ke kelas', data });
  }),
};