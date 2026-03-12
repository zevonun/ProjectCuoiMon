// routes/api/otp.js
const express = require('express');
const router  = express.Router();
const rateLimit = require('express-rate-limit');

const {
  sendOtp,
  verifyOtp,
  resendOtp
} = require('../../controllers/otpController');

// ── Rate limiter riêng cho OTP (chặt hơn apiLimiter toàn app) ──
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 phút
  max: 5,                      // tối đa 5 request gửi OTP trong 15 phút
  message: { error: 'Quá nhiều yêu cầu gửi OTP. Thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                     // tối đa 10 lần verify trong 15 phút
  message: { error: 'Quá nhiều yêu cầu xác thực. Thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ── Routes ──
router.post('/send',   otpSendLimiter,   sendOtp);      // gửi OTP
router.post('/verify', otpVerifyLimiter, verifyOtp);     // xác thực OTP
router.post('/resend', otpSendLimiter,   resendOtp);     // gửi lại OTP

module.exports = router;
