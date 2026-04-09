const User = require('../models/user');

/**
 * Require an admin permission flag to access a route.
 * This middleware intentionally loads permissions from DB to prevent client-side spoofing.
 */
const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
      }

      const user = await User.findById(req.user._id).select('role permissions').lean();
      if (!user) {
        return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Chỉ admin mới có quyền truy cập' });
      }

      const hasPermission = !!user.permissions?.[permissionKey];
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập chức năng này',
          permission: permissionKey,
        });
      }

      // attach permissions so downstream handlers can use it if needed
      req.user.permissions = user.permissions || {};

      return next();
    } catch (error) {
      console.error('requirePermission error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền' });
    }
  };
};

module.exports = { requirePermission };

