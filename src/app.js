const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const classesRoutes = require('./modules/classes/classes.routes');
const semestersRoutes = require('./modules/semesters/semesters.routes');
const amaliahItemsRoutes = require('./modules/amaliah-items/amaliah-items.routes');
const ramadhanPeriodsRoutes = require('./modules/ramadhan-periods/ramadhan-periods.routes');
const entriesRoutes = require('./modules/entries/entries.routes');
const branchesRoutes = require('./modules/branches/branches.routes');
const verificationsRoutes = require('./modules/verifications/verifications.routes');
const reportsRoutes = require('./modules/reports/reports.routes');

const app = express();

// Diperlukan agar Express membaca IP / Header dari Vercel Reverse Proxy
app.set('trust proxy', 1);

// 1. Opsi CORS Eksplisit
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Tambahkan domain frontend jika sudah di-deploy
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 2. Pasang CORS SEBELUM Helmet & Middleware Lainnya
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS request untuk semua rute

// 3. Konfigurasi Helmet agar tidak memblokir Cross-Origin Resource
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(
  '/api/public',
  rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }),
  require('./modules/public/public.routes')
);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/semesters', semestersRoutes);
app.use('/api/amaliah-items', amaliahItemsRoutes);
app.use('/api/ramadhan-periods', ramadhanPeriodsRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/verifications', verificationsRoutes);
app.use('/api/reports', reportsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;