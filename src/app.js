const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { authenticate, authorize } = require('./middleware/auth');
const branchesRoutes = require('./modules/branches/branches.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/classes', require('./modules/classes/classes.routes'));
app.use('/api/semesters', require('./modules/semesters/semesters.routes'));
app.use('/api/amaliah-items', require('./modules/amaliah-items/amaliah-items.routes'));
app.use('/api/ramadhan-periods', require('./modules/ramadhan-periods/ramadhan-periods.routes'));
app.use('/api/entries', require('./modules/entries/entries.routes'));
app.use('/api/branches', branchesRoutes);
app.use('/api/verifications', require('./modules/verifications/verifications.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
