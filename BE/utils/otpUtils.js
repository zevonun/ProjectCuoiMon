// utils/otpUtils.js
const crypto  = require('crypto');
const bcrypt  = require('bcryptjs');

/**
 * Tạo OTP 6 chữ số (cryptographically secure)
 * @returns {string} – ví dụ "482917"
 */
const generateOtp = () => {
  // random number 0–999999, pad to 6 digits
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
};

/**
 * Hash OTP trước khi lưu vào DB  (giống hash mật khẩu)
 * @param {string} otp – plain text OTP
 * @returns {Promise<string>} – hashed string
 */
const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * So sánh OTP plain text với hash đã lưu
 * @param {string} otp      – người dùng nhập
 * @param {string} hashedOtp – lấy từ DB
 * @returns {Promise<boolean>}
 */
const verifyOtp = async (otp, hashedOtp) => {
  return bcrypt.compare(otp, hashedOtp);
};

module.exports = { generateOtp, hashOtp, verifyOtp };
