const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/products');

// GET routes
router.get('/new', productsController.getNewProducts);
router.get('/hot', productsController.getHotProducts);
router.get('/', productsController.getAllProducts);
router.get('/search/:name', productsController.getSearchProductByName);
router.get('/category/:categoryId', productsController.getProductByCategoryId);
router.get('/:id', productsController.getProductById);

// POST / tạo sản phẩm
router.post('/', productsController.createProduct);

// PUT / cập nhật sản phẩm
router.put('/:id', productsController.updateProduct);

// DELETE / xóa sản phẩm
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
