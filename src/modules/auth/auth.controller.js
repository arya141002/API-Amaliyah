const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');
/**
 * Controller untuk menangani proses login user
 */
const login = asyncHandler(async (req, res) => {
  // Ambil username dan password dari request body
  const { username, password } = req.body;

  // Panggil service login yang sudah dibuat sebelumnya
  const data = await authService.login(username, password);

  // Kirim response sukses beserta data token dan user
  return res.status(200).json({
    success: true,
    message: 'Login berhasil',
    data,
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});


module.exports = {
  login,
  me,
};