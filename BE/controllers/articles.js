const Article = require('../models/article');
const mongoose = require('mongoose');

/**
 * Format Article for API response
 */
const formatArticle = (a) => ({
  _id: a._id.toString(),
  id: a._id.toString(),
  title_vi: a.title_vi,
  slug_vi: a.slug_vi,
  keyword: a.keyword || '',
  alt: a.alt || '',
  image: a.image || '/img/no-image.jpg',
  short_description_vi: a.short_description_vi || '',
  content_vi: a.content_vi || '',
  num: a.num || 0,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

/**
 * GET /api/articles
 * Query params: ?page=1&limit=10&search=...
 */
const getAllArticles = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    
    const filter = {};
    if (search) {
      filter.title_vi = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Article.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      data: data.map(formatArticle),
    });
  } catch (err) {
    console.error('getAllArticles error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/articles/:id
 */
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const article = await Article.findById(id).lean();
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }
    res.json({ success: true, data: formatArticle(article) });
  } catch (err) {
    console.error('getArticleById error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/articles/slug/:slug
 */
const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug_vi: slug }).lean();
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }
    res.json({ success: true, data: formatArticle(article) });
  } catch (err) {
    console.error('getArticleBySlug error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/articles
 */
const createArticle = async (req, res) => {
  try {
    const { title_vi, keyword, alt, image, short_description_vi, content_vi, num } = req.body;

    if (!title_vi || !content_vi) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc' });
    }

    const newArticle = new Article({
      title_vi,
      keyword,
      alt,
      image,
      short_description_vi,
      content_vi,
      num: num || 0,
    });

    const saved = await newArticle.save();
    res.status(201).json({ success: true, data: formatArticle(saved) });
  } catch (err) {
    console.error('createArticle error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PUT /api/articles/:id
 */
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const { title_vi, keyword, alt, image, short_description_vi, content_vi, num } = req.body;
    
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    article.title_vi = title_vi || article.title_vi;
    article.keyword = keyword !== undefined ? keyword : article.keyword;
    article.alt = alt !== undefined ? alt : article.alt;
    article.image = image !== undefined ? image : article.image;
    article.short_description_vi = short_description_vi !== undefined ? short_description_vi : article.short_description_vi;
    article.content_vi = content_vi || article.content_vi;
    article.num = num !== undefined ? num : article.num;

    const saved = await article.save();
    res.json({ success: true, data: formatArticle(saved) });
  } catch (err) {
    console.error('updateArticle error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * DELETE /api/articles/:id
 */
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const deleted = await Article.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    res.json({ success: true, message: 'Xóa bài viết thành công' });
  } catch (err) {
    console.error('deleteArticle error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
};
