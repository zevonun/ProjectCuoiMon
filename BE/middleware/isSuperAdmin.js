// middleware/isSuperAdmin.js
const isSuperAdmin = (req, res, next) => {
  try {
    // User phải đã được xác thực (từ verifyToken)
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    // Kiểm tra adminLevel === 'super_admin'
    if (req.user.adminLevel !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Chỉ Super Admin mới có quyền truy cập' 
      });
    }

    next();
  } catch (err) {
    console.error('isSuperAdmin error:', err);
    res.status(500).json({ message: 'Lỗi kiểm tra quyền' });
  }
};

module.exports = isSuperAdmin;
