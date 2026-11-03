const { z } = require('zod');

const verifySchema = z
  .object({
    status: z.literal('VERIFIED'),
  });

module.exports = { verifySchema };