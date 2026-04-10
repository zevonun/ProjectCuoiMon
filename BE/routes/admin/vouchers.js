const express = require('express');
const router = express.Router();

// Import controller
const {
    getAllVouchers,
    getVoucherById,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getVoucherStats,
    updateVoucherStatuses
} = require('../../controllers/voucherController');

// Import middleware
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');
const {
    createVoucherValidation,
    updateVoucherValidation,
    getVouchersValidation,
    idParamValidation
} = require('../../middleware/voucherValidation');

// ========== ADMIN ROUTES (Cần auth + admin) ==========

// Stats route - phải đặt trước /:id
router.get('/stats', verifyToken, isAdmin, requirePermission('manage_vouchers'), getVoucherStats);

// Update statuses route
router.post('/update-statuses', verifyToken, isAdmin, requirePermission('manage_vouchers'), updateVoucherStatuses);

// CRUD routes
router.get('/', verifyToken, isAdmin, requirePermission('manage_vouchers'), getVouchersValidation, getAllVouchers);

router.post('/', verifyToken, isAdmin, requirePermission('manage_vouchers'), createVoucherValidation, createVoucher);

router.get('/:id', verifyToken, isAdmin, requirePermission('manage_vouchers'), idParamValidation, getVoucherById);

router.put('/:id', verifyToken, isAdmin, requirePermission('manage_vouchers'), updateVoucherValidation, updateVoucher);

router.delete('/:id', verifyToken, isAdmin, requirePermission('manage_vouchers'), idParamValidation, deleteVoucher);

module.exports = router;