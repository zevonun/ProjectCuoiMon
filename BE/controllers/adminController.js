// controllers/adminController.js
const User = require('../models/user');
const AdminLog = require('../models/adminLog');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// ✅ Helper: tạo log
const createLog = async (adminId, adminName, adminEmail, action, targetAdminId, targetAdminName, targetAdminEmail, details, ipAddress, status, message) => {
  try {
    await AdminLog.create({
      adminId,
      adminName,
      adminEmail,
      action,
      targetAdminId,
      targetAdminName,
      targetAdminEmail,
      details,
      ipAddress: ipAddress || null,
      status,
      message,
    });
  } catch (err) {
    console.error('Error creating log:', err);
  }
};

// ✅ Helper: trả về admin safely
const safeAdmin = (item) => ({
  id: item._id,
  name: item.name,
  email: item.email,
  phone: item.phone,
  adminLevel: item.adminLevel,
  permissions: item.permissions || {},
  isActive: item.isActive,
  createdBy: item.createdBy,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// ✅ Lấy danh sách tất cả admin (chỉ Super Admin)
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password -refreshToken -googleId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(admins.map(safeAdmin));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ✅ Tạo admin mới (chỉ Super Admin)
const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, address, password, adminLevel, permissions } = req.body;
    const superAdminId = req.user._id;
    const superAdminName = req.user.name;
    const superAdminEmail = req.user.email;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // ✅ Validate
    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    if (adminLevel !== 'admin' && adminLevel !== 'super_admin') {
      return res.status(400).json({ message: 'Admin level không hợp lệ' });
    }

    // ✅ Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await createLog(superAdminId, superAdminName, superAdminEmail, 'create_admin', null, null, null, { email }, ipAddress, 'failed', 'Email đã tồn tại');
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // ✅ Kiểm tra phone tồn tại
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      await createLog(superAdminId, superAdminName, superAdminEmail, 'create_admin', null, null, null, { phone }, ipAddress, 'failed', 'Số điện thoại đã tồn tại');
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }

    // ✅ Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Tạo admin
    const newAdmin = new User({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: 'admin',
      adminLevel: adminLevel || 'admin',
      createdBy: superAdminId,
      isActive: true,
      permissions: {
        manage_products: permissions?.manage_products ?? false,
        manage_orders: permissions?.manage_orders ?? false,
        manage_users: permissions?.manage_users ?? false,
        manage_banners: permissions?.manage_banners ?? false,
        manage_categories: permissions?.manage_categories ?? false,
        manage_vouchers: permissions?.manage_vouchers ?? false,
        manage_admins: permissions?.manage_admins ?? false,
      },
    });

    const savedAdmin = await newAdmin.save();

    // ✅ Log thành công
    await createLog(superAdminId, superAdminName, superAdminEmail, 'create_admin', savedAdmin._id, name, email, { adminLevel, permissions }, ipAddress, 'success', `Tạo admin ${email}`);

    res.status(201).json(safeAdmin(savedAdmin));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ✅ Cập nhật admin (chỉ Super Admin)
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, adminLevel, permissions, isActive } = req.body;
    const superAdminId = req.user._id;
    const superAdminName = req.user.name;
    const superAdminEmail = req.user.email;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // ✅ Tìm admin
    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin không tồn tại' });
    }

    // ✅ Không cho phép Super Admin tự xóa quyền
    if (admin._id.toString() === superAdminId.toString() && adminLevel && adminLevel !== 'super_admin') {
      return res.status(403).json({ message: 'Không thể thay đổi cấp bậc của chính mình' });
    }

    // ✅ Lưu giá trị cũ để log
    const oldValues = {
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      adminLevel: admin.adminLevel,
      isActive: admin.isActive,
    };

    // ✅ Cập nhật
    if (name) admin.name = name;
    if (email && email !== admin.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      admin.email = email;
    }
    if (phone) admin.phone = phone;
    if (address) admin.address = address;
    if (adminLevel) admin.adminLevel = adminLevel;
    if (isActive !== undefined) admin.isActive = isActive;
    if (permissions) {
      admin.permissions = {
        manage_products: permissions.manage_products ?? admin.permissions.manage_products,
        manage_orders: permissions.manage_orders ?? admin.permissions.manage_orders,
        manage_users: permissions.manage_users ?? admin.permissions.manage_users,
        manage_banners: permissions.manage_banners ?? admin.permissions.manage_banners,
        manage_categories: permissions.manage_categories ?? admin.permissions.manage_categories,
        manage_vouchers: permissions.manage_vouchers ?? admin.permissions.manage_vouchers,
        manage_admins: permissions.manage_admins ?? admin.permissions.manage_admins,
      };
    }

    const updatedAdmin = await admin.save();

    // ✅ Log
    await createLog(superAdminId, superAdminName, superAdminEmail, 'update_admin', id, admin.name, admin.email, { oldValues, newValues: { name, email, adminLevel, isActive } }, ipAddress, 'success', `Cập nhật admin ${email}`);

    res.json(safeAdmin(updatedAdmin));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ✅ Deactivate admin (chỉ Super Admin)
const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user._id;
    const superAdminName = req.user.name;
    const superAdminEmail = req.user.email;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // ✅ Không cho phép Super Admin tự deactivate
    if (id === superAdminId.toString()) {
      return res.status(403).json({ message: 'Không thể vô hiệu hóa chính mình' });
    }

    // ✅ Tìm admin
    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin không tồn tại' });
    }

    admin.isActive = false;
    await admin.save();

    // ✅ Log
    await createLog(superAdminId, superAdminName, superAdminEmail, 'deactivate_admin', id, admin.name, admin.email, {}, ipAddress, 'success', `Vô hiệu hóa admin ${admin.email}`);

    res.json({ message: 'Đã vô hiệu hóa admin', admin: safeAdmin(admin) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ✅ Activate admin (chỉ Super Admin)
const activateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user._id;
    const superAdminName = req.user.name;
    const superAdminEmail = req.user.email;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // ✅ Tìm admin
    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin không tồn tại' });
    }

    admin.isActive = true;
    await admin.save();

    // ✅ Log
    await createLog(superAdminId, superAdminName, superAdminEmail, 'activate_admin', id, admin.name, admin.email, {}, ipAddress, 'success', `Kích hoạt admin ${admin.email}`);

    res.json({ message: 'Đã kích hoạt admin', admin: safeAdmin(admin) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ✅ Xóa admin (chỉ Super Admin)
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const superAdminId = req.user._id;
    const superAdminName = req.user.name;
    const superAdminEmail = req.user.email;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // ✅ Không cho phép Super Admin tự xóa
    if (id === superAdminId.toString()) {
      return res.status(403).json({ message: 'Không thể xóa chính mình' });
    }

    // ✅ Tìm admin
    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin không tồn tại' });
    }

    // ✅ Lưu tên trước khi xóa
    const adminName = admin.name;
    const adminEmail = admin.email;

    await User.findByIdAndDelete(id);

    // ✅ Log
    await createLog(superAdminId, superAdminName, superAdminEmail, 'delete_admin', id, adminName, adminEmail, {}, ipAddress, 'success', `Xóa admin ${adminEmail}`);

    res.json({ message: 'Đã xóa admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ✅ Lấy logs
const getLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate('adminId', 'name email')
      .populate('targetAdminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { 
  getAllAdmins, 
  createAdmin, 
  updateAdmin, 
  deactivateAdmin, 
  activateAdmin, 
  deleteAdmin,
  getLogs
};
