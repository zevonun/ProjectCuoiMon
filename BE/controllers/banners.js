const Banner = require('../models/banner');

// Lấy danh sách banner
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm banner mới
exports.createBanner = async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Sửa banner
exports.updateBanner = async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa banner
exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
