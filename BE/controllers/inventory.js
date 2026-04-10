// BE/controllers/inventory.js
const Product = require('../models/product');
const Order = require('../models/order');
const mongoose = require('mongoose');

/**
 * Lấy thống kê tồn kho chính
 * Query: ?page=1&limit=20&search=...&sort=stock_asc|stock_desc|name_asc|name_desc
 */
exports.getInventoryList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort, status } = req.query;
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Lọc theo trạng thái tồn kho
    if (status === 'out') {
      filter.$or = [{ stock: 0 }, { stock: { $lte: 0 } }, { stock: { $exists: false } }, { stock: null }];
    } else if (status === 'low') {
      filter.stock = { $gte: 1, $lte: 5 };
    } else if (status === 'stable') {
      filter.stock = { $gt: 5 };
    }

    let sortOption = { name: 1 };
    if (sort === 'stock_asc') sortOption = { stock: 1 };
    else if (sort === 'stock_desc') sortOption = { stock: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: products.map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock || 0,
        image: p.image || ''
      })),
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy các sản phẩm sắp hết hàng (stock < 5)
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    // Lọc các sp có tồn kho từ 1 đến 5
    const filter = { 
      stock: { $gte: 1, $lte: 5 }
    };
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ stock: 1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: products.map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock || 0
      })),
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Láy Top 10 sản phẩm bán chạy nhất
 */
exports.getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          id: '$_id',
          name: '$productInfo.name',
          totalSold: '$totalQuantity'
        }
      }
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy các sản phẩm đã hết hàng (stock = 0)
 */
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    // Lọc chính xác các sp bằng 0 hoặc không tồn tại/null
    const filter = { 
      $or: [
        { stock: 0 }, 
        { stock: { $lte: 0 } },
        { stock: { $exists: false } }, 
        { stock: null }
      ] 
    };
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: products.map(p => ({
        id: p._id,
        name: p.name,
        stock: 0
      })),
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
