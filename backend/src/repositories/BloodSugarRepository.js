const BaseRepository = require('./BaseRepository');
const BloodSugar = require('../models/BloodSugar');

class BloodSugarRepository extends BaseRepository {
  constructor() {
    super(BloodSugar);
  }

  async findByUser(userId, options = {}) {
    return await this.find({ user: userId }, options);
  }

  async getStatsByUserId(userId) {
    const mongoose = require('mongoose');
    return await this.model.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
  }
}

module.exports = new BloodSugarRepository();
