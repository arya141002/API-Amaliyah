const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./semesters.controller');

const router = express.Router();

const semesterFields = {
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran: 2026/2027'),
  term: z.enum(['GANJIL', 'GENAP']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  branchId: z.number().int().positive('branchId tidak valid'),
  isActive: z.boolean().optional(),
};
const dateRefinement = (d) => !d.startDate || !d.endDate || d.endDate > d.startDate;
const dateMessage = {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['endDate'],
};
const createSchema = z.object(semesterFields).refine(dateRefinement, dateMessage);
const updateSchema = z.object(semesterFields).partial().refine(dateRefinement, dateMessage);

router.use(authenticate);

router.get('/', controller.list);
router.get('/active', controller.active);   // harus di atas '/:id'
router.get('/:id', controller.detail);
router.post('/', authorize('ADMIN'), validate(createSchema), controller.create);
router.patch('/:id', authorize('ADMIN'), validate(updateSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;