const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/banners');

// GET /api/banners (Public)
router.get('/', bannerController.getBanners);

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
