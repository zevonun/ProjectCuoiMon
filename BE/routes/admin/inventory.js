// BE/routes/admin/inventory.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/inventory');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');

router.use(verifyToken, isAdmin);

router.get('/list', inventoryController.getInventoryList);
router.get('/low-stock', inventoryController.getLowStockProducts);
router.get('/out-of-stock', inventoryController.getOutOfStockProducts);
router.get('/top-selling', inventoryController.getTopSellingProducts);

module.exports = router;
