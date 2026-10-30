const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./users.controller');

const router = express.Router();

const ROLES = ['ADMIN', 'ADMIN_SEKOLAH', 'GURU', 'SISWA', 'KEPALA_SEKOLAH'];

const createUserSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi'),
    username: z.string().min(3, 'Username minimal 3 karakter'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    role: z.enum(ROLES),
    branchId: z.number().int().positive('branchId tidak valid').optional(),
    nis: z.string().optional(),
    nip: z.string().optional(),
  })
  .refine((d) => d.role !== 'SISWA' || d.nis, {
    message: 'NIS wajib diisi untuk siswa',
    path: ['nis'],
  });

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').optional(),
  password: z.string().min(8, 'Password minimal 8 karakter').optional(),
  role: z.enum(ROLES).optional(),
  branchId: z.number().int().positive('branchId tidak valid').nullable().optional(),
  isActive: z.boolean('Status aktif harus berupa boolean').optional(),
  nis: z.string().optional(),
  nip: z.string().optional(),
});

router.use(authenticate, authorize('ADMIN', 'ADMIN_SEKOLAH'));

router.post('/', validate(createUserSchema), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.detail);
router.patch('/:id', validate(updateUserSchema), controller.update);
router.delete('/destroy/:id', controller.destroy);
router.delete('/:id', controller.deactivate);

module.exports = router;