const express = require('express');
const router = express.Router();

// Import controllers
const {
    getValidVouchers,
    validateVoucher,
    applyVoucher
} = require('../../controllers/voucherController');

// Import middleware
const { verifyToken } = require('../../middleware/authen');
const {
    validateVoucherCodeValidation,
    applyVoucherValidation
} = require('../../middleware/voucherValidation');

// ===== PUBLIC ROUTES =====
// GET /api/vouchers - Lấy danh sách voucher còn hiệu lực
router.get('/', getValidVouchers);

// ===== PROTECTED ROUTES (cần đăng nhập) =====
// POST /api/vouchers/validate - Kiểm tra mã voucher
router.post('/validate', verifyToken, validateVoucherCodeValidation, validateVoucher);

// POST /api/vouchers/apply - Áp dụng voucher vào đơn hàng
router.post('/apply', verifyToken, applyVoucherValidation, applyVoucher);

module.exports = router;