// BE/middleware/isAdmin.js
const isAdmin = (req, res, next) => {
  try {
    // Kiểm tra xem user đã đăng nhập chưa
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    // Kiểm tra role có phải admin không
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền truy cập'
      });
    }

    // Nếu là admin, cho phép tiếp tục
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { isAdmin };