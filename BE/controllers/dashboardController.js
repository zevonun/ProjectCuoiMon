const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

exports.getStats = async (req, res) => {
  try {
    // ── TỔNG QUAN ──
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();

    // ── TỔNG DOANH THU (chỉ đơn delivered) ──
    const totalRevenueData = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // ── DOANH THU THEO THÁNG ──
    const revenueByMonth = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // ── TÌNH TRẠNG ĐƠN HÀNG ──
    const orderStatusData = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const orderStatus = orderStatusData.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // ── ĐƠN HÀNG MỚI (10 đơn gần nhất) ──
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId customerInfo totalPrice status createdAt');

    // ── SẢN PHẨM SẮP HẾT HÀNG (stock <= 10) ──
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
      .sort({ stock: 1 })
      .limit(10)
      .select('name stock price');

    // ── SẢN PHẨM BÁN CHẠY ──
    const topSellingProducts = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped', 'confirmed'] } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalSold: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          let: { pid: { $toObjectId: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pid'] } } }],
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          name: '$product.name',
          price: '$product.price',
          image: '$product.image'
        }
      }
    ]);

    // ── SẢN PHẨM ĐÁNH GIÁ CAO ──
    let topRatedProducts = [];
    try {
      const Review = require('../models/review');
      topRatedProducts = await Review.aggregate([
        {
          $group: {
            _id: '$productId',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        },
        { $match: { count: { $gte: 1 } } },
        { $sort: { avgRating: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            avgRating: { $round: ['$avgRating', 1] },
            count: 1,
            name: '$product.name',
            price: '$product.price',
            image: '$product.image'
          }
        }
      ]);
    } catch (e) {
      topRatedProducts = [];
    }

    // ── 5 SẢN PHẨM MỚI NHẤT ──
    const latestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price createdAt stock');

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      revenueByMonth,
      orderStatus,
      latestOrders,
      lowStockProducts,
      topSellingProducts,
      topRatedProducts,
      latestProducts,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Dashboard error', error: error.message });
  }
};
