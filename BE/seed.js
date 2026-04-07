// seed.js – CHẠY LẦN DUY NHẤT ĐỂ TẠO DỮ LIỆU THẬT
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Category = require('./models/category');
const Product = require('./models/product');
const User = require('./models/user');




async function seed() {
  await mongoose.connect('mongodb://localhost:27017/mybeauty');

  // Xóa dữ liệu cũ
  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({ role: 'admin' }); // ✅ Xóa admin cũ

  // ✅ TẠO ADMIN 1
  console.log('👤 Tạo Admin 1...');
  const admin1Password = await bcrypt.hash('Admin@123456', 10);
  const admin1 = new User({
    name: 'Admin Quản Lý',
    email: 'Phuochhps40071@gmail.com',
    phone: '0900000001',
    address: 'Hà Nội',
    password: admin1Password,
    role: 'admin',
    permissions: {
      manage_products: true,
      manage_orders: true,
      manage_users: true,
      manage_banners: true,
      manage_categories: true,
      manage_vouchers: true,
      manage_admins: true,
    },
  });
  await admin1.save();
  console.log('✅ Admin 1 created: admin@mybeauty.com / Admin@123456');

  // ✅ TẠO ADMIN 2
  console.log('👤 Tạo Admin 2...');
  const admin2Password = await bcrypt.hash('Admin2@123456', 10);
  const admin2 = new User({
    name: 'Admin Sản Phẩm',
    email: 'ph940738@gmail.com',
    phone: '0900000002',
    address: 'Hồ Chí Minh',
    password: admin2Password,
    role: 'admin',
    permissions: {
      manage_products: true,
      manage_orders: true,
      manage_users: false,
      manage_banners: true,
      manage_categories: true,
      manage_vouchers: true,
      manage_admins: true,
    },
  });
  await admin2.save();
  console.log('✅ Admin 2 created: adminproduct@mybeauty.com / Admin2@123456');

  // Tạo danh mục + lưu map tên → id
  const catMap = {};
  for (const name of categories) {
    const cat = new Category({ name });
    await cat.save();
    catMap[name] = cat._id;
  }

  // Tạo sản phẩm
  for (const p of sampleProducts) {
    const product = new Product({
      name: p.name,
      price: p.price,
      sale: p.sale || 0,
      image: p.image,
      categoryId: catMap[p.categoryName],
      hot: p.hot || 0,
    });
    await product.save();
  }

  console.log("SEED THÀNH CÔNG! ĐÃ TẠO 7 DANH MỤC + 10 SẢN PHẨM THẬT");
  console.log("TRUY CẬP NGAY: http://localhost:3000");
  process.exit();
}

seed().catch(err => console.log(err));