// BE/routes/admin/reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../../models/review');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');

router.use(verifyToken, isAdmin, requirePermission('manage_products'));

// GET /admin/reviews
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Review.countDocuments(filter),
    ]);

    res.json({ success: true, total, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// PATCH /admin/reviews/:id/status — duyệt/từ chối
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// DELETE /admin/reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
    res.json({ success: true, message: 'Xóa đánh giá thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
