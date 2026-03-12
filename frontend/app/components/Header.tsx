// app/components/Header.tsx
"use client"; 

import Link from 'next/link';
import Image from 'next/image';
// SỬA 1: Thêm 'useContext', 'useEffect'
import React, { useState, useContext, useEffect } from 'react'; 
import { AuthContext } from '../context/AuthContext'; // Import Context
import { useCart } from '../context/CartContext'; // SỬA 1.1: Import useCart
import UserMenu from './UserMenu'; // Import UserMenu
import { fetchProducts, Product } from '../lib/api'; // Import fetchProducts và Product type

export default function Header() {
  // State để quản lý menu nào đang được hover
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // State để quản lý sub-menu nào đang được hover (ví dụ: 'right-1', 'right-2')
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>('right-1'); // Mặc định hiện mục 1

  // State để lưu products và grouping theo category
  const [products, setProducts] = useState<Product[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  // SỬA 2: Lấy giá trị từ AuthContext
  const authContext = useContext(AuthContext);

  // SỬA 2.1: Lấy itemCount từ CartContext
  const { itemCount } = useCart();

  // Gọi API lấy sản phẩm khi component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts('http://localhost:5000/api/products');
        setProducts(fetchedProducts);

        // Group products by category
        const grouped: Record<string, Product[]> = {};
        fetchedProducts.forEach((product) => {
          const categoryId = product.categoryId || 'uncategorized';
          if (!grouped[categoryId]) {
            grouped[categoryId] = [];
          }
          grouped[categoryId].push(product);
        });
        setProductsByCategory(grouped);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // SỬA 3: Thêm một kiểm tra an toàn (rất quan trọng)
  // Nếu context chưa được tải, không render gì cả để tránh lỗi
  if (!authContext) {
    return null; // Hoặc bạn có thể trả về một header rỗng
  }

  // SỬA 4: Khai báo 'isLoggedIn' và 'user' từ context
  const { isLoggedIn, user } = authContext;


  const handleMenuEnter = (menu: string) => {
    setActiveMenu(menu);
    setActiveSubMenu('right-1'); // Khi hover menu mới, luôn reset về tab 1
  };

  const handleMenuLeave = () => {
    setActiveMenu(null);
  };

  // Hàm render tab menu bên trái (để tránh lặp code)
  const renderSubMenuItem = (title: string, tabId: string) => (
    <li 
      key={tabId}
      onMouseEnter={() => setActiveSubMenu(tabId)} 
      className={activeSubMenu === tabId ? 'active' : ''}
    >
      <Link href="#">{title}</Link>
      <i className="fas fa-greater-than"></i>
    </li>
  );

  // Hàm render nội dung sản phẩm bên phải từ API
  const renderProductItem = (product: Product) => (
    <div key={product._id} className="pure-item-right-content-skin">
      <Link href={`/product/${product._id}`}>
        <Image src={product.hinh} alt={product.ten_sp} width={200} height={200} style={{ width: '100%', height: 'auto' }} />
      </Link>
      <Link href={`/product/${product._id}`}><p>{product.ten_sp}</p></Link>
      <div className="pure-item-price-info">
        <span className="price">{product.gia_km ? `${product.gia_km.toLocaleString()}đ` : `${product.gia.toLocaleString()}đ`}</span>
        {product.gia_km && <span className="old-price">{product.gia.toLocaleString()}đ</span>}
      </div>
    </div>
  );

  // Hàm render danh sách sản phẩm theo category
  const renderProductsByCategory = (categoryId: string) => {
    const categoryProducts = productsByCategory[categoryId] || [];
    return categoryProducts.slice(0, 4).map(product => renderProductItem(product));
  };

  return (
    <div className="header" id="navbar" onMouseLeave={handleMenuLeave}>
      <div className="header-top">
        <div className="header-top-left">
          <Link href="/">
            <Image 
              src="/img/logo.png" 
              alt="Logo" 
              width={200} 
              height={60}
              priority={true} // Giúp logo tải nhanh hơn
              style={{ height: 'auto', width: 'auto' }} 
            />
          </Link>
        </div>
        <div className="header-top-main">
          <div className="menu">
            <Link href="#">Kem Chống Nắng</Link>
            <span>|</span>
            <Link href="#">Tẩy Trang</Link>
            <span>|</span>
            <Link href="#">Toner</Link>
            <span>|</span>
            <Link href="#">Son màu</Link>
            <span>|</span>
            <Link href="#">Dầu Gội</Link>
          </div>
          <div className="search-box">
            <input type="text" placeholder="Tìm sản phẩm, danh mục mong muốn ..." />
            <button><i className="fa fa-search"></i></button>
          </div>
        </div>
        <div className="header-top-right">
          <div className="cart">
            <Link href="/stores" className="cart-link">
              <i className="fas fa-home"></i>
              <span>Hệ thống cửa hàng</span>
            </Link>
          </div>  
          <div className="cart">
            <Link href="/profile"><i className="fas fa-heart"></i></Link>
          </div>
          
          {/* --- KHU VỰC ĐÃ ĐƯỢC SỬA LỖI --- */}
          {/* 'isLoggedIn' và 'user' bây giờ đã được định nghĩa */}
          {isLoggedIn && user ? (
            // Nếu đã đăng nhập, hiển thị UserMenu
            <UserMenu user={user} />
          ) : (
            // Nếu chưa, hiển thị icon user LINK ĐẾN TRANG /login
            <div className="cart">
              <Link href="/login">
                <i className="fas fa-user"></i>
              </Link>
            </div>
          )}
          {/* --- KẾT THÚC SỬA LỖI --- */}
          
          <div className="cart">
            {/* SỬA LỖI XUNG ĐỘT CSS:
              Đổi className từ "cart-link" thành "cart-icon-link"
            */}
            <Link href="/cart" className="cart-icon-link">
              <i className="fas fa-shopping-cart"></i>
              {itemCount > 0 && (
                <span className="cart-item-count">{itemCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
      
      {/* 2. HEADER BOTTOM (Giữ nguyên toàn bộ mega menu của bạn) */}
      <div className="header-bottom">
        <ul className="pure-list" id="pure-list">
          
        {/* ----- MỤC 1: SALE ----- */}
          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('sale')}>
            <Link href="/products/sale">Sale</Link>
            <div className="pure-item" style={{ display: activeMenu === 'sale' ? 'flex' : 'none' }}>
              {/* ... (Nội dung mega menu) ... */}
              <div className="pure-item-left">
                <ul className="pure-list-item">
                  {renderSubMenuItem('Combo chăm sóc da', 'right-1')}
                  {renderSubMenuItem('Combo chăm sóc tóc', 'right-2')}
                  {renderSubMenuItem('Combo chăm sóc môi', 'right-3')}
                  {renderSubMenuItem('Combo khác', 'right-4')}
                  {renderSubMenuItem('Black Green Day', 'right-5')}
                </ul>
              </div>
              
              <div className="pure-item-right right-1" style={{ display: activeSubMenu === 'right-1' ? 'grid' : 'none' }}>
                {renderProductsByCategory('combo-cham-soc-da')}
              </div>
              
              <div className="pure-item-right right-2" style={{ display: activeSubMenu === 'right-2' ? 'grid' : 'none' }}>
                {renderProductsByCategory('combo-cham-soc-toc')}
              </div>

              <div className="pure-item-right right-3" style={{ display: activeSubMenu === 'right-3' ? 'grid' : 'none' }}>
                {renderProductsByCategory('combo-cham-soc-moi')}
              </div>
              <div className="pure-item-right right-4" style={{ display: activeSubMenu === 'right-4' ? 'grid' : 'none' }}>
                {renderProductsByCategory('combo-khac')}
              </div>
              <div className="pure-item-right right-5" style={{ display: activeSubMenu === 'right-5' ? 'grid' : 'none' }}>
                {renderProductsByCategory('black-green-day')}
              </div>
            </div>
          </li>
          
          {/* ----- MỤC 2: TRANG ĐIỂM ----- */}
          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('trangdiem')}>
            <Link href="/products/trang-diem">Trang Điểm</Link>
            <div className="pure-item" style={{ display: activeMenu === 'trangdiem' ? 'flex' : 'none' }}>
              {/* ... (Nội dung mega menu) ... */}
              <div className="pure-item-left">
                <ul className="pure-list-item">
                  {renderSubMenuItem('Son dưỡng môi', 'right-1')}
                  {renderSubMenuItem('Son màu', 'right-2')}
                  {renderSubMenuItem('Tẩy da chết môi', 'right-3')}
                  {renderSubMenuItem('Kem nền', 'right-4')}
                  {renderSubMenuItem('Kem má', 'right-5')}
                </ul>
              </div>

              <div className="pure-item-right right-1" style={{ display: activeSubMenu === 'right-1' ? 'grid' : 'none' }}>
                {renderProductsByCategory('son-duong-moi')}
              </div>
              <div className="pure-item-right right-2" style={{ display: activeSubMenu === 'right-2' ? 'grid' : 'none' }}>
                {renderProductsByCategory('son-mau')}
              </div>
            </div>
          </li>

          {/* ----- MỤC 3: DA ----- */}
          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('da')}>
            <Link href="/products/da">Da</Link>
             <div className="pure-item" style={{ display: activeMenu === 'da' ? 'flex' : 'none' }}>
                {/* ... (Nội dung mega menu) ... */}
                <div className="pure-item-left">
                  <ul className="pure-list-item">
                    {renderSubMenuItem('Tẩy trang - rửa mặt', 'right-1')}
                    {renderSubMenuItem('Toner - xịt khoáng', 'right-2')}
                    {renderSubMenuItem('Dưỡng da', 'right-3')}
                    {renderSubMenuItem('Kem chống nắng', 'right-4')}
                  </ul>
                </div>
            </div>
          </li>
          
          {/* (Các mục menu còn lại giữ nguyên...) */}
          
          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('toc')}>
            <Link href="/products/toc">Tóc</Link>
            {/* ... */}
          </li>

          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('lamdep')}>
            <Link href="/products/lam-dep-duong-uong">Làm Đẹp Đường Uống</Link>
            {/* ... */}
          </li>

          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('cothe')}>
            <Link href="/products/co-the">Cơ Thể</Link>
            {/* ... */}
          </li>

          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('embe')}>
            <Link href="/products/em-be">Em Bé</Link>
            {/* ... */}
          </li>

          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('huongthom')}>
            <Link href="/products/huong-thom">Hương Thơm</Link>
            {/* ... */}
          </li>

          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('quatang')}>
            <Link href="/products/qua-tang">Quà Tặng</Link>
            {/* ... */}
          </li>

          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('bosanpham')}>
            <Link href="/products/bo-san-pham">Bộ Sản Phẩm</Link>
            {/* ... */}
          </li>

          <li className="title-san-pham">
            <Link href="/about">Về Aura Beauty</Link>
          </li>
          
          <li className="title-san-pham" onMouseEnter={() => handleMenuEnter('khac')}>
            <Link href="/products/khac">Khác</Link>
            {/* ... */}
          </li>
          
        </ul>
      </div>
    </div>
  );
}