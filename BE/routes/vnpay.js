const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');

// ✅ POST /api/vnpay/create_payment_url
router.post('/create_payment_url', vnpayController.createPaymentUrl);

// ✅ GET /api/vnpay/vnpay_return
router.get('/vnpay_return', vnpayController.vnpayReturn);

// ✅ GET /api/vnpay/vnpay_ipn
router.get('/vnpay_ipn', vnpayController.vnpayIPN);

module.exports = router;
