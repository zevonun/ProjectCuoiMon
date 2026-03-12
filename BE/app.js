var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');

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

// ✅ BANNERS
var bannersApiRouter = require('./routes/api/banners');
var adminBannersRouter = require('./routes/admin/banners');

// ✅ VOUCHERS
var vouchersApiRouter = require('./routes/api/vouchers');
var adminVouchersRouter = require('./routes/admin/vouchers');

// ✅ OTP (2FA)
var otpRouter = require('./routes/api/otp');

var app = express();

/* ================= MIDDLEWARE CƠ BẢN ================= */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ================= STATIC PUBLIC ================= */
app.use(express.static(path.join(__dirname, 'public')));

/* =====================================================
   ✅ NOTE QUAN TRỌNG (CÁCH 2 – ENV)
   Expose thư mục uploads để frontend gọi:
   http://localhost:5000/uploads/products/xxx.png
===================================================== */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ================= CORS ================= */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ================= SECURITY ================= */
const { apiLimiter } = require('./middleware/rateLimit');
const checkBlacklist = require('./middleware/checkBlacklist');

app.use(apiLimiter);
app.use(checkBlacklist);

/* ================= ROUTES ================= */
app.use('/', indexRouter);

app.use('/admin/users', adminUsersRouter);
app.use('/api/users', apiUsersRouter);

app.use('/admin/products', adminProductsRouter);
app.use('/api/product', apiProductsRouter);

app.use('/admin/categories', adminCategoriesRouter);
app.use('/api/categories', apiCategoriesRouter);

app.use('/orders', ordersRouter);
app.use('/orderDetails', orderDetailsRouter);
app.use('/api/upload', uploadRouter);

app.use('/api/dashboard', dashboardRouter);

// ✅ BANNERS
app.use('/api/banners', bannersApiRouter);
app.use('/admin/banners', adminBannersRouter);

// ✅ VOUCHERS
app.use('/api/vouchers', vouchersApiRouter);
app.use('/admin/vouchers', adminVouchersRouter);

// ✅ OTP (2FA) – route mới
app.use('/api/otp', otpRouter);

/* ================= DATABASE ================= */
mongoose.connect('mongodb://localhost:27017/mybeauty')
  .then(() => {
    console.log('MongoDB connected...');

    // ✅ Khởi động Voucher Cron Job sau khi DB connected
    const { setupVoucherCron } = require('./services/voucherCron');
    setupVoucherCron();
  })
  .catch(err => console.log(err));

/* ================= ERROR HANDLING ================= */
app.use(function (req, res, next) {
  res.status(404).json({ error: 'Not Found' });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    error: err.message
  });
});

module.exports = app;