const express = require('express');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const { verifySchema } = require('./verifications.schema');
const ctrl = require('./verifications.controller');

const router = express.Router();

router.use(authenticate, authorize('ADMIN', 'ADMIN_SEKOLAH', 'KEPALA_SEKOLAH', 'GURU'));

router.get('/entries', ctrl.list);
router.get('/entries/:entryId', ctrl.detail);
router.put('/entries/:entryId', authorize('GURU'), validate(verifySchema), ctrl.verify);
router.delete('/entries/:entryId', authorize('GURU'), ctrl.remove);

module.exports = router;