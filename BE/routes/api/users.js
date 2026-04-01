// routes/api/users.js
const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../middleware/authen');
const { loginLimiter } = require('../../middleware/rateLimit');
const TokenBlacklist = require('../../models/tokenBlacklist');
const Otp = require('../../models/otp');
const { sendOtpEmail } = require('../../services/emailService');
const { generateOtp, hashOtp, verifyOtp } = require('../../utils/otpUtils');
const passport = require('passport');

const { googleLogin } = require('../../controllers/googleAuthController');

const ACCESS_SECRET = process.env.JWT_SECRET || 'shhhhh';
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



// ──────────────────────────────────────────────────────────
// POST /api/users/login
// Bước 1: kiểm tra email + password → nếu đúng gửi OTP
// Response: { pending: true, email } → frontend hiển thị form nhập OTP
// ──────────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Sai thông tin đăng nhập' });
    }

    // ── Xóa OTP cũ (nếu còn) và tạo OTP mới ──
    await Otp.deleteMany({ email, purpose: 'login' });

    const plainOtp = generateOtp();
    const hashedOtp = await hashOtp(plainOtp);

    await Otp.create({
      email,
      otp: hashedOtp,
      purpose: 'login',
      attempts: 0,
      isUsed: false
    });

    // ── Gửi OTP về Gmail ──
    await sendOtpEmail({ email, otp: plainOtp, purpose: 'login' });

    // ── Trả về trạng thái "đang chờ OTP" (chưa cấp token) ──
    return res.status(200).json({
      pending: true,
      message: 'OTP đã được gửi về email. Nhập mã OTP để hoàn thành đăng nhập.',
      email
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/users/login/verify-otp
// Bước 2: nhập OTP → nếu đúng cấp JWT
// Body: { email, otp }
// ──────────────────────────────────────────────────────────
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Thiếu email hoặc OTP' });
    }

    // ── Tìm OTP chưa dùng cho login ──
    const otpDoc = await Otp.findOne({ email, purpose: 'login', isUsed: false });
    if (!otpDoc) {
      return res.status(400).json({ error: 'OTP không tìm thấy hoặc đã hết hạn' });
    }

    // ── Kiểm tra số lần thử ──
    if (otpDoc.attempts >= 3) {
      await otpDoc.deleteOne();
      return res.status(400).json({ error: 'Vượt số lần thử. Đăng nhập lại từ đầu.' });
    }

    // ── So sánh OTP ──
    const isMatch = await verifyOtp(otp, otpDoc.otp);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({
        error: `OTP không đúng. Còn ${3 - otpDoc.attempts} lần thử.`
      });
    }

    // ── OTP đúng → đánh dấu đã dùng ──
    otpDoc.isUsed = true;
    await otpDoc.save();

    // ── Cấp JWT ──
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const { password: _, ...userSafe } = user.toObject();

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      user: userSafe,
      token,
      refreshToken
    });
  } catch (err) {
    console.error('login/verify-otp error:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/users/register
// Đăng ký mới → gửi OTP xác thực email
// ──────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // ── Validate ──
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải từ 6 ký tự' });
    }

    // ── Kiểm tra email/phone chưa tồn tại ──
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ error: 'Số điện thoại đã được sử dụng' });
      }
    }

    // ── Gửi OTP xác thực email trước khi tạo tài khoản ──
    await Otp.deleteMany({ email, purpose: 'register' });

    const plainOtp = generateOtp();
    const hashedOtp = await hashOtp(plainOtp);

    await Otp.create({
      email,
      otp: hashedOtp,
      purpose: 'register',
      attempts: 0,
      isUsed: false
    });

    await sendOtpEmail({ email, otp: plainOtp, purpose: 'register' });

    // ── Trả về "pending" – chưa tạo user ──
    return res.status(200).json({
      pending: true,
      message: 'OTP đã được gửi về email. Xác thực để hoàn thành đăng ký.',
      email
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/users/register/verify-otp
// Sau khi OTP đăng ký hợp lệ → thực sự tạo user + cấp JWT
// Body: { name, email, password, phone, address, otp }
// ──────────────────────────────────────────────────────────
router.post('/register/verify-otp', async (req, res) => {
  try {
    const { name, email, password, phone, address, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Thiếu email hoặc OTP' });
    }

    // ── Tìm OTP register chưa dùng ──
    const otpDoc = await Otp.findOne({ email, purpose: 'register', isUsed: false });
    if (!otpDoc) {
      return res.status(400).json({ error: 'OTP không tìm thấy hoặc đã hết hạn' });
    }

    if (otpDoc.attempts >= 3) {
      await otpDoc.deleteOne();
      return res.status(400).json({ error: 'Vượt số lần thử. Yêu cầu OTP mới.' });
    }

    const isMatch = await verifyOtp(otp, otpDoc.otp);
    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({
        error: `OTP không đúng. Còn ${3 - otpDoc.attempts} lần thử.`
      });
    }

    // ── OTP đúng ──
    otpDoc.isUsed = true;
    await otpDoc.save();

    // ── Double-check email chưa tồn tại (race condition safety) ──
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // ── Tạo user ──
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      address: address || undefined,
      role: 'user'
    });

    // ── Cấp JWT ──
    const token = signAccessToken(newUser);
    const refreshToken = signRefreshToken(newUser);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    const { password: _, ...userSafe } = newUser.toObject();

    return res.status(201).json({
      message: 'Đăng ký thành công!',
      user: userSafe,
      token,
      refreshToken
    });
  } catch (err) {
    console.error('register/verify-otp error:', err);
    return res.status(500).json({ error: err.message || 'Lỗi server' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/users/refresh-token   (không đổi)
// ──────────────────────────────────────────────────────────
router.post('/refresh-token', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Thiếu token' });

  const user = await User.findOne({ refreshToken: refresh_token });
  if (!user) return res.status(403).json({ error: 'Token không hợp lệ' });

  try {
    jwt.verify(refresh_token, REFRESH_SECRET);
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const { password: _, ...userSafe } = user.toObject();
    res.json({ user: userSafe, token, refreshToken });
  } catch {
    res.status(403).json({ error: 'Token hết hạn' });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/users/logout   (không đổi)
// ──────────────────────────────────────────────────────────
router.post('/logout', verifyToken, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.decode(token);

  await TokenBlacklist.create({
    token,
    expiredAt: new Date(decoded.exp * 1000)
  });

  await User.updateOne({ _id: req.user.id }, { refreshToken: null });
  res.json({ message: 'Đăng xuất thành công' });
});

// Thêm vào routes/api/users.js (hoặc tạo routes/api/adminAuth.js riêng)

// ──────────────────────────────────────────────────────────
// POST /api/users/admin-login
// Admin login KHÔNG CẦN OTP – trực tiếp cấp JWT
// ──────────────────────────────────────────────────────────
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Thiếu email hoặc password' });
    }

    // ── Tìm user ──
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
    }

    // ── Kiểm tra role admin ──
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới được truy cập' });
    }

    // ── So sánh password ──
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
    }

    // ── Cấp JWT ngay (không cần OTP) ──
    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const { password: _, ...userSafe } = user.toObject();

    return res.status(200).json({
      message: 'Đăng nhập admin thành công',
      user: userSafe,
      token,
      refreshToken
    });

  } catch (err) {
    console.error('❌ admin-login error:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/google-login', googleLogin);

// ──────────────────────────────────────────────────────────
// GET /api/users/auth/google
// Redirect to Google login page
// ──────────────────────────────────────────────────────────
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ──────────────────────────────────────────────────────────
// GET /api/users/auth/google/callback
// Google OAuth callback - Cấp JWT token
// ──────────────────────────────────────────────────────────
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = req.user;

      // ── Cấp JWT ──
      const token = signAccessToken(user);
      const refreshToken = signRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      // ──  Redirect với token (hoặc có thể trả JSON) ──
      // Cách 1: Redirect with token in URL (không an toàn cho production)
      // Cách 2: Trả về HTML page chứa token
      const frontendURL = 'http://localhost:3000'; // hoặc biến env

      const { password: _, ...userSafe } = user.toObject();

      // Tạo HTML page với script redirect
      const html = `
        <html>
          <head><title>Google Login</title></head>
          <body>
            <script>
              const data = {
                user: ${JSON.stringify(userSafe)},
                token: '${token}',
                refreshToken: '${refreshToken}'
              };
              localStorage.setItem('auth', JSON.stringify(data));
              window.location.href = '${frontendURL}/?auth=success';
            </script>
            <p>Redirecting...</p>
          </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      console.error('Google callback error:', error);
      res.status(500).json({ error: 'Lỗi đăng nhập Google' });
    }
  }
);
// POST /api/users/register-admin
router.post('/register-admin', async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name, email, phone, address,
      password: hashedPassword,
      role: 'admin'
    });

    const { password: _, refreshToken: __, ...safeUser } = newUser.toObject();
    res.status(201).json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;