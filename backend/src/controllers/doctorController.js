const User = require('../models/User');
const BloodSugar = require('../models/BloodSugar');

// @desc    Get patients for a doctor
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
exports.getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Find users who have this doctor's name or common users if no specific assignment
    // For now, let's allow doctors to see all users who have entered a doctor name or just all users for simplicity
    let query = { role: 'user' };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// @desc    Get specific patient's blood sugar records
// @route   GET /api/doctor/patients/:id/records
// @access  Private (Doctor)
exports.getPatientRecords = async (req, res) => {
  try {
    const records = await BloodSugar.find({ user: req.params.id })
      .sort({ date: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// @desc    Add medical note for a patient
// @route   PATCH /api/doctor/patients/:id/notes
// @access  Private (Doctor)
exports.addNote = async (req, res) => {
  try {
    const { notes } = req.body;
    const patient = await User.findByIdAndUpdate(
      req.params.id,
      { doctorNotes: notes },
      { new: true }
    );
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    res.json({ success: true, message: 'Eslatma saqlandi', doctorNotes: patient.doctorNotes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};
