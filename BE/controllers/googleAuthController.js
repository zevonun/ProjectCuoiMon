// controllers/googleAuthController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const LoginLog = require('../models/loginLog');

const ACCESS_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET chưa cấu hình') })();
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (() => { throw new Error('JWT_REFRESH_SECRET chưa cấu hình') })();

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
 */
exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Thiếu thông tin Google' });
    }

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        password: null,
        googleId,
        role: 'user', // ✅ nhất quán với passport.js
      });
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    await LoginLog.create({ user: user._id, email, ip, userAgent, status: 'success', method: 'google' });

    // ✅ Loại bỏ password và refreshToken khỏi response
    const { password: _, refreshToken: __, ...userSafe } = user.toObject();

    return res.status(200).json({
      message: 'Đăng nhập bằng Google thành công',
      user: userSafe,
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('❌ googleLogin error:', err);
    return res.status(500).json({ error: 'Lỗi server khi đăng nhập Google' });
  }
};