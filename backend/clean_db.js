const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
const Record = mongoose.model('Record', new mongoose.Schema({}, { strict: false }), 'glucoserecords');

async function cleanDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ga ulandi...\n');

    // Step 1: Saqlanadigan emaillar
    const keepEmails = ['karimovazamatjon231@gmail.com'];
    const keepRoles  = ['superadmin'];

    // Step 2: O'chiriladigan foydalanuvchilarni topish
    const usersToDelete = await User.find({
      email: { $nin: keepEmails },
      role:  { $nin: keepRoles }
    }).select('_id email role');

    console.log(`🗑️  O'chiriladigan foydalanuvchilar (${usersToDelete.length} ta):`);
    usersToDelete.forEach(u => console.log(`   - ${u.email || 'noma\'lum'} [${u.role || 'user'}]`));

    const deleteIds = usersToDelete.map(u => u._id);

    // Step 3: O'sha foydalanuvchilarning yozuvlarini o'chirish
    const deletedRecords = await Record.deleteMany({ userId: { $in: deleteIds } });
    console.log(`\n📊 O'chirilgan qon shakar yozuvlari: ${deletedRecords.deletedCount} ta`);

    // Step 4: Foydalanuvchilarni o'chirish
    const deletedUsers = await User.deleteMany({ _id: { $in: deleteIds } });
    console.log(`👥 O'chirilgan foydalanuvchilar: ${deletedUsers.deletedCount} ta`);

    // Step 5: Qolgan 2 ta akkauntning yozuvlarini ham o'chirish
    const remainingUsers = await User.find({}).select('_id email role');
    console.log(`\n🔒 Qolgan foydalanuvchilar (${remainingUsers.length} ta):`);
    remainingUsers.forEach(u => console.log(`   ✔ ${u.email || 'superadmin'} [${u.role}]`));

    const remainingIds = remainingUsers.map(u => u._id);
    const deletedRemainingRecords = await Record.deleteMany({ userId: { $in: remainingIds } });
    console.log(`\n🧹 Qolgan 2 ta akkauntning qon shakar tarixi ham o'chirildi: ${deletedRemainingRecords.deletedCount} ta yozuv`);

    // Step 6: Boshqa kolleksiyalarda ham tozalash (notifications, etc)
    const collections = await mongoose.connection.db.collections();
    for (const col of collections) {
      const name = col.collectionName;
      if (!['users', 'glucoserecords'].includes(name)) {
        try {
          const result = await col.deleteMany({ userId: { $in: [...deleteIds, ...remainingIds] } });
          if (result.deletedCount > 0) {
            console.log(`   🗂️  ${name}: ${result.deletedCount} yozuv o'chirildi`);
          }
        } catch {}
      }
    }

    console.log('\n✅ Baza tozalandi! Boshidan boshlanadi.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Xato:', err.message);
    process.exit(1);
  }
}

cleanDB();
