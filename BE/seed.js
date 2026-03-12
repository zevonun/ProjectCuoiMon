// seed.js – CHẠY LẦN DUY NHẤT ĐỂ TẠO DỮ LIỆU THẬT
const mongoose = require('mongoose');
const Category = require('./models/category');
const Product = require('./models/product');

const categories = [
  "Trang điểm", "Chăm sóc da", "Tóc", "Cơ thể",
  "Làm đẹp đường uống", "Em bé", "Hương thơm"
];

const sampleProducts = [
  { name: "Kem chống nắng Some By Mi Truecica", price: 320000, sale: 259000, image: "/images/kcn-somebymi.jpg", hot: 1, categoryName: "Chăm sóc da" },
  { name: "Son 3CE Velvet Lip Tint - Going Right", price: 420000, sale: 350000, image: "/images/3ce-going-right.jpg", hot: 1, categoryName: "Trang điểm" },
  { name: "Toner Caryophy Portulaca", price: 350000, sale: 299000, image: "/images/toner-caryophy.jpg", categoryName: "Chăm sóc da" },
  { name: "Serum The Ordinary Niacinamide 10%", price: 380000, sale: 320000, image: "/images/the-ordinary.jpg", categoryName: "Chăm sóc da" },
  { name: "Máy rửa mặt Foreo Luna Mini 3", price: 4500000, sale: 3990000, image: "/images/foreo-luna.jpg", hot: 1, categoryName: "Cơ thể" },
  { name: "Nước tẩy trang Bioderma 500ml", price: 480000, sale: 399000, image: "/images/bioderma.jpg", categoryName: "Chăm sóc da" },
  { name: "Mặt nạ ngủ Laneige Water Sleeping Mask", price: 650000, sale: 520000, image: "/images/laneige-mask.jpg", categoryName: "Chăm sóc da" },
  { name: "Son Romand Juicy Lasting Tint #13", price: 320000, sale: 259000, image: "/images/romand-13.jpg", hot: 1, categoryName: "Trang điểm" },
  { name: "Sữa rửa mặt Senka Perfect Whip", price: 145000, sale: 109000, image: "/images/senka.jpg", categoryName: "Chăm sóc da" },
  { name: "Kem dưỡng ẩm La Roche-Posay Cicaplast", price: 550000, sale: 450000, image: "/images/cicaplast.jpg", categoryName: "Chăm sóc da" },
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/mybeauty');

  // Xóa dữ liệu cũ
  await Category.deleteMany({});
  await Product.deleteMany({});

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