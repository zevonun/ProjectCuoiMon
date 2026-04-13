const Banner = require('../models/banner');

// Lấy danh sách banner (hỗ trợ lọc theo position và active)
exports.getBanners = async (req, res) => {
  try {
    const { position, active } = req.query;
    const filter = {};
    if (position) filter.position = position;
    if (active !== undefined) filter.active = active === 'true';

    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Thêm banner mới
exports.createBanner = async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    const savedBanner = await newBanner.save();
    res.status(201).json({ success: true, data: savedBanner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Sửa banner
exports.updateBanner = async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy banner" });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xóa banner
exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
