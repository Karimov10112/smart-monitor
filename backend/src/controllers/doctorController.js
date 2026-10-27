const userRepository = require('../repositories/UserRepository');
const bloodSugarRepository = require('../repositories/BloodSugarRepository');

// @desc    Get patients for a doctor
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
exports.getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Filter users specifically assigned to this doctor
    let query = { role: 'user', assignedDoctor: req.user._id };
    
    if (search) {
      query.$and = [
        { role: 'user', assignedDoctor: req.user._id },
        {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.role;
      delete query.assignedDoctor;
    }

    const patients = await userRepository.find(query, {
      select: '-password',
      sort: { createdAt: -1 }
    });

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
    const records = await bloodSugarRepository.find({ user: req.params.id }, {
      sort: { date: -1 }
    });
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
    const patient = await userRepository.findByIdAndUpdate(
      req.params.id,
      { doctorNotes: notes }
    );
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    res.json({ success: true, message: 'Eslatma saqlandi', doctorNotes: patient.doctorNotes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// @desc    Connect patient to doctor by doctorCode
// @route   POST /api/doctor/connect
// @access  Private (Patient / User)
exports.connectDoctorByCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Shifokor kodi kiritilmadi' });
    }

    const cleanCode = code.trim().toUpperCase();
    const doctor = await userRepository.findOne({
      role: { $in: ['doctor', 'superadmin', 'admin'] },
      doctorCode: cleanCode
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Bunday kodli shifokor topilmadi. Kodni qayta tekshiring.' });
    }

    const doctorFullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || doctor.email;

    // Update patient
    const updatedUser = await userRepository.findByIdAndUpdate(
      req.user._id,
      {
        assignedDoctor: doctor._id,
        doctorName: doctorFullName
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Shifokor ${doctorFullName} muvaffaqiyatli biriktirildi!`,
      doctor: {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        doctorCode: doctor.doctorCode,
      },
      user: updatedUser.toSafeObject ? updatedUser.toSafeObject() : updatedUser
    });
  } catch (err) {
    console.error('Connect doctor error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

// @desc    Get or generate doctor's unique code
// @route   GET /api/doctor/my-code
// @access  Private (Doctor / Admin)
exports.getMyDoctorCode = async (req, res) => {
  try {
    let doctor = await userRepository.findById(req.user._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Topilmadi' });
    }

    if (!doctor.doctorCode) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      doctor.doctorCode = `DOC-${randomDigits}`;
      await doctor.save();
    }

    res.json({
      success: true,
      doctorCode: doctor.doctorCode,
      firstName: doctor.firstName,
      lastName: doctor.lastName
    });
  } catch (err) {
    console.error('Get doctor code error:', err);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};
