const User = require('../models/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// ✅ Helper: loại bỏ các field nhạy cảm khỏi response
const safeUser = (item) => ({
  id: item._id,
  name: item.name,
  email: item.email,
  phone: item.phone,
  address: item.address,
  role: item.role,
  googleId: item.googleId ? true : undefined,
  createdAt: item.createdAt,  // ← thêm dòng này
});

const getAllUsers = async (req, res) => {
  try {
    // ✅ .select('-password -refreshToken') – không kéo các field nhạy cảm từ DB
    const data = await User.find({}).select('-password -refreshToken');
    res.json(data.map(safeUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, address, password: hashedPassword });
    const savedUser = await newUser.save();

    res.status(201).json(safeUser(savedUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.status(200).json(safeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getUserById = async (req, res) => {
  try {
    const data = await User.findById(req.params.id).select('-password -refreshToken');
    if (!data) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json(safeUser(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Người dùng đã được xóa thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


module.exports = { getAllUsers, createUser, updateUser, getUserById, deleteUser };