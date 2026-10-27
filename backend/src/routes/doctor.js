const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, requireRole } = require('../middleware/auth');

// Bemor o'z shifokorini kod orqali biriktirishi mumkin
router.post('/connect', protect, doctorController.connectDoctorByCode);

// Shifokor o'z kodini ko'rishi mumkin
router.get('/my-code', protect, requireRole('doctor', 'superadmin', 'admin'), doctorController.getMyDoctorCode);

// Faqat shifokorlar (doctor) va superadminlar bemorlarni boshqara oladi
router.use(protect);
router.use(requireRole('doctor', 'superadmin', 'admin'));

router.get('/patients', doctorController.getPatients);
router.get('/patients/:id/records', doctorController.getPatientRecords);
router.patch('/patients/:id/notes', doctorController.addNote);

module.exports = router;
