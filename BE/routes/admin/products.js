const express = require('express');
const router = express.Router();

const productsController = require('../../controllers/products');
const upload = require('../../services/Upload');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');

router.use(verifyToken, isAdmin, requirePermission('manage_products'));

router.get('/:id', productsController.getProductById);
router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.patch('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

router.post('/uploadfile', upload.single('image'), (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.json({ status: 0, url: '' });

    const url = `/uploads/products/${file.filename}`;
    return res.json({ status: 1, url });
  } catch (error) {
    console.error('Upload image error:', error);
    return res.json({ status: 0, url: '' });
  }
});

module.exports = router;
