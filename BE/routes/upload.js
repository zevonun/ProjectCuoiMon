// routes/upload.js
const express = require('express');
const router = express.Router();
const upload = require('../services/Upload');

// POST /api/upload/:type
router.post('/:type', upload.single('image'), (req, res) => {
  try {
    const { file, params } = req;
    if (!file) return res.json({ success: false, url: '' });

    // trả về url dùng bởi frontend: /uploads/{type}/{filename}
    const url = `/uploads/${params.type}/${file.filename}`;
    return res.json({ success: true, url });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ success: false, url: '' });
  }
});

module.exports = router;
