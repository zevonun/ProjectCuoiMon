const express = require('express');
const router = express.Router();

const categoriesController = require('../../controllers/categories');

const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');

// ✅ BẮT BUỘC ĐĂNG NHẬP + ADMIN
router.use(verifyToken, isAdmin);

// ✅ ADMIN CRUD CATEGORY
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.patch('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
