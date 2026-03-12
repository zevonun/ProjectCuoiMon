const rateLimit = require('express-rate-limit');

// ✅ Giới hạn chung cho toàn API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 300, // 300 request / IP / 15 phút
  message: {
    error: 'Quá nhiều request, vui lòng thử lại sau'
  }
});

// ✅ Giới hạn riêng cho LOGIN (chống brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // 5 lần login / 15 phút
  message: {
    error: 'Bạn đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút'
  }
});

module.exports = {
  apiLimiter,
  loginLimiter
};
