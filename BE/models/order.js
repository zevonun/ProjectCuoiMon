const mongoose = require('mongoose');

// ✅ Xóa index cũ nếu tồn tại
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Thông tin khách hàng
    customerInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      province: { type: String, required: true }
    },

    // Sản phẩm
    products: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],

    // Giá
    totalPrice: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },

    // Thanh toán
    paymentMethod: {
      type: String,
      enum: ['COD', 'MOMO', 'VNPAY'],
      default: 'COD'
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },

    // Trạng thái
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returning', 'returned'],
      default: 'pending'
    },

    notes: String
  },
  {
    timestamps: true
  }
);

// ✅ Cấu hình pre-save hook để tạo orderId nếu chưa có
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    // Tạo orderId dạng: ORDER_timestamp_randomId
    this.orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
