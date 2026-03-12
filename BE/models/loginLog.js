const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: String,
  ip: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'fail'], default: 'success' }
}, { timestamps: true });

module.exports = mongoose.model('LoginLog', LoginLogSchema);
