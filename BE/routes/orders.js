const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { verifyToken } = require('../middleware/authen');

// ✅ POST /api/orders - Tạo đơn hàng mới
router.post('/', verifyToken, async (req, res) => {
  try {
    const { userId, customerInfo, products, paymentMethod, totalPrice, shippingFee, notes } = req.body;

    console.log('📝 Order creation request:', { userId, customerInfo, products: products?.length, paymentMethod, totalPrice });

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu userId' 
      });
    }

    if (!customerInfo) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin khách hàng' 
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm' 
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Tổng tiền không hợp lệ' 
      });
    }

    // Tạo order mới
    const order = new Order({
      userId,
      customerInfo,
      products,
      paymentMethod,
      totalPrice,
      shippingFee: shippingFee || 0,
      notes,
      status: 'pending'
    });

    await order.save();

    // ✅ Cập nhật số lượng tồn kho (Deduction)
    try {
      const Product = require('../models/product');
      for (const item of products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -Math.abs(item.quantity) }
        });
      }
      console.log('📦 Stock updated for order:', order._id);
    } catch (stockErr) {
      console.error('❌ Error updating stock:', stockErr);
      // Tiếp tục vì đơn hàng đã được tạo thành công
    }

    console.log('✅ Order created:', order._id);

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

// ✅ GET /api/orders - Lấy danh sách đơn hàng của user (có filter theo status)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu userId' 
      });
    }

    let query = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('products.productId')
      .sort({ createdAt: -1 });
    
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

// ✅ GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('products.productId');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('❌ Get order details error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy chi tiết đơn hàng' 
    });
  }
});

// ✅ PATCH /api/orders/:id/cancel - Hủy đơn hàng
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    // Chỉ cho phép hủy nếu status là pending
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận' 
      });
    }

    order.status = 'cancelled';
    await order.save();

    // ✅ Hoàn lại số lượng tồn kho (Restore)
    try {
      const Product = require('../models/product');
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: Math.abs(item.quantity) }
        });
      }
      console.log('🔄 Stock restored for cancelled order:', order._id);
    } catch (stockErr) {
      console.error('❌ Error restoring stock:', stockErr);
    }

    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order
    });
  } catch (err) {
    console.error('❌ Cancel order error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi hủy đơn hàng' 
    });
  }
});

// ✅ PATCH /api/orders/:id/address - Cập nhật địa chỉ giao hàng
router.patch('/:id/address', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address, province } = req.body;

    // Validate required fields
    if (!fullName || !phone || !address || !province) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin địa chỉ' 
      });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    // Chỉ cho phép sửa địa chỉ nếu status là pending
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Chỉ có thể thay đổi địa chỉ khi đơn hàng ở trạng thái chờ xác nhận' 
      });
    }

    order.customerInfo = {
      ...order.customerInfo,
      fullName,
      phone,
      address,
      province
    };

    await order.save();

    res.json({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      data: order
    });
  } catch (err) {
    console.error('❌ Update address error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi cập nhật địa chỉ' 
    });
  }
});

module.exports = router;
