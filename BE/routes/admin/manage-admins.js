// routes/admin/manage-admins.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/authen');
const { isAdmin } = require('../../middleware/isAdmin');
const { requirePermission } = require('../../middleware/requirePermission');
const {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deactivateAdmin,
  activateAdmin,
  deleteAdmin,
  getLogs,
} = require('../../controllers/adminController');

// ✅ Tất cả route cần: verifyToken -> isAdmin -> permission manage_admins
router.use(verifyToken, isAdmin, requirePermission('manage_admins'));

// ✅ GET - Danh sách tất cả admin
router.get('/', getAllAdmins);

// ✅ POST - Tạo admin mới
router.post('/', createAdmin);

// ✅ PUT - Cập nhật admin
router.put('/:id', updateAdmin);

// ✅ PATCH - Deactivate admin
router.patch('/:id/deactivate', deactivateAdmin);

// ✅ PATCH - Activate admin
router.patch('/:id/activate', activateAdmin);

// ✅ DELETE - Xóa admin
router.delete('/:id', deleteAdmin);

// ✅ GET - Xem logs
router.get('/logs/all', getLogs);

module.exports = router;
