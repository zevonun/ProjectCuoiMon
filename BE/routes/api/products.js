const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/products');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');

// GET routes (public)
router.get('/new', productsController.getNewProducts);
router.get('/hot', productsController.getHotProducts);
router.get('/', productsController.getAllProducts);
router.get('/search/:name', productsController.getSearchProductByName);
router.get('/category/:categoryId', productsController.getProductByCategoryId);
router.get('/:id', productsController.getProductById);

// POST / tạo sản phẩm (admin only)
router.post('/', verifyToken, isAdmin, productsController.createProduct);

// PUT / cập nhật sản phẩm
router.put('/:id', productsController.updateProduct);

// DELETE / xóa sản phẩm
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
