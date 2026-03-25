const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { verifyToken } = require('../middleware/authen');

// ✅ POST /api/orders - Tạo đơn hàng mới
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, customerInfo, products, paymentMethod, totalPrice, shippingFee, notes } = req.body;

    // Validate required fields
    if (!userId || !customerInfo || !products || !totalPrice) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin cần thiết' 
      });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm' 
      });
    }

    // Tạo order mới
    const order = new Order({
      userId,
      customerInfo,
      products,
      paymentMethod,
      totalPrice,
      shippingFee,
      notes,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: order
    });
  } catch (err) {
    console.error('❌ Create order error:', err);
    res.status(500).json({ 
      success: false,
      message: `Lỗi khi tạo đơn hàng: ${err.message}` 
    });
  }
});

// ✅ GET /api/orders - Lấy danh sách đơn hàng của user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu userId' 
      });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    console.error('❌ Get orders error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy đơn hàng' 
    });
  }
});

module.exports = router;
