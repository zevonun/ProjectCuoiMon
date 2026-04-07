// BE/routes/api/articles.js
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/articles');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');

// Routes PUBLIC (có thể để xem công khai, hoặc chỉ admin — theo yêu cầu là quản lý admin-frontend)
router.get('/', controller.getAllArticles);
router.get('/:id', controller.getArticleById);
router.get('/slug/:slug', controller.getArticleBySlug);

// Routes ADMIN
router.post('/', verifyToken, isAdmin, controller.createArticle);
router.put('/:id', verifyToken, isAdmin, controller.updateArticle);
router.delete('/:id', verifyToken, isAdmin, controller.deleteArticle);

module.exports = router;
