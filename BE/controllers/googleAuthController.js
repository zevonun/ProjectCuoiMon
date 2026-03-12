// controllers/googleAuthController.js
const User = require('../models/user');
const jwt  = require('jsonwebtoken');
const LoginLog = require('../models/loginLog');

const ACCESS_SECRET  = process.env.JWT_SECRET         || 'shhhhh';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_very_long_refresh_secret_here';

const signAccessToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  ACCESS_SECRET,
  { expiresIn: '24h' }
);

const signRefreshToken = (user) => jwt.sign(
  { id: user._id },
  REFRESH_SECRET,
  { expiresIn: '7d' }
);

/**
 * POST /api/users/google-login
 * Body: { googleId, email, name, picture }
 *
 * Logic:
 *  1. Tìm user theo email
 *     - Nếu có → cập nhật googleId (nếu chưa có), trả JWT
 *     - Nếu không có → tạo user mới với googleId, password = null (login bằng Google không cần password)
 *  2. Log login
 *  3. Trả { user, token, refreshToken }
 */
exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Thiếu thông tin Google' });
    }

    const ip        = req.ip;
    const userAgent = req.headers['user-agent'];

    // ── Tìm user theo email ──
    let user = await User.findOne({ email });

    if (user) {
      // ── User đã tồn tại → cập nhật googleId nếu chưa có ──
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // ── Tạo user mới từ Google (không có password) ──
      user = await User.create({
        name,
        email,
        password:  null,          // không có password – login chỉ bằng Google
        googleId,
        role:      'user',
      });
    }

    // ── Cấp tokens ──
    const token        = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // ── Log ──
    await LoginLog.create({
      user:      user._id,
      email,
      ip,
      userAgent,
      status:    'success',
      method:    'google',         // phân biệt login method
    });

    // ── Response (bỏ password) ──
    const { password: _, ...userSafe } = user.toObject();

    return res.status(200).json({
      message: 'Đăng nhập bằng Google thành công',
      user:    userSafe,
      token,
      refreshToken,
    });

  } catch (err) {
    console.error('❌ googleLogin error:', err);
    return res.status(500).json({ error: 'Lỗi server khi đăng nhập Google' });
  }
};
