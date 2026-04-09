const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Review = require('../../models/review');
const Order = require('../../models/order');
const User = require('../../models/user');
const { verifyToken } = require('../../middleware/authen');

// GET /api/reviews/product/:productId  (public)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
    }

    const reviews = await Review.find({ productId, status: 'approved' })
      .sort({ createdAt: -1 })
      .select('userName rating comment createdAt')
      .lean();

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('Get product reviews error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/reviews/can-review?orderId=... (auth)
router.get('/can-review', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId || !mongoose.Types.ObjectId.isValid(String(orderId))) {
      return res.status(400).json({ success: false, message: 'orderId không hợp lệ' });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập đơn hàng này' });
    }

    if (order.status !== 'delivered') {
      return res.json({ success: true, canReview: false, message: 'Đơn hàng chưa hoàn thành' });
    }

    const reviewed = await Review.find({ orderId: order._id, userId: req.user._id })
      .select('productId')
      .lean();
    const reviewedSet = new Set(reviewed.map(r => String(r.productId)));

    res.json({
      success: true,
      canReview: true,
      reviewedProductIds: Array.from(reviewedSet),
    });
  } catch (err) {
    console.error('can-review error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// POST /api/reviews  (auth)
// body: { orderId, productId, rating, comment }
router.post('/', verifyToken, async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(String(orderId))) {
      return res.status(400).json({ success: false, message: 'orderId không hợp lệ' });
    }
    if (!mongoose.Types.ObjectId.isValid(String(productId))) {
      return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
    }
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'rating phải từ 1 đến 5' });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    if (String(order.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Không có quyền đánh giá đơn hàng này' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá khi đơn hàng đã giao' });
    }

    const hasProduct = Array.isArray(order.products) && order.products.some(p => String(p.productId) === String(productId));
    if (!hasProduct) {
      return res.status(400).json({ success: false, message: 'Sản phẩm không thuộc đơn hàng này' });
    }

    const user = await User.findById(req.user._id).select('name').lean();
    const userName = user?.name || 'Khách hàng';

    let created;
    try {
      created = await Review.create({
        orderId,
        productId,
        userId: req.user._id,
        userName,
        rating: r,
        comment: String(comment || '').trim(),
        // Auto-approve because this route already verifies "đã mua và đã giao"
        status: 'approved',
      });
    } catch (e) {
      // unique index violation => already reviewed
      if (e && (e.code === 11000 || String(e.message || '').includes('E11000'))) {
        return res.status(409).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi' });
      }
      throw e;
    }

    res.status(201).json({ success: true, message: 'Gửi đánh giá thành công', data: created });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;

