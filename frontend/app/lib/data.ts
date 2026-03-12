// // app/lib/data.ts

// // 1. ĐỊNH NGHĨA INTERFACE
// export interface Category {
//   id: string;
//   name: string;
//   slug: string;
// }

// export interface Product {
//   id: string;
//   name: string;
//   price: number;
//   oldPrice?: number;
//   imageUrl: string;
//   description: string;
//   categorySlug: string;
// }

// // 2. MẢNG CATEGORIES
// export const categories: Category[] = [
//   { id: '1', name: 'Sale', slug: 'sale' },
//   { id: '2', name: 'Chăm sóc da', slug: 'cham-soc-da' },
//   { id: '3', name: 'Trang điểm', slug: 'trang-diem' },
//   { id: '4', name: 'Chăm sóc cơ thể', slug: 'cham-soc-co-the' },
//   { id: '5', name: 'Chăm sóc tóc', slug: 'cham-soc-toc' },
// ];

// // 3. MOCK PRODUCTS
// export const mockProducts: Product[] = [
//   {
//     id: '1',
//     name: 'Serum cấp ẩm A',
//     price: 350000,
//     oldPrice: 400000,
//     imageUrl: '/images/serum-a.jpg',
//     description: 'Serum giúp cấp ẩm sâu và làm dịu da tức thì. Công thức dịu nhẹ, thẩm thấu nhanh, không gây bết dính.',
//     categorySlug: 'cham-soc-da',
//   },
//   {
//     id: '2',
//     name: 'Kem chống nắng B',
//     price: 500000,
//     imageUrl: '/images/sunscreen-b.jpg',
//     description: 'Kem chống nắng phổ rộng SPF 50+, PA++++. Bảo vệ da tối ưu khỏi tia UVA/UVB, ngăn ngừa lão hóa.',
//     categorySlug: 'cham-soc-da',
//   },
//   {
//     id: '3',
//     name: 'Toner làm sạch C',
//     price: 280000,
//     imageUrl: '/images/toner-c.jpg',
//     description: 'Toner cân bằng độ pH và làm sạch sâu lỗ chân lông. Giúp da hấp thụ dưỡng chất tốt hơn.',
//     categorySlug: 'cham-soc-da',
//   },
//   {
//     id: '4',
//     name: 'Mặt nạ ngủ D',
//     price: 450000,
//     oldPrice: 500000,
//     imageUrl: '/images/mask-d.jpg',
//     description: 'Mặt nạ ngủ cung cấp dưỡng chất ban đêm. Sáng hôm sau da căng mọng và rạng rỡ.',
//     categorySlug: 'cham-soc-da',
//   },
//   {
//     id: '5',
//     name: 'Son dưỡng E',
//     price: 150000,
//     imageUrl: '/images/lipbalm-e.jpg',
//     description: 'Son dưỡng môi mềm mượt, chống nứt nẻ. Thành phần tự nhiên, an toàn cho cả môi nhạy cảm.',
//     categorySlug: 'trang-diem',
//   },
//   {
//     id: '6',
//     name: 'Kem dưỡng F',
//     price: 600000,
//     imageUrl: '/images/cream-f.jpg',
//     description: 'Kem dưỡng ẩm phục hồi da. Củng cố hàng rào bảo vệ da, giúp da khỏe mạnh hơn.',
//     categorySlug: 'cham-soc-co-the',
//   },
//   {
//     id: '7',
//     name: 'Tẩy da chết G',
//     price: 320000,
//     oldPrice: 350000,
//     imageUrl: '/images/scrub-g.jpg',
//     description: 'Tẩy da chết hóa học an toàn, dịu nhẹ. Giúp loại bỏ tế bào chết, làm da mịn màng.',
//     categorySlug: 'cham-soc-co-the',
//   },
//   {
//     id: '8',
//     name: 'Xịt khoáng H',
//     price: 220000,
//     imageUrl: '/images/spray-h.jpg',
//     description: 'Xịt khoáng làm dịu da và cấp ẩm tức thì. Giữ lớp trang điểm lâu trôi.',
//     categorySlug: 'cham-soc-da',
//   },
// ];


// // 4. CÁC HÀM LẤY DỮ LIỆU
// export async function getCategories(): Promise<Category[]> {
//   await new Promise(resolve => setTimeout(resolve, 100));
//   return categories;
// }

// export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
//   await new Promise(resolve => setTimeout(resolve, 100));
//   return categories.find((category) => category.slug === slug);
// }

// export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
//   await new Promise(resolve => setTimeout(resolve, 100));
  
//   if (slug === 'sale') {
//     return mockProducts.filter((product) => product.oldPrice);
//   }
  
//   return mockProducts.filter((product) => product.categorySlug === slug);
// }

// // 5. HÀM MỚI ĐƯỢC THÊM VÀO
// export async function getProductById(id: string): Promise<Product | undefined> {
//   await new Promise(resolve => setTimeout(resolve, 100));
  
//   // Tìm sản phẩm trong mảng mockProducts
//   return mockProducts.find((product) => product.id === id);
// }