// models/otp.js
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema(
  {
    email:     { type: String, required: true, index: true },
    otp:       { type: String, required: true },               // hashed OTP
    purpose:   { type: String, enum: ['login', 'register', 'reset-password'], required: true },
    attempts:  { type: Number, default: 0 },                   // số lần nhập sai
    isUsed:    { type: Boolean, default: false }
  },
  {
    timestamps: true,
    // ✅ TTL index – MongoDB tự xóa document sau 10 phút
    expireAfterSeconds: 600
  }
);

// Unique compound: 1 email chỉ có 1 OTP chưa dùng cho 1 purpose tại 1 thời điểm
OtpSchema.index({ email: 1, purpose: 1, isUsed: 1 });

module.exports = mongoose.model('Otp', OtpSchema);
