const Reminder = require('../models/Reminder');

// Get all reminders for a user
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ time: 1 });
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

    const reminder = new Reminder({
      user: req.user._id,
      type,
      name,
      dose,
      time,
      repeatDaily,
      notes,
    });

    await reminder.save();
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
    
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { type, name, dose, time, repeatDaily, notes, isActive },
      { new: true }
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
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
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
