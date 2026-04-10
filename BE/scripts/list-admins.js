/**
 * List admin accounts (name/email/permissions).
 *
 * Usage (from BE folder):
 *   node scripts/list-admins.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mybeauty';
  await mongoose.connect(uri);

  const admins = await User.find({ role: 'admin' })
    .select('name email permissions createdAt')
    .sort({ createdAt: -1 })
    .lean();

  console.log(`Found ${admins.length} admin(s):`);
  for (const a of admins) {
    console.log({
      name: a.name,
      email: a.email,
      permissions: a.permissions,
      createdAt: a.createdAt,
    });
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

