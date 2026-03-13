const express = require('express');
const router = express.Router();

const productsController = require('../../controllers/products');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');

// ── Public routes (không cần đăng nhập) ──
router.get('/new', productsController.getNewProducts);
router.get('/hot', productsController.getHotProducts);
router.get('/search/:name', productsController.getSearchProductByName);
router.get('/category/:categoryId', productsController.getProductByCategoryId);
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

// ── Admin-only routes ──
router.post('/', verifyToken, isAdmin, productsController.createProduct);
// ✅ PUT và DELETE yêu cầu verifyToken + isAdmin
router.put('/:id', verifyToken, isAdmin, productsController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productsController.deleteProduct);

module.exports = router;