// k:\DAN\ProjectCuoiMon\frontend\app\stores-list\page.tsx
"use client";

import Image from "next/image";
import "./stores.css";

const STORES = [
  {
    id: 1,
    name: "Aura Beauty - Chi nhánh Quận 1",
    address: "123 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    phone: "028 3821 1234",
    hours: "09:00 - 21:30 (Thứ 2 - Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=600",
    googleMap: "https://maps.google.com"
  },
  {
    id: 2,
    name: "Aura Beauty - Chi nhánh Quận 7",
    address: "456 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh",
    phone: "028 3775 5678",
    hours: "09:30 - 22:00 (Thứ 2 - Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=600",
    googleMap: "https://maps.google.com"
  },
  {
    id: 3,
    name: "Aura Beauty - Chi nhánh Hoàn Kiếm",
    address: "78 Phố Huế, Quận Hoàn Kiếm, Thành phố Hà Nội",
    phone: "024 3943 0000",
    hours: "09:00 - 21:00 (Thứ 2 - Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=600",
    googleMap: "https://maps.google.com"
  },
  {
    id: 4,
    name: "Aura Beauty - Chi nhánh Cầu Giấy",
    address: "210 Xuân Thủy, Quận Cầu Giấy, Thành phố Hà Nội",
    phone: "024 3767 1111",
    hours: "09:00 - 21:00 (Thứ 2 - Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600",
    googleMap: "https://maps.google.com"
  },
  {
    id: 5,
    name: "Aura Beauty - Chi nhánh Đà Nẵng",
    address: "15 Lê Duẩn, Quận Hải Châu, Thành phố Đà Nẵng",
    phone: "0236 3888 999",
    hours: "08:30 - 21:30 (Thứ 2 - Chủ Nhật)",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=600",
    googleMap: "https://maps.google.com"
  }
];

export default function StoresListPage() {
  return (
    <main className="stores-container">
      <div className="stores-header">
        <h1>Hệ Thống Cửa Hàng Aura Beauty</h1>
        <p>Tìm kiếm địa chỉ gần bạn nhất để trải nghiệm sản phẩm trực tiếp</p>
      </div>

      <div className="stores-grid">
        {STORES.map((store) => (
          <div key={store.id} className="store-card">
            <div className="store-image">
              <Image 
                src={store.image} 
                alt={store.name} 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="store-info">
              <h2 className="store-name">
                <i className="fas fa-store"></i> {store.name}
              </h2>
              
              <div className="store-detail-row">
                <i className="fas fa-map-marker-alt"></i>
                <span>{store.address}</span>
              </div>
              
              <div className="store-detail-row">
                <i className="fas fa-phone-alt"></i>
                <span>{store.phone}</span>
              </div>
              
              <div className="store-detail-row">
                <i className="fas fa-clock"></i>
                <span>{store.hours}</span>
              </div>

              <div className="store-badge">🎉 Đang mở cửa</div>
            </div>

            <a 
              href={store.googleMap} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="map-btn"
            >
              Chỉ đường trên Google Maps
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
