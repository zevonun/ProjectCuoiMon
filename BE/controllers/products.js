// BE/controllers/products.js
// → DÀNH RIÊNG CHO ADMIN + FRONTEND
// → BẮT LỖI NGHIÊM NGẶT + TRẢ DATA ĐẸP CHO FRONTEND

const mongoose = require('mongoose');
const Product = require('../models/product');
const Category = require('../models/category');

// ==================== HÀM CHUNG ====================

// Helper format product
const formatProduct = (p) => ({
  _id: p._id.toString(),
  id: p._id.toString(),
  ten_sp: p.name || p.ten_sp || 'Chưa có tên',
  gia: p.price || p.gia || 0,
  gia_km: p.sale || p.gia_km || null,
  hinh: p.image || p.hinh || '/img/no-image.jpg',
  categoryId: (p.categoryId || p.id_loai)?.toString?.() || p.categoryId || p.id_loai,
  id_loai: (p.categoryId || p.id_loai)?.toString?.() || p.categoryId || p.id_loai, // keep for backward compat
  mo_ta: p.description || p.mo_ta,
  ngay: p.ngay || p.createdAt || new Date().toISOString(),
});

// ==================== ADMIN & FRONT ====================

// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const data = await Product.find({}).lean();
    const products = data.map(formatProduct);
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Lỗi getAllProducts:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const data = await Product.findById(id).lean();
    if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: formatProduct(data) });
  } catch (err) {
    console.error('Lỗi getProductById:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Tìm kiếm theo tên
const getSearchProductByName = async (req, res) => {
  try {
    const name = req.params.name;
    if (!name) return res.status(400).json({ success: false, message: 'Thiếu tên tìm kiếm' });
    const data = await Product.find({ name: new RegExp(name, 'i') }).lean();
    const products = data.map(formatProduct);
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Lỗi search:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

// Lấy theo category
const getProductByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: 'CategoryId không hợp lệ' });
    }
    const data = await Product.find({ categoryId }).lean();
    const products = data.map(formatProduct);
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Lỗi get by category:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

// ==================== ADMIN ====================

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const { name, price, categoryId, sale, image, description } = req.body;

    if (!name || price == null || !categoryId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: 'categoryId không hợp lệ' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category không tồn tại' });
    }

    const existing = await Product.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      categoryId,
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Sản phẩm đã tồn tại trong danh mục này' });
    }

    const newProduct = new Product({
      name,
      price,
      sale: sale ?? 0,
      categoryId,
      image: image || '',
      description: description || '',
      brandId: null, // ✅ FIX CHÍNH Ở ĐÂY
    });

    const saved = await newProduct.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Lỗi createProduct:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};


// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const { name, price, sale, categoryId, image, description } = req.body;
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: 'categoryId không hợp lệ' });
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(400).json({ success: false, message: 'Category không tồn tại' });
      product.categoryId = categoryId;
    }

    product.name = name || product.name;
    product.price = price ?? product.price;
    product.sale = sale ?? product.sale;
    product.image = image || product.image;
    product.description = description || product.description;

    const saved = await product.save();
    res.json({ success: true, data: formatProduct(saved) });
  } catch (err) {
    console.error('Lỗi updateProduct:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    await product.deleteOne();
    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    console.error('Lỗi deleteProduct:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== FRONT – SLIDER ====================

// Sản phẩm mới
const getNewProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ ngay: -1, createdAt: -1, _id: -1 })
      .limit(16)
      .lean();
    res.json({ success: true, data: products.map(formatProduct) });
  } catch (err) {
    console.error('Lỗi getNewProducts:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

// Sản phẩm hot
const getHotProducts = async (req, res) => {
  try {
    let products = await Product.find({ hot: { $gt: 0 } }).limit(16).lean();
    if (products.length === 0) {
      const all = await Product.find({}).limit(40).lean();
      products = all.sort(() => 0.5 - Math.random()).slice(0, 16);
    }
    res.json({ success: true, data: products.map(formatProduct) });
  } catch (err) {
    console.error('Lỗi getHotProducts:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getSearchProductByName,
  getProductByCategoryId,
  createProduct,
  updateProduct,
  deleteProduct,
  getNewProducts,
  getHotProducts,
};
