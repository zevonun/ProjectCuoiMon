// seed.js – CHẠY LẦN DUY NHẤT ĐỂ TẠO DỮ LIỆU THẬT
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Category = require('./models/category');
const Product = require('./models/product');
const User = require('./models/user');
const Article = require('./models/article');
const Banner = require('./models/banner');
const fs = require('fs');
const https = require('https');
const path = require('path');

const articlePosts = [
  {
    slug_vi: "cham-soc-da",
    title_vi: "Routine Chăm Sóc Da Chuẩn Cho Làn Da Việt",
    image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxawe5584cxf9.webp",
    short_description_vi: "Khám phá quy trình 7 bước dưỡng da chuẩn chuyên gia, giúp phục hồi và nuôi dưỡng làn da khỏe đẹp từ bên trong cùng các chiết xuất từ trà xanh và tràm trà.",
    content_vi: `
      <p>Làn da Việt Nam thường phải đối mặt với khí hậu nóng ẩm, khói bụi và ánh nắng gay gắt. Chính vì vậy, một quy trình chăm sóc da chuẩn không chỉ đơn thuần là thoa kem mà cần sự thấu hiểu sâu sắc về nhu cầu thực sự của làn da.</p>
      <h2>1. Quy trình làm sạch kép (Double Cleansing)</h2>
      <p>Đây là bước quan trọng nhất. Ngay cả khi bạn không trang điểm, việc sử dụng dầu tẩy trang giúp loại bỏ dầu thừa và bã nhờn sâu trong lỗ chân lông, sau đó là sữa rửa mặt dịu nhẹ để làm sạch hoàn toàn.</p>
      <h2>2. Cân bằng độ ẩm ngay lập tức</h2>
      <p>Đừng để da khô căng sau khi rửa mặt. Hãy sử dụng toner hoặc nước hoa hồng không cồn để cân bằng lại độ pH, giúp các bước tiếp theo thẩm thấu tốt hơn 40%.</p>
      <h2>3. Sử dụng tinh chất đặc trị (Serum)</h2>
      <p>Tùy vào tình trạng da, bạn nên chọn Serum chứa Vitamin C để làm sáng hoặc Hyaluronic Acid để cấp ẩm sâu. Aura Beauty khuyên dùng Serum Trà Xanh cho da dầu mụn vì khả năng kháng khuẩn tự nhiên.</p>
      <h2>4. Khóa ẩm - Bước không thể bỏ qua</h2>
      <p>Kem dưỡng đóng vai trò như một lớp màng bảo vệ, ngăn không cho các dưỡng chất từ serum bay hơi. Chọn kết cấu dạng gel-cream để không gây bí bách trong thời tiết nóng ẩm.</p>
    `,
    num: 1
  },
  {
    slug_vi: "tri-mun",
    title_vi: "Giải Pháp Trị Mụn Hiệu Quả Từ Tinh Dầu Thiên Nhiên",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881",
    short_description_vi: "Mụn không còn là nỗi lo với sự kết hợp hoàn hảo từ tràm trà, rau má. Giải pháp an toàn, không để lại thâm sẹo cho làn da nhạy cảm nhất.",
    content_vi: `
      <p>Mụn là kẻ thù số một của sự tự tin. Tuy nhiên, thay vì tìm đến các hóa chất tẩy rửa mạnh, việc sử dụng các thành phần thiên nhiên có tính kháng viêm cao lại mang đến hiệu quả bền vững và an toàn hơn.</p>
      <h2>Tràm Trà (Tea Tree Oil) - "Dũng sĩ" diệt khuẩn</h2>
      <p>Nhờ hoạt chất Terpinen-4-ol, tinh dầu tràm trà có khả năng tiêu diệt vi khuẩn gây mụn P.acnes cực tốt mà không gây khô da nứt nẻ như các hoạt chất hóa học.</p>
      <h2>Rau Má (Centella Asiatica) - Phục hồi và làm dịu</h2>
      <p>Nếu tràm trà tiêu diệt vi khuẩn thì rau má đóng vai trò "chữa lành". Nó kích thích sản sinh collagen, làm dịu vết đỏ và ngăn ngừa tối đa khả năng hình thành sẹo lõm sau mụn.</p>
    `,
    num: 2
  },
  {
    slug_vi: "duong-am",
    title_vi: "Dưỡng Ẩm Chuyên Sâu: Chìa Khóa Cho Làn Da Căng Mọng",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec",
    short_description_vi: "Đừng để làn da khô ráp lấy đi sự tự tin của bạn. Học ngay cách cấp ẩm đúng cách với Hyaluronic Acid tự nhiên và bơ hạt mỡ hữu cơ.",
    content_vi: `
      <p>Nhiều người lầm tưởng da dầu không cần dưỡng ẩm. Thực chất, khi da thiếu nước, nó sẽ càng tiết dầu nhiều hơn để tự cân bằng. Dưỡng ẩm chính là quá trình mang lại sự cân bằng hoàn hảo.</p>
      <h2>Hyaluronic Acid (HA) - Nam châm hút nước</h2>
      <p>Một phân tử HA có thể giữ nước gấp 1000 lần trọng lượng của nó. Việc sử dụng sản phẩm chứa HA từ thực vật giúp da luôn căng mướt và giảm thiểu nếp nhăn li ti.</p>
    `,
    num: 3
  }
];

async function downloadImage(url, filename) {
  const dir = path.join(__dirname, 'public', 'uploads', 'articles');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(`/uploads/articles/${filename}`);
        });
      } else {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

const categories = ["Sữa rửa mặt", "Serum - Tinh chất", "Kem dưỡng da", "Chống nắng", "Dầu - Nước tẩy trang", "Mặt nạ dưỡng da", "Trang điểm"];

const sampleProducts = [
  { name: "Sữa Rửa Mặt Aura Trà Xanh", price: 180000, sale: 150000, image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lty68p29107o1c", categoryName: "Sữa rửa mặt", hot: 1, stock: 50 },
  { name: "Serum HA Aura Hydration", price: 350000, sale: 290000, image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lty68p2910b2z7", categoryName: "Serum - Tinh chất", hot: 1, stock: 30 },
  { name: "Kem Dưỡng Aura Rose", price: 420000, sale: 380000, image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lty68p29107o1c", categoryName: "Kem dưỡng da", hot: 0, stock: 5 },
  { name: "Kem Chống Nắng Aura Sunscreen", price: 280000, sale: 250000, image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lty68p2910b2z7", categoryName: "Chống nắng", hot: 1, stock: 0 },
  { name: "Nước Tẩy Trang Aura Micellar", price: 120000, sale: 99000, image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lty68p29107o1c", categoryName: "Dầu - Nước tẩy trang", hot: 0, stock: 12 },
  { name: "Mặt nạ Aura Sáng Da", price: 25000, sale: 20000, image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lty68p2910b2z7", categoryName: "Mặt nạ dưỡng da", hot: 0, stock: 100 },
  { name: "Son Aura Matte Lipstick", price: 220000, sale: 195000, image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lty68p29107o1c", categoryName: "Trang điểm", hot: 1, stock: 0 },
];

const sampleBanners = [
  { 
    title: "Sale Hè Rực Rỡ", 
    image: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxawe5584cxf9.webp", 
    link: "/category/makeup", 
    position: "home" ,
    active: true
  },
  { 
    title: "Bộ Sưu Tập Mới", 
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881", 
    link: "/new-arrivals", 
    position: "home",
    active: true
  },
  { 
    title: "Ưu Đãi Độc Quyền", 
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec", 
    link: "/promo", 
    position: "home",
    active: true
  }
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/mybeauty');

  // Xóa dữ liệu cũ một cách triệt để
  try {
    await mongoose.connection.db.dropCollection('categories');
    await mongoose.connection.db.dropCollection('products');
    await mongoose.connection.db.dropCollection('articles');
    await mongoose.connection.db.dropCollection('banners');
  } catch (e) {
    // Nếu collection chưa tồn tại thì bỏ qua
  }
  
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
      manage_articles: true,
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
      manage_articles: true,
    },
  });
  await admin2.save();
  console.log('✅ Admin 2 created: adminproduct@mybeauty.com / Admin2@123456');

  // Tạo danh mục + lưu map tên → id
  console.log('📂 Tạo danh mục...');
  const catMap = {};
  for (const name of categories) {
    const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const cat = new Category({ name, slug });
    await cat.save();
    console.log(`✅ Category created: ${name} (Slug: ${cat.slug})`);
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
      stock: p.stock ?? 0,
    });
    await product.save();
  }

  // ✅ TẠO BÀI VIẾT (ARTICLES)
  console.log('✍️ Tạo bài viết...');
  for (let i = 0; i < articlePosts.length; i++) {
    const post = articlePosts[i];
    const extension = post.image.includes('webp') ? 'webp' : 'jpg';
    const filename = `article-${i + 1}.${extension}`;
    try {
      const localPath = await downloadImage(post.image, filename);
      const newArticle = new Article({
        ...post,
        image: localPath
      });
      await newArticle.save();
    } catch (err) {
      console.error(`❌ Lỗi tải ảnh bài viết ${i + 1}:`, err.message);
      // Fallback
      await new Article({ ...post, image: '/img/no-image.jpg' }).save();
    }
  }

  // ✅ TẠO BANNER
  console.log('🖼️ Tạo banner...');
  for (const b of sampleBanners) {
    await new Banner(b).save();
  }

  console.log("SEED THÀNH CÔNG! ĐÃ TẠO DANH MỤC, SẢN PHẨM VÀ BÀI VIẾT THẬT");
  console.log("TRUY CẬP NGAY: http://localhost:3000");
  process.exit();
}

seed().catch(err => console.log(err));