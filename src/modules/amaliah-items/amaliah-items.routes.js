const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./amaliah-items.controller');

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(1, 'Nama item wajib diisi'),
  category: z.string().optional(),
  inputType: z.enum(['CHECKLIST', 'NUMBER', 'TEXT']).default('CHECKLIST'),
  unit: z.string().optional(),
  isRamadhan: z.boolean().default(false),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().default(0),
  branchId: z.number().int().positive('branchId tidak valid').optional(),
});
const updateSchema = createSchema.partial();

const importSchema = z.object({
  branchId: z.number().int().positive('branchId tidak valid').optional(),
});

const ADMINS = ['ADMIN', 'ADMIN_SEKOLAH'];

router.use(authenticate);

// Baca: semua user yang login, isi datanya dibatasi di service
router.get('/', controller.list);
router.get('/:id', controller.detail);

// Tulis: admin pusat dan admin sekolah
// /import-template ditaruh sebelum /:id agar tidak tertukar
router.post('/import-template', authorize(...ADMINS), validate(importSchema), controller.importTemplate);
router.post('/', authorize(...ADMINS), validate(createSchema), controller.create);
router.patch('/:id', authorize(...ADMINS), validate(updateSchema), controller.update);
router.delete('/:id', authorize(...ADMINS), controller.deactivate);

module.exports = router;