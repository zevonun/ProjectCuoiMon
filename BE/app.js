require('dotenv').config(); // ✅ Load .env sớm nhất, trước mọi require khác

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
var session = require('express-session');
var passport = require('passport');
require('./middleware/passport');

// ── Kiểm tra biến môi trường bắt buộc khi khởi động ──
const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET', 'MONGODB_URI'];
REQUIRED_ENV.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Thiếu biến môi trường bắt buộc: ${key}`);
    process.exit(1);
  }
});

// ── Kết nối Database TRƯỚC KHI làm bất cứ điều gì ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const { setupVoucherCron } = require('./services/voucherCron');
    setupVoucherCron();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

var app = express();

// ═══════════════════════════════════════════
// 1. MIDDLEWARE CƠ BẢN (không cần auth)
// ═══════════════════════════════════════════
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Dev: tắt 304/etag để ảnh static (/uploads) luôn tải lại; prod vẫn cache bình thường
const isProd = process.env.NODE_ENV === 'production';
app.use(express.static(path.join(__dirname, 'public'), {
  etag: isProd,
  lastModified: isProd,
  setHeaders: (res) => {
    if (!isProd) res.setHeader('Cache-Control', 'no-store');
  },
}));

// ── CORS ──
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Session ──
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 24 giờ
  },
}));

// ── Passport ──
app.use(passport.initialize());
app.use(passport.session());

// ═══════════════════════════════════════════
// 2. SECURITY MIDDLEWARE
// ═══════════════════════════════════════════
const { apiLimiter } = require('./middleware/rateLimit');
const checkBlacklist = require('./middleware/checkBlacklist');
app.use(apiLimiter);
app.use(checkBlacklist);

// ═══════════════════════════════════════════
// 3. ROUTES PUBLIC (không cần auth) — ĐẶT TRƯỚC
// ═══════════════════════════════════════════
app.use('/', require('./routes/index'));
app.use('/api/users', require('./routes/api/users'));           // có /register-admin bên trong
app.use('/api/product', require('./routes/api/products'));      // giữ path cũ để không break FE
app.use('/api/products', require('./routes/api/products'));
app.use('/api/categories', require('./routes/api/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vnpay', require('./routes/vnpay'));
app.use('/api/momo', require('./routes/momo'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/test', require('./routes/test'));
app.use('/api/dashboard', require('./routes/api/dashboard'));
app.use('/api/banners', require('./routes/api/banners'));
app.use('/api/vouchers', require('./routes/api/vouchers'));
app.use('/api/otp', require('./routes/api/otp'));
app.use('/api/chat', require('./routes/chat-temp'));
app.use('/api/articles', require('./routes/api/articles'));
app.use('/api/reviews', require('./routes/api/reviews'));
app.use('/orderDetails', require('./routes/orderDetails'));

// ═══════════════════════════════════════════
// 4. ROUTES ADMIN (cần verifyToken + isAdmin — xử lý bên trong từng router)
// ═══════════════════════════════════════════
app.use('/admin/users', require('./routes/admin/users'));
app.use('/admin/products', require('./routes/admin/products'));
app.use('/admin/categories', require('./routes/admin/categories'));
app.use('/admin/banners', require('./routes/admin/banners'));
app.use('/admin/vouchers', require('./routes/admin/vouchers'));
app.use('/admin/orders', require('./routes/admin/orders'));
app.use('/admin/reviews', require('./routes/admin/reviews'));
app.use('/admin/inventory', require('./routes/admin/inventory'));

// ═══════════════════════════════════════════
// 5. ERROR HANDLING — ĐẶT CUỐI CÙNG
// ═══════════════════════════════════════════
app.use(function (req, res, next) {
  res.status(404).json({ error: 'Not Found' });
});

app.use(function (err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Lỗi server' : err.message
  });
});

module.exports = app;
