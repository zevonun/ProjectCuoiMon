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

// ── Routes ──
var indexRouter = require('./routes/index');
var adminUsersRouter = require('./routes/admin/users');
var apiUsersRouter = require('./routes/api/users');
var adminProductsRouter = require('./routes/admin/products');
var apiProductsRouter = require('./routes/api/products');
var adminCategoriesRouter = require('./routes/admin/categories');
var apiCategoriesRouter = require('./routes/api/categories');
var ordersRouter = require('./routes/orders');
var orderDetailsRouter = require('./routes/orderDetails');
var uploadRouter = require('./routes/upload');
var dashboardRouter = require('./routes/api/dashboard');
var bannersApiRouter = require('./routes/api/banners');
var adminBannersRouter = require('./routes/admin/banners');
var vouchersApiRouter = require('./routes/api/vouchers');
var adminVouchersRouter = require('./routes/admin/vouchers');
var otpRouter = require('./routes/api/otp');

var app = express();

/* ── View engine ── */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/* ── Middleware cơ bản ── */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ── Static files ──
   Chỉ dùng MỘT điểm mount cho uploads để tránh conflict.
   Frontend truy cập ảnh tại: /uploads/products/xxx.png
*/
app.use(express.static(path.join(__dirname, 'public')));
// ✅ Bỏ dòng app.use('/uploads', express.static('uploads')) trùng với public/uploads

/* ── CORS ──
   Đọc allowed origins từ .env (cách nhau bằng dấu phẩy)
   Ví dụ .env: CORS_ORIGIN=http://localhost:3000,http://localhost:3001
*/
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ── Session ── */
app.use(session({
  secret: process.env.SESSION_SECRET, // ✅ Không có fallback yếu
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 24 giờ
  },
}));

/* ── Passport ── */
app.use(passport.initialize());
app.use(passport.session());

/* ── Security middleware ── */
const { apiLimiter } = require('./middleware/rateLimit');
const checkBlacklist = require('./middleware/checkBlacklist');
app.use(apiLimiter);
app.use(checkBlacklist);

/* ── Routes ── */
app.use('/', indexRouter);

app.use('/admin/users', adminUsersRouter);
app.use('/api/users', apiUsersRouter);

app.use('/admin/products', adminProductsRouter);
app.use('/api/product', apiProductsRouter);   // giữ nguyên path để không break frontend
app.use('/api/products', apiProductsRouter); 

app.use('/admin/categories', adminCategoriesRouter);
app.use('/api/categories', apiCategoriesRouter);

app.use('/orders', ordersRouter);
app.use('/orderDetails', orderDetailsRouter);
app.use('/api/upload', uploadRouter);

app.use('/api/dashboard', dashboardRouter);

app.use('/api/banners', bannersApiRouter);
app.use('/admin/banners', adminBannersRouter);

app.use('/api/vouchers', vouchersApiRouter);
app.use('/admin/vouchers', adminVouchersRouter);

app.use('/api/otp', otpRouter);

// ✅ ĐẶT Ở ĐÂY (TRƯỚC 404)
const chatRoute = require('./routes/chat-temp');
app.use('/api/chat', chatRoute);

/* ── Database ── */
mongoose.connect(process.env.MONGODB_URI) // ✅ Đọc từ .env
  .then(() => {
    console.log('✅ MongoDB connected');
    const { setupVoucherCron } = require('./services/voucherCron');
    setupVoucherCron();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

/* ── Error handling ── */
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