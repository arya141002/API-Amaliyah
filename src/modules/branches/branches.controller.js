const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const service = require('./branches.service');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'ID tidak valid');
  }
  return id;
}

const list = asyncHandler(async (req, res) => {
  const branches = await service.listBranches();
  res.json(branches);
});

const get = asyncHandler(async (req, res) => {
  const branch = await service.getBranch(parseId(req.params.id));
  res.json(branch);
});

const create = asyncHandler(async (req, res) => {
  const branch = await service.createBranch(req.body);
  res.status(201).json(branch);
});

const update = asyncHandler(async (req, res) => {
  const branch = await service.updateBranch(parseId(req.params.id), req.body);
  res.json(branch);
});

const deactivate = asyncHandler(async (req, res) => {
  const branch = await service.deactivateBranch(parseId(req.params.id));
  res.json(branch);
});

module.exports = { list, get, create, update, deactivate };