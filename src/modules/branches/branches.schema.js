const { z } = require('zod');

const createBranchSchema = z.object({
  name: z.string().trim().min(1, 'Nama cabang wajib diisi'),
  address: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

const updateBranchSchema = createBranchSchema.partial();

module.exports = { createBranchSchema, updateBranchSchema };