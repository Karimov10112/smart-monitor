const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.get('/', protect, reminderController.getReminders);
router.post('/', protect, reminderController.addReminder);
router.put('/:id', protect, reminderController.updateReminder);
router.delete('/:id', protect, reminderController.deleteReminder);

module.exports = router;
