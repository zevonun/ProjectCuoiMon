const express = require('express');
const router = express.Router();
const controller = require('../../controllers/reviews');
const { verifyToken } = require('../../middleware/authen');

// Public route: Lấy đánh giá sản phẩm
router.get('/product/:productId', controller.getProductReviews);

// Private route: Gửi đánh giá
router.post('/submit', verifyToken, controller.submitOrderReviews);

module.exports = router;
