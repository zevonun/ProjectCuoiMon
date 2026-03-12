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
const {
    createVoucherValidation,
    updateVoucherValidation,
    getVouchersValidation,
    idParamValidation
} = require('../../middleware/voucherValidation');

// ========== ADMIN ROUTES (Cần auth + admin) ==========

// Stats route - phải đặt trước /:id
router.get('/stats', verifyToken, isAdmin, getVoucherStats);

// Update statuses route
router.post('/update-statuses', verifyToken, isAdmin, updateVoucherStatuses);

// CRUD routes
router.get('/', verifyToken, isAdmin, getVouchersValidation, getAllVouchers);

router.post('/', verifyToken, isAdmin, createVoucherValidation, createVoucher);

router.get('/:id', verifyToken, isAdmin, idParamValidation, getVoucherById);

router.put('/:id', verifyToken, isAdmin, updateVoucherValidation, updateVoucher);

router.delete('/:id', verifyToken, isAdmin, idParamValidation, deleteVoucher);

module.exports = router;