const asyncHandler = require('./asyncHandler');
const ApiError = require('./ApiError');

// id master data bertipe Int, beda dengan user yang UUID
const parseId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id)) throw ApiError.badRequest('ID tidak valid');
  return id;
};

const crudController = (service, label) => ({
  list: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.list(req.query) });
  }),
  detail: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.getById(parseId(req.params.id)) });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, message: `${label} berhasil dibuat`, data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await service.update(parseId(req.params.id), req.body);
    res.json({ success: true, message: `${label} berhasil diubah`, data });
  }),
  remove: asyncHandler(async (req, res) => {
    await service.remove(parseId(req.params.id));
    res.json({ success: true, message: `${label} berhasil dihapus` });
  }),
});

module.exports = { crudController, parseId };