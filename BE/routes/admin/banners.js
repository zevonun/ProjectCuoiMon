const express = require('express');
const router = express.Router();
const Banner = require('../../models/banner');
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');

router.use(verifyToken, isAdmin, requirePermission('manage_banners'));

// GET /admin/banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin/banners
router.post('/', async (req, res) => {
  try {
    const { title, image, link, active } = req.body;

    const banner = new Banner({
      title,
      image,
      link,
      active
    });

    await banner.save();
    res.json(banner);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /admin/banners/:id
router.put('/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(banner);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /admin/banners/:id
router.delete('/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
