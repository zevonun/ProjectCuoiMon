const express = require('express');
const router = express.Router();

const productsController = require('../../controllers/products');
const upload = require('../../services/Upload');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');

// Tất cả route admin đều yêu cầu đăng nhập + quyền admin
router.use(verifyToken, isAdmin, requirePermission('manage_products'));

// CRUD sản phẩm
router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.patch('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

// Upload ảnh sản phẩm
router.post('/uploadfile', upload.single('image'), (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.json({ status: 0, url: '' });

    // ✅ Sửa URL path cho đúng với Upload.js (lưu vào public/uploads/products/)
    const url = `/uploads/products/${file.filename}`;
    return res.json({ status: 1, url });
  } catch (error) {
    console.error('Upload image error:', error);
    return res.json({ status: 0, url: '' });
  }
});

module.exports = router;