const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/banners');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');

router.use(verifyToken, isAdmin, requirePermission('manage_banners'));

// ✅ Routes sử dụng controller tập trung
router.get('/', bannerController.getBanners);
router.post('/', bannerController.createBanner);
router.put('/:id', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
