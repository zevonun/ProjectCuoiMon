var express = require('express');
var router = express.Router();

const usersController = require('../../controllers/users');
const { verifyToken } = require('../../middleware/authen'); // ✅ LẤY ĐÚNG FUNCTION
const { isAdmin } = require('../../middleware/isAdmin');    // ✅ ADMIN CHECK

// ✅ Tất cả route admin đều phải:
// 1. Đăng nhập hợp lệ
// 2. Có quyền admin
router.use(verifyToken, isAdmin);

// 👥 CRUD người dùng admin
router.get('/', usersController.getAllUsers);     
router.post('/', usersController.createUser);     
router.put('/:id', usersController.updateUser);   
router.get('/:id', usersController.getUserById);  
router.delete('/:id', usersController.deleteUser);

module.exports = router;
