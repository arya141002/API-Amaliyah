const express = require('express');
const ctrl = require('./public.controller');

const router = express.Router();

// Tanpa authenticate: sengaja publik
router.get('/branches', ctrl.branches);
router.get('/classes', ctrl.classes);
router.get('/students', ctrl.students);
router.get('/students/:studentId/form', ctrl.form);
router.put('/students/:studentId/entries/:date', ctrl.save);
router.get('/students/:studentId/history', ctrl.history);

module.exports = router;