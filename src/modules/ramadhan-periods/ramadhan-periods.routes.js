const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./ramadhan-periods.controller');

const router = express.Router();

const base = z.object({
  hijriYear: z.number().int().min(1440, 'Tahun hijriyah tidak valid'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
const createSchema = base.refine((d) => d.endDate > d.startDate, {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['endDate'],
});
const updateSchema = base.partial();

router.use(authenticate);

router.get('/', controller.list);
router.get('/check', controller.check);     // harus di atas '/:id'
router.get('/:id', controller.detail);
router.post('/', authorize('ADMIN'), validate(createSchema), controller.create);
router.patch('/:id', authorize('ADMIN'), validate(updateSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;