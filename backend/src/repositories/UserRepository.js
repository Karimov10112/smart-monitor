const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email: email.toLowerCase().trim() });
  }

  async findByOAuthId(provider, id) {
    const query = {};
    if (provider === 'google') query.googleId = id;
    if (provider === 'facebook') query.facebookId = id;
    return await this.model.findOne(query);
  }
}

module.exports = new UserRepository();
