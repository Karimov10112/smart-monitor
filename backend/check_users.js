const mongoose = require('mongoose');
require('dotenv').config();

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).select('email role isEmailVerified firstName');
  console.log('Total users:', users.length);
  users.forEach(u => console.log(`- ${u.email} | ${u.role} | verified: ${u.isEmailVerified} | name: ${u.firstName}`));
  process.exit(0);
}
check();
