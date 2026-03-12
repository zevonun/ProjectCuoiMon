const { body, param, query, validationResult } = require('express-validator');

// Middleware kiểm tra validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array()); // ← Thêm log
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array()
        });
    }
    next();
};

// Validation cho tạo voucher
const createVoucherValidation = [
    body('code')
        .trim()
        .notEmpty().withMessage('Mã voucher không được để trống')
        .isLength({ min: 3, max: 20 }).withMessage('Mã voucher phải từ 3-20 ký tự')
        .matches(/^[A-Z0-9]+$/).withMessage('Mã voucher chỉ chứa chữ HOA và số'),

    body('type')
        .notEmpty().withMessage('Loại voucher không được để trống')
        .isIn(['percentage', 'fixed']).withMessage('Loại voucher phải là percentage hoặc fixed'),

    body('value')
        .notEmpty().withMessage('Giá trị voucher không được để trống')
        .isNumeric().withMessage('Giá trị voucher phải là số')
        .custom((value, { req }) => {
            const numValue = Number(value);
            if (numValue < 0) {
                throw new Error('Giá trị voucher phải >= 0');
            }
            if (req.body.type === 'percentage' && numValue > 100) {
                throw new Error('Giá trị phần trăm không được vượt quá 100');
            }
            return true;
        }),

    body('minOrder')
        .optional({ nullable: true, checkFalsy: false })
        .isNumeric().withMessage('Đơn hàng tối thiểu phải là số')
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error('Đơn hàng tối thiểu phải >= 0');
            }
            return true;
        }),

    body('maxDiscount')
        .optional({ nullable: true, checkFalsy: false })
        .isNumeric().withMessage('Giảm giá tối đa phải là số')
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error('Giảm giá tối đa phải >= 0');
            }
            return true;
        }),

    body('quantity')
        .notEmpty().withMessage('Số lượng không được để trống')
        .isInt({ min: 1 }).withMessage('Số lượng phải >= 1'),

    body('startDate')
        .notEmpty().withMessage('Ngày bắt đầu không được để trống')
        .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),

    body('endDate')
        .notEmpty().withMessage('Ngày kết thúc không được để trống')
        .isISO8601().withMessage('Ngày kết thúc không hợp lệ')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['active', 'scheduled', 'expired', 'inactive'])
        .withMessage('Trạng thái không hợp lệ'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Mô tả không quá 500 ký tự'),

    body('limitPerUser')
        .optional()
        .isInt({ min: 1 }).withMessage('Giới hạn mỗi user phải >= 1'),

    body('applicableProducts')
        .optional()
        .isArray().withMessage('Sản phẩm áp dụng phải là mảng'),

    body('applicableCategories')
        .optional()
        .isArray().withMessage('Danh mục áp dụng phải là mảng'),

    validate
];

// Validation cho cập nhật voucher
const updateVoucherValidation = [
    param('id')
        .isMongoId().withMessage('ID voucher không hợp lệ'),

    body('code')
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('Mã voucher phải từ 3-20 ký tự')
        .matches(/^[A-Z0-9]+$/).withMessage('Mã voucher chỉ chứa chữ HOA và số'),

    body('type')
        .optional()
        .isIn(['percentage', 'fixed']).withMessage('Loại voucher phải là percentage hoặc fixed'),

    body('value')
        .optional()
        .isNumeric().withMessage('Giá trị voucher phải là số')
        .custom((value, { req }) => {
            const numValue = Number(value);
            if (numValue < 0) {
                throw new Error('Giá trị voucher phải >= 0');
            }
            if (req.body.type === 'percentage' && numValue > 100) {
                throw new Error('Giá trị phần trăm không được vượt quá 100');
            }
            return true;
        }),

    body('minOrder')
        .optional({ nullable: true, checkFalsy: false })
        .isNumeric().withMessage('Đơn hàng tối thiểu phải là số')
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error('Đơn hàng tối thiểu phải >= 0');
            }
            return true;
        }),

    body('maxDiscount')
        .optional({ nullable: true, checkFalsy: false })
        .isNumeric().withMessage('Giảm giá tối đa phải là số')
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error('Giảm giá tối đa phải >= 0');
            }
            return true;
        }),

    body('quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Số lượng phải >= 0'),

    body('startDate')
        .optional()
        .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),

    body('endDate')
        .optional()
        .isISO8601().withMessage('Ngày kết thúc không hợp lệ'),

    body('status')
        .optional()
        .isIn(['active', 'scheduled', 'expired', 'inactive'])
        .withMessage('Trạng thái không hợp lệ'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Mô tả không quá 500 ký tự'),

    body('limitPerUser')
        .optional()
        .isInt({ min: 1 }).withMessage('Giới hạn mỗi user phải >= 1'),

    validate
];

// Validation cho validate voucher
const validateVoucherCodeValidation = [
    body('code')
        .trim()
        .notEmpty().withMessage('Mã voucher không được để trống'),

    body('orderAmount')
        .notEmpty().withMessage('Giá trị đơn hàng không được để trống')
        .isFloat({ min: 0 }).withMessage('Giá trị đơn hàng phải >= 0'),

    validate
];

// Validation cho apply voucher
const applyVoucherValidation = [
    body('code')
        .trim()
        .notEmpty().withMessage('Mã voucher không được để trống'),

    body('orderId')
        .notEmpty().withMessage('ID đơn hàng không được để trống')
        .isMongoId().withMessage('ID đơn hàng không hợp lệ'),

    validate
];

// Validation cho query params
const getVouchersValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Trang phải >= 1'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Giới hạn phải từ 1-100'),

    query('status')
        .optional()
        .isIn(['all', 'active', 'scheduled', 'expired', 'inactive'])
        .withMessage('Trạng thái không hợp lệ'),

    validate
];

// Validation cho param ID
const idParamValidation = [
    param('id')
        .isMongoId().withMessage('ID không hợp lệ'),

    validate
];

module.exports = {
    createVoucherValidation,
    updateVoucherValidation,
    validateVoucherCodeValidation,
    applyVoucherValidation,
    getVouchersValidation,
    idParamValidation
};