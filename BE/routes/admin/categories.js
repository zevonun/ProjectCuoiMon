const express = require('express');
const router = express.Router();

const categoriesController = require('../../controllers/categories');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');

// ── Public routes ──
router.get('/', categoriesController.getAllCategories);
router.get('/name/:name', categoriesController.getCategoryByName); // phải đặt trước /:id
router.get('/:id', categoriesController.getCategoryById);

// ✅ Write routes yêu cầu verifyToken + isAdmin
router.post('/', verifyToken, isAdmin, requirePermission('manage_categories'), categoriesController.createCategoryForAPI);
router.put('/:id', verifyToken, isAdmin, requirePermission('manage_categories'), categoriesController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, requirePermission('manage_categories'), categoriesController.deleteCategory);

module.exports = router;