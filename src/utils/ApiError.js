class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
  static badRequest(msg, details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = 'Tidak terautentikasi') { return new ApiError(401, msg); }
  static forbidden(msg = 'Anda tidak punya akses') { return new ApiError(403, msg); }
  static notFound(msg = 'Data tidak ditemukan') { return new ApiError(404, msg); }
  static conflict(msg) { return new ApiError(409, msg); }
}
module.exports = ApiError;