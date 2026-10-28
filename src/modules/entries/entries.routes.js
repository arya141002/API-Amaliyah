const express = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./entries.controller');

const router = express.Router();

const saveSchema = z.object({
  notes: z.string().max(500).optional(),
  details: z
    .array(
      z.object({
        itemId: z.number().int(),
        boolValue: z.boolean().optional(),
        numberValue: z.number().min(0, 'Angka tidak boleh negatif').optional(),
        textValue: z.string().max(500).optional(),
      })
    )
    .min(1, 'Kirim minimal satu isian'),
});

router.use(authenticate, authorize('SISWA'));

router.get('/form', controller.form);          // harus di atas route berparameter
router.get('/', controller.list);
router.put('/:date', validate(saveSchema), controller.save);

module.exports = router;