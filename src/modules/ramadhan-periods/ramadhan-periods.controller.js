const asyncHandler = require('../../utils/asyncHandler');
const { crudController } = require('../../utils/crudController');
const service = require('./ramadhan-periods.service');

module.exports = {
  ...crudController(service, 'Periode Ramadhan'),
  check: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.check(req.query.date) });
  }),
};