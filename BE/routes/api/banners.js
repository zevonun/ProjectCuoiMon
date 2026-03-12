const express = require('express');
const router = express.Router();
const Banner = require('../../models/banner');

// GET /api/banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/banners/:id
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
