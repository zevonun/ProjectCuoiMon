const Voucher = require('../models/voucher');
const Order = require('../models/order');


// @desc    Get all vouchers (Admin)
// @route   GET /api/admin/vouchers
// @access  Private/Admin
exports.getAllVouchers = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.code = { $regex: search, $options: 'i' };
        }

        // ✅ Populate với options để bỏ qua lỗi nếu ref không tồn tại
        const vouchers = await Voucher.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate({
                path: 'createdBy',
                select: 'name email',
                options: { strictPopulate: false } // ← Bỏ qua lỗi nếu không tìm thấy
            })
            .lean();

        const count = await Voucher.countDocuments(query);

        res.json({
            success: true,
            data: vouchers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('getAllVouchers error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Get single voucher (Admin)
// @route   GET /api/admin/vouchers/:id
// @access  Private/Admin
exports.getVoucherById = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('applicableProducts', 'name price')
            .populate('applicableCategories', 'name');
        // .populate('applicableCategories', 'name');

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy voucher'
            });
        }

        res.json({
            success: true,
            data: voucher
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create voucher (Admin)
// @route   POST /api/admin/vouchers
// @access  Private/Admin
exports.createVoucher = async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user);

        const {
            code,
            type,
            value,
            minOrder,
            maxDiscount,
            quantity,
            startDate,
            endDate,
            status,
            description,
            limitPerUser,
            applicableProducts,
            applicableCategories
        } = req.body;

        // Check if code exists
        const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
        if (existingVoucher) {
            return res.status(400).json({
                success: false,
                message: 'Mã voucher đã tồn tại'
            });
        }

        const voucherData = {
            code,
            type,
            value: Number(value),
            minOrder: Number(minOrder) || 0,
            maxDiscount: Number(maxDiscount) || 0,
            quantity: Number(quantity),
            startDate,
            endDate,
            status: status || 'scheduled',
            description: description || '',
            limitPerUser: Number(limitPerUser) || 1,
            applicableProducts: applicableProducts || [],
            applicableCategories: applicableCategories || [],
            createdBy: req.user?._id || req.user?.id
        };

        console.log('Creating voucher with data:', JSON.stringify(voucherData, null, 2));

        const voucher = await Voucher.create(voucherData);

        console.log('Voucher created successfully:', voucher._id);

        res.status(201).json({
            success: true,
            message: 'Tạo voucher thành công',
            data: voucher
        });
    } catch (error) {
        console.error('Create voucher error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update voucher (Admin)
// @route   PUT /api/admin/vouchers/:id
// @access  Private/Admin
exports.updateVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy voucher'
            });
        }

        // Check if changing code and if new code exists
        if (req.body.code && req.body.code !== voucher.code) {
            const existingVoucher = await Voucher.findOne({
                code: req.body.code.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (existingVoucher) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã voucher đã tồn tại'
                });
            }
        }

        // Update fields
        const allowedUpdates = [
            'code', 'type', 'value', 'minOrder', 'maxDiscount',
            'quantity', 'startDate', 'endDate', 'status',
            'description', 'limitPerUser', 'applicableProducts',
            'applicableCategories'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                voucher[field] = req.body[field];
            }
        });

        voucher.updatedBy = req.user?._id || req.user?.id;
        await voucher.save();

        res.json({
            success: true,
            message: 'Cập nhật voucher thành công',
            data: voucher
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete voucher (Admin)
// @route   DELETE /api/admin/vouchers/:id
// @access  Private/Admin
exports.deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy voucher'
            });
        }

        // Check if voucher has been used
        if (voucher.used > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa voucher đã được sử dụng. Hãy đặt trạng thái inactive thay vì xóa.'
            });
        }

        await voucher.deleteOne();

        res.json({
            success: true,
            message: 'Xóa voucher thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get voucher statistics (Admin)
// @route   GET /api/admin/vouchers/stats
// @access  Private/Admin
exports.getVoucherStats = async (req, res) => {
    try {
        const total = await Voucher.countDocuments();
        const active = await Voucher.countDocuments({ status: 'active' });
        const scheduled = await Voucher.countDocuments({ status: 'scheduled' });
        const expired = await Voucher.countDocuments({ status: 'expired' });

        const usageStats = await Voucher.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsed: { $sum: '$used' },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                total,
                active,
                scheduled,
                expired,
                usageRate: usageStats.length > 0
                    ? ((usageStats[0].totalUsed / usageStats[0].totalQuantity) * 100).toFixed(2)
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========== PUBLIC API FOR USERS ==========

// @desc    Get valid vouchers for user
// @route   GET /api/vouchers
// @access  Public
exports.getValidVouchers = async (req, res) => {
    try {
        const now = new Date();

        const vouchers = await Voucher.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
            $expr: { $lt: ['$used', '$quantity'] }
        })
            .select('-usedBy -createdBy -updatedBy')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: vouchers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Validate voucher code
// @route   POST /api/vouchers/validate
// @access  Private
exports.validateVoucher = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code || !orderAmount) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mã voucher và giá trị đơn hàng'
            });
        }

        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Mã voucher không tồn tại'
            });
        }

        // Check validity
        if (!voucher.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Voucher không còn hiệu lực hoặc đã hết'
            });
        }

        // Check if user has used this voucher
        if (req.user && voucher.isUsedByUser(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã sử dụng voucher này rồi'
            });
        }

        // Check minimum order
        if (orderAmount < voucher.minOrder) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString()}đ để sử dụng voucher này`
            });
        }

        // Calculate discount
        const discount = voucher.calculateDiscount(orderAmount);

        res.json({
            success: true,
            data: {
                voucher: {
                    code: voucher.code,
                    type: voucher.type,
                    value: voucher.value,
                    description: voucher.description
                },
                discount,
                finalAmount: orderAmount - discount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Apply voucher to order
// @route   POST /api/vouchers/apply
// @access  Private
exports.applyVoucher = async (req, res) => {
    try {
        const { code, orderId } = req.body;

        const voucher = await Voucher.findOne({ code: code.toUpperCase() });

        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Mã voucher không tồn tại'
            });
        }

        await voucher.applyToOrder(req.user._id, orderId);

        res.json({
            success: true,
            message: 'Áp dụng voucher thành công',
            data: voucher
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update voucher statuses (Cron job)
// @route   POST /api/admin/vouchers/update-statuses
// @access  Private/Admin
exports.updateVoucherStatuses = async (req, res) => {
    try {
        await Voucher.updateStatuses();

        res.json({
            success: true,
            message: 'Cập nhật trạng thái voucher thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};