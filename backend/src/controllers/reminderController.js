const reminderRepository = require('../repositories/ReminderRepository');
const { notifyReminderCreated } = require('../services/telegramService');
const { initialLastSentDate } = require('../services/reminderScheduler');

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Get all reminders for a user
const getReminders = async (req, res) => {
  try {
    const reminders = await reminderRepository.find({ user: req.user._id }, { sort: { time: 1 } });
    res.json({ success: true, reminders });
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Add a new reminder
const addReminder = async (req, res) => {
  try {
    const { type, name, dose, time, repeatDaily, notes } = req.body;
    
    if (!type || !name || !dose || !time) {
      return res.status(400).json({ success: false, message: 'Barcha majburiy maydonlarni to\'ldiring' });
    }
    if (!TIME_RE.test(time)) {
      return res.status(400).json({ success: false, message: 'Vaqt HH:mm formatida bo\'lishi kerak' });
    }

    const reminder = await reminderRepository.create({
      user: req.user._id,
      type,
      name,
      dose,
      time,
      repeatDaily,
      notes,
      // Vaqti bugun o'tib ketgan bo'lsa, birinchi eslatma ertaga keladi
      lastSentDate: initialLastSentDate(time),
    });

    // Foydalanuvchiga Telegram orqali ham darhol tasdiq yuborish
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      if (user && user.telegramChatId) {
        notifyReminderCreated(user, reminder).catch(e => console.error('TG notify error:', e));
      }
    } catch (e) {
      console.error('Error sending reminder creation notification:', e);
    }

    res.status(201).json({ success: true, reminder });
  } catch (err) {
    console.error('Add reminder error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Update a reminder
const updateReminder = async (req, res) => {
  try {
    const { type, name, dose, time, repeatDaily, notes, isActive } = req.body;
    
    const update = { type, name, dose, time, repeatDaily, notes, isActive };
    if (time !== undefined) {
      if (!TIME_RE.test(time)) {
        return res.status(400).json({ success: false, message: 'Vaqt HH:mm formatida bo\'lishi kerak' });
      }
      // Vaqt o'zgarsa: bugun hali kelmagan bo'lsa bugun yuboriladi, o'tib ketgan bo'lsa ertadan
      update.lastSentDate = initialLastSentDate(time);
    }

    const reminder = await reminderRepository.updateOne(
      { _id: req.params.id, user: req.user._id },
      update
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Eslatma topilmadi' });
    }

    res.json({ success: true, reminder });
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// Delete a reminder
const deleteReminder = async (req, res) => {
  try {
    const reminder = await reminderRepository.deleteOne({ _id: req.params.id, user: req.user._id });
    
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Eslatma topilmadi' });
    }

    res.json({ success: true, message: 'Eslatma o\'chirildi' });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

module.exports = {
  getReminders,
  addReminder,
  updateReminder,
  deleteReminder,
};
