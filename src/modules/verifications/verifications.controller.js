const asyncHandler = require('../../utils/asyncHandler');
const service = require('./verifications.service');

const list = asyncHandler(async (req, res) => {
  const { classId, date, from, to } = req.query;
  const data = await service.listEntries(req.user, { classId, date, from, to });
  res.json({ success: true, data });
});

const detail = asyncHandler(async (req, res) => {
  const data = await service.getEntry(req.user, Number(req.params.entryId));
  res.json({ success: true, data });
});

const verify = asyncHandler(async (req, res) => {
  const data = await service.verifyEntry(req.user, Number(req.params.entryId), req.body);
  res.json({ success: true, message: 'Verifikasi disimpan', data });
});

const remove = asyncHandler(async (req, res) => {
  await service.removeVerification(req.user, Number(req.params.entryId));
  res.json({ success: true, message: 'Verifikasi dihapus' });
});

module.exports = { list, detail, verify, remove };