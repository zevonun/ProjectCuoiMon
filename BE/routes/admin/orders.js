// BE/routes/admin/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../../models/order');
const User = require('../../models/user');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');

router.use(verifyToken, isAdmin);

// GET /admin/orders — danh sách tất cả đơn hàng, có filter + phân trang
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { orderId: new RegExp(search, 'i') },
        { 'customerInfo.fullName': new RegExp(search, 'i') },
        { 'customerInfo.phone': new RegExp(search, 'i') },
        { 'customerInfo.email': new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /admin/orders/:id — chi tiết đơn hàng
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    // Lấy thêm thông tin user
    const user = await User.findById(order.userId).select('name email phone').lean();
    res.json({ success: true, data: { ...order, user } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PATCH /admin/orders/:id/status — cập nhật trạng thái
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returning', 'returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    res.json({ success: true, message: 'Cập nhật thành công', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// DELETE /admin/orders/:id — xóa đơn hàng
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    res.json({ success: true, message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
