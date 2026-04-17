const Review = require("../models/review");
const Order = require("../models/order");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
 * Hàm phân tích đánh giá bằng AI
 */
async function analyzeReview(comment) {
  if (!comment || comment.trim().length < 2) return "approved"; // Comment quá ngắn coi như sạch

  try {
    const prompt = `Bạn là một chuyên gia kiểm duyệt nội dung. Hãy phân tích nội dung đánh giá sau đây: "${comment}".
    Yêu cầu:
    1. Kiểm tra xem nội dung có chứa từ ngữ tục tĩu, công kích, quấy rối, thù thịnh hoặc vi phạm tiêu chuẩn cộng đồng không.
    2. Nếu nội dung TRONG SẠCH và HỢP LỆ, hãy trả về duy nhất từ: approved
    3. Nếu nội dung VI PHẠM (tục tĩu, xúc phạm), hãy trả về duy nhất từ: rejected
    Chỉ trả về 1 từ duy nhất, không giải thích gì thêm.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().toLowerCase().trim();

    return text.includes("approved") ? "approved" : "rejected";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "pending"; // Nếu lỗi AI, để ở trạng thái chờ duyệt thủ công
  }
}

/**
 * Gửi nhiều đánh giá cho một đơn hàng
 */
exports.submitOrderReviews = async (req, res) => {
  try {
    const { orderId, reviews } = req.body;
    const userId = req.user.id;
    const userName = req.user.name || "Người dùng";

    if (!orderId || !reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ success: false, message: "Dữ liệu không đầy đủ" });
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    // Xử lý từng đánh giá với AI
    const reviewDocs = await Promise.all(
      reviews.map(async (rev) => {
        const aiStatus = await analyzeReview(rev.comment);
        return {
          productId: rev.productId,
          orderId,
          userId,
          userName,
          rating: rev.rating,
          comment: rev.comment,
          status: aiStatus,
        };
      })
    );

    await Review.insertMany(reviewDocs);

    // Cập nhật trạng thái đã đánh giá cho đơn hàng
    order.isReviewed = true;
    await order.save();

    const approvedCount = reviewDocs.filter(r => r.status === 'approved').length;
    const message = approvedCount === reviewDocs.length 
      ? "Đánh giá của bạn đã được duyệt tự động và xuất bản!"
      : "Đánh giá đã được gửi! Một số nội dung cần admin kiểm duyệt thêm.";

    res.json({
      success: true,
      message,
      data: reviewDocs.map(r => ({ productId: r.productId, status: r.status }))
    });
  } catch (error) {
    console.error("Submit reviews error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi gửi đánh giá" });
  }
};
