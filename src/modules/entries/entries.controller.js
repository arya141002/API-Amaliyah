const asyncHandler = require('../../utils/asyncHandler');
const service = require('./entries.service');

const form = asyncHandler(async (req, res) => {
  const data = await service.getForm(req.user.id, req.query.date);
  res.json({ success: true, data });
});

const save = asyncHandler(async (req, res) => {
  const data = await service.saveEntry(req.user.id, req.params.date, req.body);
  res.json({ success: true, message: 'Amaliah berhasil disimpan', data });
});

const list = asyncHandler(async (req, res) => {
  const data = await service.listEntries(req.user.id, req.query);
  res.json({ success: true, data });
});

module.exports = { form, save, list };