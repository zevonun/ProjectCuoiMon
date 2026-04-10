/**
 * Promote an existing admin by email to "highest" permissions.
 *
 * Usage (from BE folder):
 *   node scripts/promote-admin.js phuochhhps40071@gmail.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Missing email. Example: node scripts/promote-admin.js admin@gmail.com');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mybeauty';
  await mongoose.connect(uri);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  user.role = 'admin';
  user.permissions = {
    manage_products: true,
    manage_orders: true,
    manage_users: true,
    manage_banners: true,
    manage_categories: true,
    manage_vouchers: true,
    manage_admins: true,
    manage_articles: true,
  };

  await user.save();

  console.log('Promoted admin:', {
    id: String(user._id),
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

