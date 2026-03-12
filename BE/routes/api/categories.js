const express = require('express');
const router = express.Router();
const categoriesController = require('../../controllers/categories');

// GET tất cả category
router.get('/', categoriesController.getAllCategories);

// GET theo tên (phải đặt trước /:id)
router.get('/name/:name', categoriesController.getCategoryByName);

// GET theo id
router.get('/:id', categoriesController.getCategoryById);

// POST tạo mới category
router.post('/', categoriesController.createCategoryForAPI);

// PUT cập nhật category theo id
router.put('/:id', categoriesController.updateCategory);

// DELETE xóa category theo id
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
