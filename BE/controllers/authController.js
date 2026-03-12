const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const LoginLog = require('../models/loginLog');
const TokenBlacklist = require('../models/tokenBlacklist');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;

  const user = await User.findOne({ email });
  if (!user) {
    await LoginLog.create({ email, ip, userAgent, status: 'fail' });
    return res.status(400).json({ message: 'Sai email' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    await LoginLog.create({ user: user._id, email, ip, userAgent, status: 'fail' });
    return res.status(400).json({ message: 'Sai mật khẩu' });
  }

  const accessToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, 'shhhhh', { expiresIn: '24h' });
  const refreshToken = jwt.sign({ id: user._id }, 'REFRESH_SECRET', { expiresIn: '7d' });

  user.refreshToken = refreshToken;
  await user.save();

  await LoginLog.create({
    user: user._id,
    email,
    ip,
    userAgent,
    status: 'success'
  });

  res.json({ user, accessToken, refreshToken });
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(204);

  const decoded = jwt.decode(token);
  await TokenBlacklist.create({
    token,
    expiredAt: new Date(decoded.exp * 1000)
  });

  res.json({ message: 'Đã đăng xuất an toàn' });
};
