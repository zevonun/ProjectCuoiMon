// BE/scripts/seedCategories.js
// Chạy 1 lần: node scripts/seedCategories.js
// Seed đầy đủ danh mục cha + con vào MongoDB

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/category');

const toSlug = (str) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

// Cấu trúc danh mục: { tên cha: [tên con, ...] }
const CATEGORY_TREE = {
  'Sale': [
    'Combo chăm sóc da', 'Combo chăm sóc tóc',
    'Combo chăm sóc môi', 'Combo khác', 'Black Green Day',
  ],
  'Trang Điểm': [
    'Son dưỡng môi', 'Son màu', 'Tẩy da chết môi',
    'Kem nền', 'Kem má',
  ],
  'Da': [
    'Tẩy trang - rửa mặt', 'Toner - xịt khoáng',
    'Dưỡng da', 'Kem chống nắng',
  ],
  'Tóc': [
    'Dầu gội', 'Dầu xả', 'Kem ủ tóc', 'Serum tóc',
  ],
  'Làm Đẹp Đường Uống': [
    'Collagen', 'Vitamin', 'Thực phẩm bổ sung',
  ],
  'Cơ Thể': [
    'Sữa tắm', 'Dưỡng thể', 'Tẩy tế bào chết', 'Chống nắng cơ thể',
  ],
  'Em Bé': [
    'Sữa tắm em bé', 'Dưỡng da em bé', 'Chăm sóc tóc em bé',
  ],
  'Hương Thơm': [
    'Nước hoa', 'Xịt thơm cơ thể', 'Tinh dầu',
  ],
  'Quà Tặng': [
    'Bộ quà tặng da', 'Bộ quà tặng tóc', 'Bộ quà tặng toàn thân',
  ],
  'Bộ Sản Phẩm': [
    'Bộ chăm sóc da', 'Bộ chăm sóc tóc',
  ],
  'Khác': [
    'Dụng cụ làm đẹp', 'Phụ kiện',
  ],
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected\n');

  for (const [parentName, children] of Object.entries(CATEGORY_TREE)) {
    // Tìm hoặc tạo category cha
    let parent = await Category.findOne({ name: parentName, parentId: null });
    if (!parent) {
      parent = await Category.create({ name: parentName, parentId: null });
      console.log(`✔ Tạo cha: "${parentName}" (slug: ${parent.slug})`);
    } else {
      // Cập nhật slug nếu chưa có
      if (!parent.slug) {
        parent.slug = toSlug(parentName);
        await parent.save();
      }
      console.log(`• Cha đã tồn tại: "${parentName}" (slug: ${parent.slug})`);
    }

    // Tạo category con
    for (const childName of children) {
      let child = await Category.findOne({ name: childName, parentId: parent._id });
      if (!child) {
        child = await Category.create({ name: childName, parentId: parent._id });
        console.log(`  ✔ Tạo con: "${childName}" (slug: ${child.slug})`);
      } else {
        if (!child.slug) {
          child.slug = toSlug(childName);
          await child.save();
        }
        console.log(`  • Con đã tồn tại: "${childName}"`);
      }
    }
    console.log('');
  }

  console.log('✅ Seed hoàn tất!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
