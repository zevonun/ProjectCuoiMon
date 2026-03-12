const User = require('../models/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


const getAllUsers = async (req, res) => {
  try {
    let data = await User.find({});
    let users = data.map(item => ({
      id: item._id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      address: item.address,
      password: item.password
    }));
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const createUser = async (req, res) => {
  try {
    let { name, email, phone, address, password } = req.body;

    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    
    let existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }
    

    let hashedPassword = await bcrypt.hash(password, 10);
    let newUser = new User({
      name,
      email,
      phone,
      address,
      password: hashedPassword
    });

    let savedUser = await newUser.save();
    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      address: savedUser.address
    });
  } catch (err) {
    console.error(err); // thêm dòng này để xem log chi tiết
    res.status(500).json({ message: 'Lỗi server' });
  }
};
const updateUser = async (req, res) => {
  try {
    let id = req.params.id;
    let { name, email, phone, address, password } = req.body;
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address
    });
  }
  catch (err) {
    console.error(err); 
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getUserById = async (req, res) => {
  try {
    let id = req.params.id;
    let data = await User.findById(id);
    if (data) {
      res.json({    
        id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address
      });
    }
    else {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Xóa người dùng
    await User.findByIdAndDelete(id);

    // Phản hồi thành công
    res.status(200).json({ message: 'Người dùng đã được xóa thành công' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};




module.exports = { getAllUsers, createUser, updateUser , getUserById, deleteUser };