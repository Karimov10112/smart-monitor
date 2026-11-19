const path = require('path');
const { sdk, buildPatientAnalytics, toProfile } = require('../lib/diabets');
const bloodSugarRepository = require('../repositories/BloodSugarRepository');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

const addRecord = async (req, res) => {
  try {
    const record = await bloodSugarRepository.create({ ...req.body, user: req.user._id });

    // ── Shifokorga avtomatik ogohlantirish — @karimov_dev/diabets (evaluateDoctorAlert) ──
    // Och qoringa:  ≥ 11.0 mmol/l yoki ≤ 3.5 mmol/l
    // To'q qoringa:  ≥ 14.0 mmol/l yoki ≤ 3.5 mmol/l
    const reading = {
      fastingLevel: parseFloat(record.fastingLevel) || undefined,
      postMealLevel: parseFloat(record.postMealLevel) || undefined,
    };
    const alert = sdk.evaluateDoctorAlert(reading);
    const glycemicProfile = sdk.needsGlycemicProfile({ ...reading, lang: req.body.lang || 'uz' });
    const isCritical = alert.shouldAlert;
    const criticalLevel = alert.criticalLevel;
    const category = alert.category === 'postMeal' ? 'post-meal' : alert.category;
    const alertType = alert.alertType;

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

          // 2.1. Telegram Bot orqali shifokorga darhol shoshilinch signal yuborish
          try {
            const doctorUser = await User.findById(patient.assignedDoctor);
            if (doctorUser && doctorUser.telegramChatId) {
              const { notifyDoctorCriticalSugar } = require('../services/telegramService');
              await notifyDoctorCriticalSugar(doctorUser, patient, criticalLevel, category, alertType);
            }
          } catch (tgErr) {
            console.error('Telegram doctor alert error:', tgErr);
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

    res.status(201).json({ success: true, record, analysis: { alert: { shouldAlert: alert.shouldAlert, alertType, criticalLevel, category }, glycemicProfile } });
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

const getRiskAssessment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('firstName lastName dateOfBirth gender height weight diabetesType systolicPressure diastolicPressure');
    const records = await bloodSugarRepository.find({ user: req.user._id }, { sort: { date: -1 }, limit: 60 });

    const assessment = sdk.assessFullDiabetesRisk(toProfile(user || {}), records || [], { lang: req.query.lang || 'uz' });
    res.json({ success: true, data: assessment });
  } catch (err) {
    console.error('getRiskAssessment error:', err);
    res.status(500).json({ success: false, message: 'Asoratlar xavfini hisoblashda xatolik yuz berdi' });
  }
};

// GET /api/blood-sugar/analytics — bemorning to'liq tahlili (@karimov_dev/diabets)
const getAnalytics = async (req, res) => {
  try {
    const lang = ['uz', 'ru', 'en'].includes(req.query.lang) ? req.query.lang : 'uz';
    const user = await User.findById(req.user._id).select('firstName lastName dateOfBirth gender height weight diabetesType');
    const records = await bloodSugarRepository.find({ user: req.user._id }, { sort: { date: -1 }, limit: 180 });
    res.json({ success: true, data: buildPatientAnalytics(user, records || [], lang) });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Tahlil qilishda xatolik yuz berdi' });
  }
};

// POST /api/blood-sugar/glycemic-profile/analyze — sutkalik profil natijasini tahlil qilish
const analyzeProfile = async (req, res) => {
  try {
    const lang = ['uz', 'ru', 'en'].includes(req.body.lang) ? req.body.lang : 'uz';
    const user = await User.findById(req.user._id).select('diabetesType');
    const result = sdk.analyzeGlycemicProfile(req.body.measurements || {}, { lang, diabetesType: user && user.diabetesType });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profilni tahlil qilishda xatolik' });
  }
};

module.exports = { addRecord, getMyRecords, updateRecord, deleteRecord, getStats, getRiskAssessment, getAnalytics, analyzeProfile };
