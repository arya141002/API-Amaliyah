const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./semesters.controller');

const router = express.Router();

const base = z.object({
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran: 2026/2027'),
  term: z.enum(['GANJIL', 'GENAP']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().optional(),
});
const createSchema = base.refine((d) => d.endDate > d.startDate, {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['endDate'],
});
const updateSchema = base.partial();

router.use(authenticate);

router.get('/', controller.list);
router.get('/active', controller.active);   // harus di atas '/:id'
router.get('/:id', controller.detail);
router.post('/', authorize('ADMIN'), validate(createSchema), controller.create);
router.patch('/:id', authorize('ADMIN'), validate(updateSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;