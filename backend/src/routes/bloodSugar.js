const express = require('express');
const router = express.Router();
const { addRecord, getMyRecords, updateRecord, deleteRecord, getStats, getRiskAssessment, getAnalytics, analyzeProfile } = require('../controllers/bloodSugarController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyRecords);
router.post('/', addRecord);
router.get('/stats', getStats);
router.get('/risk-assessment', getRiskAssessment);
router.get('/analytics', getAnalytics);
router.post('/glycemic-profile/analyze', analyzeProfile);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
