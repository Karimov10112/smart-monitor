const mongoose = require('mongoose');
const BloodSugar = require('../models/BloodSugar');

const addRecord = async (req, res) => {
  try {
    const record = await BloodSugar.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, record });
  } catch (err) {
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

    const records = await BloodSugar.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await BloodSugar.countDocuments(query);
    res.json({ success: true, records, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const record = await BloodSugar.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Topilmadi' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const deleted = await BloodSugar.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Yozuv topilmadi' });
    res.json({ success: true, message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await BloodSugar.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: null,
          avgFasting: { $avg: '$fastingLevel' },
          maxFasting: { $max: '$fastingLevel' },
          minFasting: { $min: '$fastingLevel' },
          avgPostMeal: { $avg: '$postMealLevel' },
          total: { $sum: 1 },
        },
      },
    ]);
    res.json({ success: true, stats: stats[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

module.exports = { addRecord, getMyRecords, updateRecord, deleteRecord, getStats };
