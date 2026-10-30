const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./classes.controller');

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  gradeLevel: z.number().int().min(1).max(12).optional(),
  homeroomTeacherId: z.number().int().nullable().optional(),
  branchId: z.number().int().positive('branchId tidak valid'),
});
const updateSchema = createSchema.partial();
const assignSchema = z.object({
  studentIds: z.array(z.number().int()).min(1, 'Pilih minimal satu siswa'),
});

router.use(authenticate);

router.get('/', authorize('ADMIN', 'ADMIN_SEKOLAH', 'GURU', 'KEPALA_SEKOLAH'), controller.list);
router.get('/:id', authorize('ADMIN', 'ADMIN_SEKOLAH', 'GURU', 'KEPALA_SEKOLAH'), controller.detail);
router.post('/', authorize('ADMIN', 'ADMIN_SEKOLAH'), validate(createSchema), controller.create);
router.patch('/:id', authorize('ADMIN', 'ADMIN_SEKOLAH'), validate(updateSchema), controller.update);
router.delete('/:id', authorize('ADMIN', 'ADMIN_SEKOLAH'), controller.remove);
router.post('/:id/students', authorize('ADMIN', 'ADMIN_SEKOLAH'), validate(assignSchema), controller.assignStudents);

module.exports = router;