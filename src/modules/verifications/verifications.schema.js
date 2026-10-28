const { z } = require('zod');

const verifySchema = z
  .object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    note: z.string().trim().max(500).optional(),
  })
  .refine((d) => d.status !== 'REJECTED' || (d.note && d.note.length > 0), {
    message: 'Catatan wajib diisi jika entri ditolak',
    path: ['note'],
  });

module.exports = { verifySchema };