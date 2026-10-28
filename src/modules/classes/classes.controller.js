const asyncHandler = require('../../utils/asyncHandler');
const { crudController, parseId } = require('../../utils/crudController');
const service = require('./classes.service');

module.exports = {
  ...crudController(service, 'Kelas'),
  assignStudents: asyncHandler(async (req, res) => {
    const data = await service.assignStudents(parseId(req.params.id), req.body.studentIds);
    res.json({ success: true, message: 'Siswa dimasukkan ke kelas', data });
  }),
};