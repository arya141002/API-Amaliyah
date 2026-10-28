const ApiError = require('./ApiError');

function getBranchFilter(user, requestedBranchId) {
  if (user.role === 'ADMIN') {
    return requestedBranchId ? { branchId: requestedBranchId } : {};
  }
  if (user.role === 'ADMIN_SEKOLAH') {
    if (!user.branchId) {
      throw new ApiError(403, 'Akun admin sekolah belum terhubung ke cabang');
    }
    return { branchId: user.branchId };
  }
  throw new ApiError(403, 'Tidak punya akses');
}

function assertBranchAccess(user, recordBranchId) {
  if (user.role === 'ADMIN') return;
  if (user.role === 'ADMIN_SEKOLAH' && recordBranchId === user.branchId) return;
  throw new ApiError(404, 'Data tidak ditemukan');
}

module.exports = { getBranchFilter, assertBranchAccess };