const asyncHandler = require('../../utils/asyncHandler');
const usersService = require('./users.service');

const create = asyncHandler(async (req, res) => {
  const data = await usersService.createUser(req.user, req.body);
  res.status(201).json({ success: true, message: 'User berhasil dibuat', data });
});

const list = asyncHandler(async (req, res) => {
  const { role, search, branchId } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const data = await usersService.listUsers(req.user, { role, search, branchId, page, limit });
  res.json({ success: true, data });
});

const detail = asyncHandler(async (req, res) => {
  const data = await usersService.getUser(req.user, req.params.id);
  res.json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const data = await usersService.updateUser(req.user, req.params.id, req.body);
  res.json({ success: true, message: 'User berhasil diubah', data });
});

const deactivate = asyncHandler(async (req, res) => {
  await usersService.deactivateUser(req.user, req.params.id);
  res.json({ success: true, message: 'User dinonaktifkan' });
});

module.exports = { create, list, detail, update, deactivate };