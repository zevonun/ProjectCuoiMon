const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true
        },
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true
        },
        value: {
            type: Number,
            required: true,
            min: 0
        },
        minOrder: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        maxDiscount: {
            type: Number,
            min: 0,
            // Chỉ áp dụng cho voucher percentage
            validate: {
                validator: function (v) {
                    if (this.type === 'fixed') return true;
                    return v === undefined || v > 0;
                },
                message: 'Max discount must be greater than 0 for percentage vouchers'
            }
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        used: {
            type: Number,
            default: 0,
            min: 0
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (v) {
                    return v > this.startDate;
                },
                message: 'End date must be after start date'
            }
        },
        status: {
            type: String,
            enum: ['active', 'scheduled', 'expired', 'inactive'],
            default: 'scheduled'
        },
        description: {
            type: String,
            trim: true
        },
        // Danh sách user đã sử dụng voucher
        usedBy: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            },
            usedAt: {
                type: Date,
                default: Date.now
            }
        }],
        // Giới hạn số lần sử dụng mỗi user
        limitPerUser: {
            type: Number,
            default: 1,
            min: 1
        },
        // Áp dụng cho sản phẩm/danh mục cụ thể (optional)
        applicableProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        applicableCategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Index để tìm kiếm nhanh
voucherSchema.index({ code: 1, status: 1 });
voucherSchema.index({ startDate: 1, endDate: 1 });

// Virtual để check còn voucher không
voucherSchema.virtual('available').get(function () {
    return this.quantity - this.used;
});

// Method kiểm tra voucher còn hiệu lực
voucherSchema.methods.isValid = function () {
    const now = new Date();
    return (
        this.status === 'active' &&
        this.available > 0 &&
        now >= this.startDate &&
        now <= this.endDate
    );
};

// Method kiểm tra user đã dùng voucher chưa
voucherSchema.methods.isUsedByUser = function (userId) {
    const userUsage = this.usedBy.filter(
        u => u.userId.toString() === userId.toString()
    );
    return userUsage.length >= this.limitPerUser;
};

// Method tính discount cho order
voucherSchema.methods.calculateDiscount = function (orderAmount) {
    if (orderAmount < this.minOrder) {
        return 0;
    }

    let discount = 0;

    if (this.type === 'percentage') {
        discount = (orderAmount * this.value) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.value;
    }

    return Math.min(discount, orderAmount);
};

// Method apply voucher cho order
voucherSchema.methods.applyToOrder = async function (userId, orderId) {
    if (!this.isValid()) {
        throw new Error('Voucher không còn hiệu lực');
    }

    if (this.isUsedByUser(userId)) {
        throw new Error('Bạn đã sử dụng voucher này rồi');
    }

    this.used += 1;
    this.usedBy.push({
        userId,
        orderId,
        usedAt: new Date()
    });

    await this.save();
    return this;
};

// Static method tự động cập nhật status
voucherSchema.statics.updateStatuses = async function () {
    const now = new Date();

    // Activate scheduled vouchers
    await this.updateMany(
        {
            status: 'scheduled',
            startDate: { $lte: now },
            endDate: { $gt: now }
        },
        { status: 'active' }
    );

    // Expire active vouchers
    await this.updateMany(
        {
            status: { $in: ['active', 'scheduled'] },
            endDate: { $lt: now }
        },
        { status: 'expired' }
    );

    // Expire vouchers with no quantity left
    await this.updateMany(
        {
            status: 'active',
            $expr: { $gte: ['$used', '$quantity'] }
        },
        { status: 'expired' }
    );
};

// Middleware để validate trước khi save
voucherSchema.pre('save', function (next) {
    // Auto uppercase code
    if (this.code) {
        this.code = this.code.toUpperCase();
    }

    // Validate percentage value
    if (this.type === 'percentage' && this.value > 100) {
        next(new Error('Percentage value cannot exceed 100'));
    }

    // Validate used <= quantity
    if (this.used > this.quantity) {
        next(new Error('Used count cannot exceed quantity'));
    }

    next();
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;