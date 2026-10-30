const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./students.controller');

const router = express.Router();
const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  nis: z.string().min(1, 'NIS wajib diisi'),
  branchId: z.number().int().positive().optional(),
  classId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate, authorize('ADMIN', 'ADMIN_SEKOLAH'));
router.post('/', validate(schema), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.detail);
router.patch('/:id', validate(schema.partial()), controller.update);
router.delete('/destroy/:id', controller.destroy);
router.delete('/:id', controller.deactivate);

module.exports = router;
