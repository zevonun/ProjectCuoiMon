const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product');

// ==================== Helper ====================

// ✅ TRẢ VỀ _id CHUẨN CHO FRONTEND (KHÔNG DÙNG id NỮA)
const formatCategory = (c) => ({
  _id: c._id.toString(),      // ✅ GIỮ ĐÚNG TÊN _id
  name: c.name,
  parentId: c.parentId ? c.parentId.toString() : null,
});

// ==================== API Controllers ====================

// ✅✅✅ FIX TRIỆT ĐỂ: KHÔNG TRẢ CATEGORY RÁC, KHÔNG _id
const getAllCategories = async (req, res) => {
  try {
    const data = await Category.find({ _id: { $ne: null } }).lean();

    const cleanData = data
      .filter(item => item && item._id)  // ✅ CHẶN undefined, null
      .map(formatCategory);

    res.json({ success: true, data: cleanData });
  } catch (err) {
    console.error('Lỗi getAllCategories:', err);
    res.status(500).json({ success: false, data: [] });
  }
};

// Lấy category theo ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: 'ID danh mục không hợp lệ' });

    const category = await Category.findById(id).lean();
    if (!category)
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });

    res.json({ success: true, data: formatCategory(category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy category theo name
const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const category = await Category.findOne({ name }).lean();
    if (!category)
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });

    res.json({ success: true, data: formatCategory(category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== Tạo category dùng chung ====================

const createCategory = async (name, parentId = null) => {
  if (!name) name = 'Danh mục mặc định';

  const existing = await Category.findOne({ name, parentId });
  if (existing) return existing;

  const newCategory = new Category({ name, parentId });
  await newCategory.save();
  return newCategory;
};

// ==================== Tạo category API ====================

const createCategoryForAPI = async (req, res) => {
  try {
    let { name, parentId } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Thiếu tên danh mục' });

    if (!parentId || parentId === '') parentId = null;
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId))
      return res.status(400).json({ success: false, message: 'parentId không hợp lệ' });

    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'parentId không tồn tại' });
    }

    const category = await createCategory(name, parentId);
    res.status(201).json({ success: true, data: formatCategory(category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== Xóa category ====================

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: 'ID danh mục không hợp lệ' });

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });

    const hasChild = await Category.findOne({ parentId: id });
    if (hasChild)
      return res.status(400).json({ success: false, message: 'Không thể xóa danh mục đang có danh mục con' });

    await Product.deleteMany({ categoryId: id });
    await Category.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Xóa danh mục và các sản phẩm liên quan thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== Cập nhật category ====================

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, parentId } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Thiếu tên danh mục' });
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: 'ID danh mục không hợp lệ' });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });

    if (!parentId || parentId === '') parentId = null;
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId))
      return res.status(400).json({ success: false, message: 'parentId không hợp lệ' });

    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) return res.status(400).json({ success: false, message: 'parentId không tồn tại' });
    }

    category.name = name;
    category.parentId = parentId;

    await category.save();
    res.status(200).json({ success: true, data: formatCategory(category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ==================== Export ====================

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  createCategory,
  createCategoryForAPI,
  updateCategory,
  deleteCategory,
};
