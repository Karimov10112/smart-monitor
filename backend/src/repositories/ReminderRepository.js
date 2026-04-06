const BaseRepository = require('./BaseRepository');
const Reminder = require('../models/Reminder');

class ReminderRepository extends BaseRepository {
  constructor() {
    super(Reminder);
  }

  async findByUser(userId, options = {}) {
    return await this.find({ user: userId }, options);
  }
}

module.exports = new ReminderRepository();
