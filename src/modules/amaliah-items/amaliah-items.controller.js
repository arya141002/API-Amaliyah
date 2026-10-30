const asyncHandler = require('../../utils/asyncHandler');
const service = require('./amaliah-items.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.listItems(req.user, req.query);
  res.json({ success: true, data });
});

const detail = asyncHandler(async (req, res) => {
  const data = await service.getItem(req.user, Number(req.params.id));
  res.json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await service.createItem(req.user, req.body);
  res.status(201).json({ success: true, message: 'Item amaliah berhasil dibuat', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await service.updateItem(req.user, Number(req.params.id), req.body);
  res.json({ success: true, message: 'Item amaliah berhasil diubah', data });
});

const deactivate = asyncHandler(async (req, res) => {
  await service.deactivateItem(req.user, Number(req.params.id));
  res.json({ success: true, message: 'Item amaliah dinonaktifkan' });
});

const destroy = asyncHandler(async (req, res) => {
  await service.destroyItem(req.user, Number(req.params.id));
  res.json({ success: true, message: 'Item amaliah dihapus permanen' });
});

const importTemplate = asyncHandler(async (req, res) => {
  const data = await service.importTemplate(req.user, req.body.branchId);
  res.json({ success: true, message: 'Template berhasil disalin', data });
});

module.exports = { list, detail, create, update, deactivate, destroy, importTemplate };