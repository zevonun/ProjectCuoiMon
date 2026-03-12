const express = require('express');
const router = express.Router();

const productsController = require('../../controllers/products');
const upload = require('../../services/Upload');

const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');

// ✅ BẮT BUỘC ĐĂNG NHẬP + ADMIN
router.use(verifyToken, isAdmin);

// ✅ ADMIN CRUD PRODUCT
router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.patch('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

// ✅ UPLOAD IMAGE
router.post('/uploadfile', upload.single('image'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.json({ status: 0, link: '' });

    const url = `/images/${file.filename}`;
    return res.json({ status: 1, url });
  } catch (error) {
    console.error('Upload image error:', error);
    return res.json({ status: 0, link: '' });
  }
});

module.exports = router;
