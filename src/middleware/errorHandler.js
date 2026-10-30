const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, res, next) =>
  next(ApiError.notFound(`Rute ${req.method} ${req.originalUrl} tidak ada`));

const errorHandler = (err, req, res, next) => {
  if (err.code === 'P2002') err = ApiError.conflict('Data sudah ada (duplikat)');
  if (err.code === 'P2003') {
    err = ApiError.conflict('Data terhubung dengan data lain (rujukan tidak ada atau masih dipakai)');
  }
  if (err.code === '23503' || err.code === '23001') {
    err = ApiError.conflict('Data masih digunakan oleh data lain dan tidak dapat dihapus permanen');
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: err.message,
    errors: err.details || undefined,
  });
};

module.exports = { notFoundHandler, errorHandler };