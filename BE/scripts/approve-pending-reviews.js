require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/review');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mybeauty');
  const result = await Review.updateMany(
    { status: 'pending' },
    { $set: { status: 'approved' } }
  );
  console.log('updated pending reviews:', result.modifiedCount);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

