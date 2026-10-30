const { Router } = require('express');
const { z } = require('zod');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const controller = require('./auth.controller');

const router = Router();

// Skema Zod untuk validasi input login
const loginSchema = z.object({
  username: z.string().min(1, 'Username tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

// Endpoint POST /login & GET /me
router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.me);

module.exports = router;