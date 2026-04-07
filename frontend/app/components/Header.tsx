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
import { formatPrice } from '../lib/formatPrice'; // Import formatPrice

// Mapping từ slug/name sang displayName cho menu
const CATEGORY_MAPPING: Record<string, string> = {
  'trang-diem': 'Trang Điểm',
  'da': 'Da',
  'toc': 'Tóc',
  'lam-dep-duong-uong': 'Làm Đẹp Đường Uống',
  'co-the': 'Cơ Thể',
  'em-be': 'Em Bé',
  'huong-thom': 'Hương Thơm',
  'qua-tang': 'Quà Tặng',
  'bo-san-pham': 'Bộ Sản Phẩm',
  'khac': 'Khác',
};

export interface CategoryData {
  _id: string;
  name: string;
  slug?: string;
}

export default function Header() {
  // State để quản lý menu nào đang được hover
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // State để quản lý sub-menu nào đang được hover (ví dụ: 'right-1', 'right-2')
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>('right-1'); // Mặc định hiện mục 1

  // State để lưu products và grouping theo category
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryIdMap, setCategoryIdMap] = useState<Record<string, string>>({}); // Map slug -> categoryId
  const [loading, setLoading] = useState(true);

  // State cho search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // SỬA 2: Lấy giá trị từ AuthContext
  const authContext = useContext(AuthContext);

  // SỬA 2.1: Lấy itemCount từ CartContext
  const { itemCount } = useCart();

  // Gọi API lấy sản phẩm và categories khi component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch all products
        const fetchedProducts = await fetchProducts('http://localhost:5000/api/products');
        console.log('✅ Products loaded:', fetchedProducts.length, fetchedProducts);
        setProducts(fetchedProducts);

        // Fetch all categories
        const response = await fetch('http://localhost:5000/api/categories', { cache: 'no-store' });
        if (response.ok) {
          const json = await response.json();
          const fetchedCategories = Array.isArray(json.data) ? json.data : [];
          setCategories(fetchedCategories);

          // Build mapping từ category name sang _id
          const mapping: Record<string, string> = {};
          fetchedCategories.forEach((cat: CategoryData) => {
            // Normalize name to slug (lowercase, replace spaces with dash)
            const slug = cat.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]/g, '');
            mapping[slug] = cat._id;
            // Also map by exact name
            mapping[cat.name.toLowerCase()] = cat._id;
          });
          setCategoryIdMap(mapping);
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  // Hàm xử lý tìm kiếm sản phẩm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    console.log('🔍 Searching:', query, 'in', products.length, 'products');

    // Filter sản phẩm theo tên
    const results = products.filter(p =>
      p.ten_sp.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8); // Hiển thị tối đa 8 kết quả

    console.log('📦 Search results:', results);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect đến trang search với query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
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
        <span className="price">{product.gia_km ? formatPrice(product.gia_km) : formatPrice(product.gia)}</span>
        {product.gia_km && <span className="old-price">{formatPrice(product.gia)}</span>}
      </div>
    </div>
  );

  // Hàm render danh sách sản phẩm theo subcategory name
  const renderProductsBySubcategory = (subcategoryName: string) => {
    if (!subcategoryName) {
      return <p style={{ padding: '10px', color: '#999' }}>Chưa có sản phẩm</p>;
    }

    // Filter products theo subcategory
    const subcategoryProducts = products.filter(p =>
      p.subcategory && p.subcategory.toLowerCase().trim() === subcategoryName.toLowerCase().trim()
    );

    if (subcategoryProducts.length === 0) {
      return <p style={{ padding: '10px', color: '#999' }}>Chưa có sản phẩm</p>;
    }

    return subcategoryProducts.slice(0, 4).map((product: Product) => renderProductItem(product));
  };

  return (
    <div className="header" id="navbar" onMouseLeave={handleMenuLeave}>
      <div className="header-top">
        <div className="header-top-left">
          <Link href="/">
            <Image
              src="/img/Logo.png"
              alt="Logo"
              width={120}
              height={50}
              priority={true}
              style={{ objectFit: 'contain' }}
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
          <div className="search-box" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm sản phẩm, danh mục mong muốn ..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />
            <button onClick={handleSearchSubmit}><i className="fa fa-search"></i></button>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {searchResults.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    style={{
                      display: 'flex',
                      padding: '10px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ width: '50px', height: '50px', marginRight: '10px', flexShrink: 0 }}>
                      <Image
                        src={product.hinh}
                        alt={product.ten_sp}
                        width={50}
                        height={50}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.ten_sp}
                      </div>
                      <div style={{ color: '#ee4d2d', fontWeight: 600, fontSize: '13px' }}>
                        {formatPrice(product.gia_km && product.gia_km > 0 ? product.gia_km : product.gia)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="header-top-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                {renderProductsBySubcategory('Combo chăm sóc da')}
              </div>

              <div className="pure-item-right right-2" style={{ display: activeSubMenu === 'right-2' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Combo chăm sóc tóc')}
              </div>

              <div className="pure-item-right right-3" style={{ display: activeSubMenu === 'right-3' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Combo chăm sóc môi')}
              </div>
              <div className="pure-item-right right-4" style={{ display: activeSubMenu === 'right-4' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Combo khác')}
              </div>
              <div className="pure-item-right right-5" style={{ display: activeSubMenu === 'right-5' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Black Green Day')}
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
                {renderProductsBySubcategory('Son dưỡng môi')}
              </div>
              <div className="pure-item-right right-2" style={{ display: activeSubMenu === 'right-2' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Son màu')}
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

              <div className="pure-item-right right-1" style={{ display: activeSubMenu === 'right-1' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Tẩy trang - rửa mặt')}
              </div>
              <div className="pure-item-right right-2" style={{ display: activeSubMenu === 'right-2' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Toner - xịt khoáng')}
              </div>
              <div className="pure-item-right right-3" style={{ display: activeSubMenu === 'right-3' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Dưỡng da')}
              </div>
              <div className="pure-item-right right-4" style={{ display: activeSubMenu === 'right-4' ? 'grid' : 'none' }}>
                {renderProductsBySubcategory('Kem chống nắng')}
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