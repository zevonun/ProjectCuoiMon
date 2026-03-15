// BE/controllers/products.js

const mongoose = require('mongoose');
const Product = require('../models/product');
const Category = require('../models/category');

// ==================== HÀM CHUNG ====================

const formatProduct = (p) => ({
  _id: p._id.toString(),
  id: p._id.toString(),
  ten_sp: p.name || p.ten_sp || 'Chưa có tên',
  gia: p.price || p.gia || 0,
  gia_km: p.sale || p.gia_km || null,
  hinh: p.image || p.hinh || '/img/no-image.jpg',
  categoryId: (p.categoryId || p.id_loai)?.toString?.() || p.categoryId || p.id_loai,
  id_loai: (p.categoryId || p.id_loai)?.toString?.() || p.categoryId || p.id_loai,
  mo_ta: p.description || p.mo_ta,
  ngay: p.ngay || p.createdAt || new Date().toISOString(),
});

// ==================== ADMIN & FRONT ====================

/**
 * GET /api/product
 * Query params:
 *   ?category=<categoryId>   lọc theo danh mục
 *   ?minPrice=<number>       giá từ
 *   ?maxPrice=<number>       giá đến
 *   ?sort=price_asc | price_desc | newest | oldest
 *   ?limit=<number>          giới hạn kết quả (mặc định không giới hạn)
 *   ?page=<number>           phân trang (mặc định 1)
 */
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, limit, page } = req.query;

    // ── Xây dựng filter query ──
    const filter = {};

    if (category) {
      // Nếu là ObjectId hợp lệ → dùng trực tiếp
      // Nếu là slug/tên → lookup Category trước
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.categoryId = category;
      } else {
        // Tìm theo slug (field mới) hoặc fallback normalize name
        const cat = await Category.findOne({
          $or: [
            { slug: category },
            { name: new RegExp('^' + category.replace(/-/g, '[\\s\\-]') + '$', 'i') },
          ]
        }).lean();

        if (!cat) {
          return res.json({ success: true, total: 0, page: 1, limit: 0, data: [] });
        }
        filter.categoryId = cat._id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // ── Xây dựng sort ──
    let sortOption = {};
    switch (sort) {
      case 'price_asc':  sortOption = { price: 1 };  break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'newest':     sortOption = { createdAt: -1, _id: -1 }; break;
      case 'oldest':     sortOption = { createdAt: 1 }; break;
      default:           sortOption = { _id: -1 }; break;
    }

    // ── Phân trang ──
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = parseInt(limit) || 0;
    const skip     = limitNum > 0 ? (pageNum - 1) * limitNum : 0;

    // ── Thực thi query ──
    let query = Product.find(filter).sort(sortOption).lean();
    if (limitNum > 0) query = query.skip(skip).limit(limitNum);

    const [data, total] = await Promise.all([
      query,
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum || total,
      data: data.map(formatProduct),
    });
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
    res.json({ success: true, data: data.map(formatProduct) });
  } catch (err) {
    console.error('Lỗi search:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

// Lấy theo category (route riêng /category/:categoryId — giữ nguyên)
const getProductByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: 'CategoryId không hợp lệ' });
    }
    const data = await Product.find({ categoryId }).lean();
    res.json({ success: true, data: data.map(formatProduct) });
  } catch (err) {
    console.error('Lỗi get by category:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

// ==================== ADMIN ====================

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
    if (!category) return res.status(400).json({ success: false, message: 'Category không tồn tại' });

    const existing = await Product.findOne({ name: new RegExp(`^${name}$`, 'i'), categoryId });
    if (existing) return res.status(409).json({ success: false, message: 'Sản phẩm đã tồn tại trong danh mục này' });

    const newProduct = new Product({
      name, price, sale: sale ?? 0, categoryId,
      image: image || '', description: description || '', brandId: null,
    });

    const saved = await newProduct.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Lỗi createProduct:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const { name, price, sale, categoryId, image, description } = req.body;
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ success: false, message: 'categoryId không hợp lệ' });
      }
      const category = await Category.findById(categoryId);
      if (!category) return res.status(400).json({ success: false, message: 'Category không tồn tại' });
      product.categoryId = categoryId;
    }

    product.name        = name        || product.name;
    product.price       = price       ?? product.price;
    product.sale        = sale        ?? product.sale;
    product.image       = image       || product.image;
    product.description = description || product.description;

    const saved = await product.save();
    res.json({ success: true, data: formatProduct(saved) });
  } catch (err) {
    console.error('Lỗi updateProduct:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

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

const getNewProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ ngay: -1, createdAt: -1, _id: -1 })
      .limit(16).lean();
    res.json({ success: true, data: products.map(formatProduct) });
  } catch (err) {
    console.error('Lỗi getNewProducts:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

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
