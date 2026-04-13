const Review = require("../models/review");
const Order = require("../models/order");
const mongoose = require("mongoose");

/**
 * Lấy tất cả đánh giá của một sản phẩm
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, status: "approved" })
      .sort({ createdAt: -1 })
      .populate("userId", "name avatar");

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gửi nhiều đánh giá cho một đơn hàng
 */
exports.submitOrderReviews = async (req, res) => {
  try {
    const { orderId, reviews } = req.body;
    console.log("orderId: ", orderId);

    const userId = req.user.id;
    const userName = req.user.name || "Người dùng";

    if (!orderId || !reviews || !Array.isArray(reviews)) {
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu không đầy đủ" });
    }

    // Kiểm tra đơn hàng có tồn tại và thuộc về user không
    const order = await Order.findOne({ _id: orderId, userId });
    console.log("order: ", order);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    // Tạo các đánh giá
    const reviewDocs = reviews.map((rev) => ({
      productId: rev.productId,
      orderId,
      userId,
      userName,
      rating: rev.rating,
      comment: rev.comment,
      status: "pending", // Chờ duyệt
    }));

    await Review.insertMany(reviewDocs);

    // Cập nhật trạng thái đã đánh giá cho đơn hàng
    order.isReviewed = true;
    await order.save();

    res.json({
      success: true,
      message: "Đánh giá đã được gửi và đang chờ duyệt!",
    });
  } catch (error) {
    console.error("Submit reviews error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi gửi đánh giá" });
  }
};
