const asyncHandler = require('../../utils/asyncHandler');
const { crudController } = require('../../utils/crudController');
const service = require('./semesters.service');

module.exports = {
  ...crudController(service, 'Semester'),
  active: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.getActive() });
  }),
};