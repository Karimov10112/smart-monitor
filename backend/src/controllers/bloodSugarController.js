const bloodSugarRepository = require('../repositories/BloodSugarRepository');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

const addRecord = async (req, res) => {
  try {
    const record = await bloodSugarRepository.create({ ...req.body, user: req.user._id });

    // ── Shifokorga avtomatik ogohlantirish mezonlari ─────────────────────────
    // Och qoringa:  ≥ 11.0 mmol/l yoki ≤ 3.5 mmol/l
    // To'q qoringa:  ≥ 14.0 mmol/l yoki ≤ 3.5 mmol/l
    const fasting = parseFloat(record.fastingLevel || 0);
    const postMeal = parseFloat(record.postMealLevel || 0);

    let isCritical = false;
    let criticalLevel = 0;
    let category = '';
    let alertType = 'CRITICAL_HIGH';

    if (fasting > 0) {
      if (fasting >= 11.0) {
        isCritical = true;
        criticalLevel = fasting;
        category = 'fasting';
        alertType = 'CRITICAL_HIGH';
      } else if (fasting <= 3.5) {
        isCritical = true;
        criticalLevel = fasting;
        category = 'fasting';
        alertType = 'CRITICAL_LOW';
      }
    }

    if (!isCritical && postMeal > 0) {
      if (postMeal >= 14.0) {
        isCritical = true;
        criticalLevel = postMeal;
        category = 'post-meal';
        alertType = 'CRITICAL_HIGH';
      } else if (postMeal <= 3.5) {
        isCritical = true;
        criticalLevel = postMeal;
        category = 'post-meal';
        alertType = 'CRITICAL_LOW';
      }
    }

    if (isCritical) {
      try {
        const patient = await User.findById(req.user._id).select('firstName lastName assignedDoctor');
        const io = req.app.get('io');
        if (patient && patient.assignedDoctor) {
          const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Bemor';
          const catLabel = category === 'fasting' ? 'Och qoringa' : 'Ovqatdan keyin (to\'q qoringa)';
          const dangerText = alertType === 'CRITICAL_HIGH' ? 'O\'TA YUQORI' : 'XAVFLI DARAJADA PAST';

          const title = `🚨 Shoshilinch ogohlantirish: ${patientName}`;
          const message = `Qand darajasi: ${criticalLevel} mmol/l (${catLabel}) — ${dangerText}! Zudlik bilan tekshiring.`;

          // 1. Bazada bildirishnomani saqlash (o'qilmaguncha saqlanib turadi)
          const newNotif = await Notification.create({
            recipient: patient.assignedDoctor,
            sender: req.user._id,
            type: alertType,
            title,
            message,
            sugarLevel: criticalLevel,
            category,
            isRead: false,
          });

          // 2. Real-time socket orqali shifokorga yetkazish
          if (io) {
            io.to(patient.assignedDoctor.toString()).emit('doctor-alert', {
              _id: newNotif._id,
              type: alertType,
              patientId: req.user._id,
              patientName,
              sugarLevel: criticalLevel,
              category,
              message,
              timestamp: newNotif.createdAt,
            });
          }

          // 3. Tizim audit logiga yozish
          await AuditLog.create({
            user: req.user._id,
            action: 'AGENT_DOCTOR_ALERT',
            details: {
              sugarLevel: criticalLevel,
              category,
              alertType,
              doctorId: patient.assignedDoctor,
              source: 'JOURNAL_AUTO_ALERT',
            },
          });
          console.log(`🚨 Auto-alert sent & saved for doctor ${patient.assignedDoctor}: ${criticalLevel} mmol/l (${category})`);
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
