const Product = require('../models/product');
const Order = require('../models/order'); // phải tồn tại model này

exports.getStats = async (req, res) => {
  try {
    // ✅ TỔNG SẢN PHẨM
    const totalProducts = await Product.countDocuments();

    // ✅ 5 SẢN PHẨM MỚI
    const latestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price createdAt');

    // ✅ TỔNG DOANH THU
    const totalRevenueData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;

    // ✅ DOANH THU THEO THÁNG
    const revenueByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalProducts,
      latestProducts,
      totalRevenue,
      revenueByMonth
    });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard error' });
  }
};
