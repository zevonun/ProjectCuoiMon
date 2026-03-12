// services/emailService.js
const nodemailer = require('nodemailer');

/* ─────────────────────────────────────────────────
   CÃ U HÌ NH: Đặt vào .env
   GMAIL_USER=yourgmail@gmail.com
   GMAIL_APP_PASS=your_16_char_app_password
   ───────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,                        // TLS (không phải SSL)
  auth: {
    user: process.env.GMAIL_USER,       // gmail của bạn
    pass: process.env.GMAIL_APP_PASS    // App Password (không phải mật khẩu thường)
  }
});

// ✅ Verify kết nối SMTP khi server start (optional – helpful để debug)
transporter.verify()
  .then(() => console.log('✅ Gmail SMTP connected'))
  .catch(err => console.error('❌ Gmail SMTP error:', err.message));

/* ─────────────────────────────────────────────────
   Gửi email OTP
   @param { email: string, otp: string, purpose: 'login' | 'register' | 'reset-password' }
   ───────────────────────────────────────────────── */
const sendOtpEmail = async ({ email, otp, purpose }) => {
  const subjectMap = {
    'login':          '[MyBeauty] Mã xác thực đăng nhập',
    'register':       '[MyBeauty] Mã xác thực đăng ký',
    'reset-password': '[MyBeauty] Mã đặt lại mật khẩu'
  };

  const purposeLabel = {
    'login':          'đăng nhập',
    'register':       'đăng ký tài khoản',
    'reset-password': 'đặt lại mật khẩu'
  };

  const mailOptions = {
    from:    `"MyBeauty" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject: subjectMap[purpose] || '[MyBeauty] Mã xác thực',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body          { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 30px 0; }
          .wrapper      { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
          .header       { background: linear-gradient(135deg, #e91e8c, #c2185b); padding: 28px 24px 20px; text-align: center; }
          .header h1    { margin: 0; color: #fff; font-size: 22px; letter-spacing: 1px; }
          .body         { padding: 32px 28px; text-align: center; }
          .body p       { color: #555; font-size: 15px; margin: 0 0 8px; }
          .otp-box      { background: #fdf2f8; border: 2px dashed #e91e8c; border-radius: 10px; padding: 18px 0; margin: 24px 0; }
          .otp-box span { font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #c2185b; }
          .note         { color: #999; font-size: 13px; margin-top: 18px; }
          .footer       { background: #f4f6f9; padding: 16px; text-align: center; }
          .footer p     { margin: 0; color: #aaa; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header"><h1>✦ MyBeauty</h1></div>
          <div class="body">
            <p>Xin chào,</p>
            <p>Đây là mã OTP để <strong>${purposeLabel[purpose] || 'xác thực'}</strong> của bạn.</p>
            <div class="otp-box"><span>${otp}</span></div>
            <p class="note">Mã này có hiệu lực trong <strong>10 phút</strong>.<br/>Không chia sẻ mã này với ai khác.</p>
          </div>
          <div class="footer"><p>© 2025 MyBeauty. Tất cả quyền được bảo lưu.</p></div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ OTP email sent to ${email} – messageId: ${info.messageId}`);
  return info;
};

module.exports = { sendOtpEmail };
