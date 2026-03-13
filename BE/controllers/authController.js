const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const LoginLog = require('../models/loginLog');
const TokenBlacklist = require('../models/tokenBlacklist');

// ✅ Đọc secrets từ .env – KHÔNG hardcode
const ACCESS_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET chưa được cấu hình trong .env') })();
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (() => { throw new Error('JWT_REFRESH_SECRET chưa được cấu hình trong .env') })();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      await LoginLog.create({ email, ip, userAgent, status: 'fail' });
      return res.status(400).json({ message: 'Sai email' });
    }

    // User đăng ký qua Google không có password
    if (!user.password) {
      await LoginLog.create({ user: user._id, email, ip, userAgent, status: 'fail' });
      return res.status(400).json({ message: 'Tài khoản này đăng nhập bằng Google. Vui lòng dùng Google Login.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await LoginLog.create({ user: user._id, email, ip, userAgent, status: 'fail' });
      return res.status(400).json({ message: 'Sai mật khẩu' });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      ACCESS_SECRET,
      { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    await LoginLog.create({ user: user._id, email, ip, userAgent, status: 'success' });

    // ✅ Loại bỏ password và refreshToken khỏi response
    const { password: _, refreshToken: __, ...userSafe } = user.toObject();

    res.json({ user: userSafe, accessToken, refreshToken });
  } catch (err) {
    console.error('❌ login error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(204);

    const decoded = jwt.decode(token);
    if (!decoded) return res.sendStatus(204);

    await TokenBlacklist.create({
      token,
      expiredAt: new Date(decoded.exp * 1000)
    });

    res.json({ message: 'Đã đăng xuất an toàn' });
  } catch (err) {
    console.error('❌ logout error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};