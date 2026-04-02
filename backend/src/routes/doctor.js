const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, requireRole } = require('../middleware/auth');

// Faqat shifokorlar (doctor) va superadminlar kira oladi
router.use(protect);
router.use(requireRole('doctor', 'superadmin'));

router.get('/patients', doctorController.getPatients);
router.get('/patients/:id/records', doctorController.getPatientRecords);
router.patch('/patients/:id/notes', doctorController.addNote);

module.exports = router;
