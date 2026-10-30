const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createBranchSchema, updateBranchSchema } = require('./branches.schema');
const ctrl = require('./branches.controller');

const router = Router();

// Semua endpoint cabang hanya untuk ADMIN pusat
router.use(authenticate, authorize('ADMIN'));

router.get('/', ctrl.list);
router.post('/', validate(createBranchSchema), ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', validate(updateBranchSchema), ctrl.update);
router.delete('/destroy/:id', ctrl.destroy);
router.delete('/:id', ctrl.deactivate);

module.exports = router;