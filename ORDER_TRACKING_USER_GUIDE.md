# Quy trình Xem Đơn Hàng - Hướng dẫn Chi tiết

## 📱 Quy trình người dùng

```
┌─────────────────────────────────────────────────────────┐
│  1️⃣  TRANG CHECKOUT                                      │
│  └─ Người dùng điền thông tin → Đặt hàng               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2️⃣  TRANG ORDER SUCCESS (/order-success)               │
│  ✅ Đặt hàng thành công!                                │
│  └─ [Xem đơn hàng] [Tiếp tục mua]                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3️⃣  DANH SÁCH ĐƠN HÀNG (/orders)                       │
│                                                          │
│  Tabs: [Tất cả] [Chờ xác nhận] [Đã xác nhận] ...       │
│  
│  📦 Đơn hàng #1001                       [Chờ xác nhận]  │
│  ├─ Sản phẩm #1: x2 | 50,000 đ         → 100,000 đ    │
│  ├─ Sản phẩm #2: x1 | 100,000 đ        → 100,000 đ    │
│  ├─ Tổng tiền: 230,000 đ                              │
│  └─ [Thay đổi địa chỉ] [Hủy đơn] [Chi tiết]           │
│                                                          │
│  📦 Đơn hàng #1002                       [Đã giao]      │
│  ├─ Sản phẩm #1: x1 | 200,000 đ        → 200,000 đ    │
│  ├─ Tổng tiền: 230,000 đ                              │
│  └─ [Mua lại] [Đánh giá] [Chi tiết]                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4️⃣  CHI TIẾT ĐƠN HÀNG (/orders/[id])                  │
│                                                          │
│  📋 Chờ xác nhận  ✓ Xác nhận  🚚 Đang giao  📦 Đã giao  │
│  
│  📊 THÔNG TIN ĐƠN HÀNG:                                 │
│  • Mã đơn hàng: #1001                                  │
│  • Trạng thái: Chờ xác nhận                            │
│  • Ngày đặt: 31/03/2026 14:30                          │
│  • Phương thức: Thanh toán khi nhận hàng               │
│                                                          │
│  👤 THÔNG TIN GIAO HÀNG:                               │
│  • Tên: Phước Huỳnh                                    │
│  • SĐT: 0374411689                                     │
│  • Email: ph940738@gmail.com                           │
│  • Địa chỉ: 123 Nguyễn Văn Quá, Quận 12, TP.HCM       │
│                                                          │
│  📦 SẢN PHẨM:                                          │
│  │ Sản phẩm | Số lượng | Giá | Tổng                   │
│  ├─ #1 | 2 | 50,000 đ | 100,000 đ                    │
│  ├─ #2 | 1 | 100,000 đ | 100,000 đ                   │
│                                                          │
│  💰 CHI TIẾT THANH TOÁN:                               │
│  • Tổng sản phẩm: 200,000 đ                            │
│  • Phí vận chuyển: 30,000 đ                            │
│  • TỔNG THANH TOÁN: 230,000 đ                          │
│                                                          │
│  [← Quay lại]                                           │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Các trạng thái đơn hàng

### Timeline Trạng thái
```
📋 Chờ xác nhận
   ↓
✓ Đã xác nhận
   ↓
🚚 Đang giao hàng
   ↓
📦 Đã giao
```

### Tất cả các trạng thái có thể
- **pending** (📋) - Chờ xác nhận
- **confirmed** (✓) - Đã xác nhận  
- **shipped** (🚚) - Đang giao hàng
- **delivered** (📦) - Đã giao
- **cancelled** (✗) - Đã hủy
- **returning** (↩️) - Đang trả hàng
- **returned** (📤) - Đã trả hàng

## 🔘 Các nút hành động

### Cho đơn hàng "Chờ xác nhận" (pending):
- **Thay đổi địa chỉ** - Chỉnh sửa thông tin giao hàng
- **Hủy đơn** - Hủy đơn hàng
- **Chi tiết** - Xem thông tin chi tiết

### Cho đơn hàng "Đã giao" (delivered):
- **Mua lại** - Thêm sản phẩm vào giỏ hàng
- **Đánh giá** - Gửi review/rating cho sản phẩm
- **Chi tiết** - Xem thông tin chi tiết

### Cho tất cả đơn hàng:
- **Chi tiết** - Xem toàn bộ thông tin đơn hàng

## 🔍 Tìm kiếm và lọc

### Tabs lọc theo trạng thái:
```
[Tất cả] [Chờ xác nhận] [Đã xác nhận] [Đang giao] [Đã giao] [Đã hủy] [Đang trả] [Đã trả]
```

### Tìm kiếm:
Có thể tìm theo:
- Mã đơn hàng (#1001)
- Tên khách hàng
- Địa chỉ giao hàng

## 📱 Responsive Design

### Desktop (> 768px)
- 2 cột thông tin
- Bảng sản phẩm đầy đủ
- Timeline ngang

### Tablet (480px - 768px)  
- 1 cột thông tin
- Bảng sản phẩm tối ưu
- Timeline ngang

### Mobile (< 480px)
- Full width
- Bảng sản phẩm dạng card
- Timeline dạng vertical

## 🛡️ Bảo mật

- ✅ Tất cả API calls yêu cầu JWT token
- ✅ Token tự động refresh khi hết hạn
- ✅ Chỉ xem được đơn hàng của chính mình
- ✅ Phiên làm việc tự động hết sau logout

## ⚙️ API Integration

### Sử dụng `apiFetch` từ `lib/apiClient.ts`
```typescript
// Tự động xử lý:
// ✅ Token expiration (401)
// ✅ Refresh token
// ✅ Retry request
// ✅ Redirect to login nếu fail
```

## 🚀 Khởi chạy

```bash
# Terminal 1 - Backend
cd BE
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Truy cập
# http://localhost:3000/checkout  → Đặt hàng
# http://localhost:3000/order-success  → Thành công
# http://localhost:3000/orders  → Danh sách đơn
# http://localhost:3000/orders/[id]  → Chi tiết đơn
```

## 📌 Lưu ý

- Đảm bảo backend đang chạy tại `http://localhost:5000`
- Đảm bảo frontend đang chạy tại `http://localhost:3000`
- CORS đã được cấu hình trong backend
- Token refresh endpoint `/api/users/refresh-token` phải hoạt động
