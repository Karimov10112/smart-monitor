const bloodSugarRepository = require('../repositories/BloodSugarRepository');

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const addRecord = async (req, res) => {
  try {
    const record = await bloodSugarRepository.create({ ...req.body, user: req.user._id });

    // ── Avtomatik shifokorga ogohlantirish (≥ 14 yoki ≤ 3.0 mmol/l) ──────────────
    const level = parseFloat(record.fastingLevel || record.postMealLevel || record.level || 0);
    if (!isNaN(level) && (level >= 14 || (level <= 3.0 && level > 0))) {
      try {
        const patient = await User.findById(req.user._id).select('firstName lastName assignedDoctor');
        const io = req.app.get('io');
        if (patient && patient.assignedDoctor && io) {
          const alertType = level >= 14 ? 'CRITICAL_HIGH' : 'CRITICAL_LOW';
          const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Bemor';
          
          io.to(patient.assignedDoctor.toString()).emit('doctor-alert', {
            type: alertType,
            patientId: req.user._id,
            patientName,
            sugarLevel: level,
            message: `🚨 Bemor ${patientName} kritik qand darajasini saqladi: ${level} mmol/l!`,
            timestamp: new Date().toISOString(),
          });

          await AuditLog.create({
            user: req.user._id,
            action: 'AGENT_DOCTOR_ALERT',
            details: {
              sugarLevel: level,
              alertType,
              doctorId: patient.assignedDoctor,
              source: 'JOURNAL_AUTO_ALERT',
            },
          });
          console.log(`🚨 Auto-alert sent to doctor ${patient.assignedDoctor} for sugar level ${level}`);
        }
      } catch (alertErr) {
        console.error('Auto doctor alert error:', alertErr.message);
      }
    }

    res.status(201).json({ success: true, record });
  } catch (err) {
    console.error('addRecord error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const getMyRecords = async (req, res) => {
  try {
    const { page = 1, limit = 30, from, to } = req.query;
    const query = { user: req.user._id };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const records = await bloodSugarRepository.find(query, {
      sort: { date: -1 },
      skip: (page - 1) * limit,
      limit: Number(limit)
    });

    const total = await bloodSugarRepository.countDocuments(query);
    res.json({ success: true, records, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const record = await bloodSugarRepository.updateOne(
      { _id: req.params.id, user: req.user._id },
      req.body
    );
    if (!record) return res.status(404).json({ success: false, message: 'Topilmadi' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const deleted = await bloodSugarRepository.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Yozuv topilmadi' });
    res.json({ success: true, message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await bloodSugarRepository.getStatsByUserId(req.user._id);
    res.json({ success: true, stats: stats[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

module.exports = { addRecord, getMyRecords, updateRecord, deleteRecord, getStats };
