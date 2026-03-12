// controllers/otpController.js
const Otp            = require('../models/otp');
const { sendOtpEmail }   = require('../services/emailService');
const { generateOtp, hashOtp, verifyOtp } = require('../utils/otpUtils');

// ─── Hằng số ────────────────────────────────────────────
const MAX_ATTEMPTS       = 3;     // tối đa 3 lần nhập sai → OTP bị khóa
const RESEND_COOLDOWN_MS = 60_000; // phải chờ 60s trước khi resend

// ──────────────────────────────────────────────────────────
// POST /api/otp/send
// Body: { email, purpose }   purpose: 'login' | 'register' | 'reset-password'
// ──────────────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ error: 'Thiếu email hoặc purpose' });
    }

    // ── Xóa OTP cũ của cùng email + purpose (chỉ giữ 1 OTP active) ──
    await Otp.deleteMany({ email, purpose });

    // ── Tạo OTP mới ──
    const plainOtp  = generateOtp();
    const hashedOtp = await hashOtp(plainOtp);

    await Otp.create({
      email,
      otp:     hashedOtp,
      purpose,
      attempts: 0,
      isUsed:   false
    });

    // ── Gửi email ──
    await sendOtpEmail({ email, otp: plainOtp, purpose });

    return res.status(200).json({
      message: 'OTP đã được gửi về email của bạn',
      email          // frontend biết mình đang chờ OTP cho email nào
    });
  } catch (err) {
    console.error('❌ sendOtp error:', err);
    return res.status(500).json({ error: 'Lỗi gửi OTP' });
  }
};

// ──────────────────────────────────────────────────────────
// POST /api/otp/verify
// Body: { email, otp, purpose }
// ──────────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({ error: 'Thiếu thông tin' });
    }

    // ── Tìm OTP chưa dùng ──
    const otpDoc = await Otp.findOne({ email, purpose, isUsed: false });

    if (!otpDoc) {
      return res.status(400).json({ error: 'OTP không tìm thấy hoặc đã hết hạn' });
    }

    // ── Kiểm tra số lần thử ──
    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      await otpDoc.deleteOne();   // xóa OTP đã bị khóa
      return res.status(400).json({ error: 'Đã vượt số lần thử. Vui lòng yêu cầu OTP mới.' });
    }

    // ── So sánh OTP ──
    const isMatch = await verifyOtp(otp, otpDoc.otp);

    if (!isMatch) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      const remaining = MAX_ATTEMPTS - otpDoc.attempts;
      return res.status(400).json({
        error: `OTP không đúng. Còn ${remaining} lần thử.`
      });
    }

    // ── OTP đúng → đánh dấu đã dùng ──
    otpDoc.isUsed = true;
    await otpDoc.save();

    return res.status(200).json({
      message: 'OTP hợp lệ',
      email,
      purpose
    });
  } catch (err) {
    console.error('❌ verifyOtp error:', err);
    return res.status(500).json({ error: 'Lỗi xác thực OTP' });
  }
};

// ──────────────────────────────────────────────────────────
// POST /api/otp/resend
// Body: { email, purpose }
// ──────────────────────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ error: 'Thiếu email hoặc purpose' });
    }

    // ── Tìm OTP hiện tại ──
    const otpDoc = await Otp.findOne({ email, purpose, isUsed: false });

    if (otpDoc) {
      // Kiểm tra cooldown: nếu chưa qua 60s từ lúc tạo → từ chối
      const elapsed = Date.now() - otpDoc.createdAt.getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({
          error: `Vui lòng chờ ${waitSec}s trước khi gửi lại OTP`
        });
      }

      // Đã qua cooldown → xóa OTP cũ, tạo mới
      await otpDoc.deleteOne();
    }

    // ── Tạo & gửi OTP mới ──
    const plainOtp  = generateOtp();
    const hashedOtp = await hashOtp(plainOtp);

    await Otp.create({
      email,
      otp:     hashedOtp,
      purpose,
      attempts: 0,
      isUsed:   false
    });

    await sendOtpEmail({ email, otp: plainOtp, purpose });

    return res.status(200).json({ message: 'OTP mới đã được gửi về email' });
  } catch (err) {
    console.error('❌ resendOtp error:', err);
    return res.status(500).json({ error: 'Lỗi gửi lại OTP' });
  }
};
