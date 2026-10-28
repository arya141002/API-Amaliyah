const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./reports.controller');

const router = express.Router();

router.use(authenticate, authorize('ADMIN', 'ADMIN_SEKOLAH', 'KEPALA_SEKOLAH', 'GURU'));

router.get('/semester', ctrl.semester);

module.exports = router;