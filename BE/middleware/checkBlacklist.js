const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// ==========================
// ✅ BLACKLIST TOKEN MODEL
// ==========================
const BlacklistSchema = new mongoose.Schema({
  token: String,
  exp: Date
});

const TokenBlacklist =
  mongoose.models.TokenBlacklist ||
  mongoose.model('TokenBlacklist', BlacklistSchema);

// ==========================
// ✅ CHECK BLACKLIST MIDDLEWARE
// ==========================
module.exports = async function checkBlacklist(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const blacklisted = await TokenBlacklist.findOne({ token });

    if (blacklisted) {
      return res.status(401).json({
        error: 'Token đã bị vô hiệu hoá, vui lòng đăng nhập lại'
      });
    }

    next();
  } catch (err) {
    console.error('Blacklist error:', err);
    return res.status(500).json({ error: 'Lỗi kiểm tra blacklist' });
  }
};
