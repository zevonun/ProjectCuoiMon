# Tính năng Xem Đơn Hàng - Hướng dẫn Hoàn chỉnh

## ✅ Tính năng đã hoàn thành

Người dùng có thể **xem đơn hàng của mình sau khi mua hàng với trạng thái chi tiết** 

### 1. **Trang danh sách đơn hàng** (`/orders`)
   - ✅ Hiển thị tất cả đơn hàng của người dùng
   - ✅ Lọc theo trạng thái (Tất cả, Chờ xác nhận, Đã xác nhận, Đang giao, Đã giao, v.v.)
   - ✅ Tìm kiếm đơn hàng
   - ✅ Badge trạng thái cho mỗi đơn hàng
   - ✅ Các nút hành động (Hủy đơn, Thay đổi địa chỉ, Chi tiết, Mua lại, Đánh giá)

### 2. **Trang chi tiết đơn hàng** (`/orders/[id]`)  - **MỚI**
   - ✅ Timeline trạng thái hiển thị trực quan (Chờ xác nhận → Xác nhận → Giao hàng → Đã giao)
   - ✅ Thông tin đơn hàng (Mã đơn, Trạng thái, Ngày đặt, Phương thức thanh toán)
   - ✅ Thông tin giao hàng (Tên, SĐT, Email, Địa chỉ, Tỉnh thành, Ghi chú)
   - ✅ Danh sách sản phẩm trong đơn hàng
   - ✅ Chi tiết thanh toán (Tổng sản phẩm, Phí vận chuyển, Tổng thanh toán)
   - ✅ Responsive design cho mobile/tablet

### 3. **Quy trình sau khi mua hàng**
   - ✅ Người dùng đặt hàng → Chuyển hướng đến `/order-success`
   - ✅ Trang thành công hiển thị thông báo và 2 nút:
     - "Xem đơn hàng của tôi" → Chuyển đến `/orders` 
     - "Tiếp tục mua sắm" → Chuyển về trang chủ

## 📊 Trạng thái đơn hàng

| Trạng thái | Ý nghĩa | Icon |
|-----------|---------|------|
| pending | Chờ xác nhận | 📋 |
| confirmed | Đã xác nhận | ✓ |
| shipped | Đang giao | 🚚 |
| delivered | Đã giao | 📦 |
| cancelled | Đã hủy | ✗ |
| returning | Đang trả | ↩️ |
| returned | Đã trả | 📤 |

## 🗂️ Cấu trúc file tạo mới

```
frontend/app/orders/
├── [id]/
│   ├── page.tsx          (NEW) - Trang chi tiết đơn hàng
│   └── page.module.css   (NEW) - CSS cho trang chi tiết
├── page.tsx              (existing) - Trang danh sách
├── page.module.css       (existing)
├── components/           (existing)
└── lib/                  (existing)
```

## 🔄 API Endpoints sử dụng

### Backend
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders?userId={userId}&status={status}` - Lấy danh sách đơn hàng
- `GET /api/orders/{id}` - Lấy chi tiết đơn hàng

### Frontend (với token refresh tự động)
- `app/lib/apiClient.ts` - API client với token refresh
- `app/checkout/lib/orderApi.ts` - API order functions
- `app/orders/lib/orderApi.ts` - API order functions

## 🎨 Giao diện

### Danh sách đơn hàng
- Hiển thị từng đơn hàng dạng card
- Mỗi card hiển thị:
  - Tên cửa hàng + Mã đơn + Badge trạng thái
  - Danh sách sản phẩm với hình ảnh (placeholder) + số lượng + giá
  - Tổng tiền
  - Nút hành động phù hợp với trạng thái

### Chi tiết đơn hàng
- **Timeline trạng thái** ở trên cùng với animation
- **4 section thông tin:**
  1. Thông tin đơn hàng
  2. Thông tin giao hàng
  3. Danh sách sản phẩm (dạng bảng)
  4. Chi tiết thanh toán

## 🚀 Cách sử dụng

### Cho người dùng:
1. Hoàn tất mua hàng → Trang success hiển thị
2. Nhấp "Xem đơn hàng của tôi" → Xem danh sách đơn
3. Lọc hoặc tìm kiếm đơn hàng
4. Nhấp "Chi tiết" → Xem thông tin chi tiết + timeline trạng thái

### Cho admin/backend:
- Cập nhật status của Order model để timeline tự động cập nhật
- Các trạng thái được hỗ trợ: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `returning`, `returned`

## 💡 Tính năng bổ sung

Các tính năng có thể thêm vào trong tương lai:
- [ ] Upload hóa đơn PDF
- [ ] Theo dõi vị trí giao hàng (tracking)
- [ ] Chat với shop
- [ ] Hoàn tiền/Đổi hàng
- [ ] Rating & Review
- [ ] In đơn hàng

## 📝 Ghi chú

- Tất cả API calls đã có token refresh tự động (xem JWT_TOKEN_FIX.md)
- UI responsive trên mobile (< 480px), tablet (< 768px), desktop
- Skeleton loading khi tải dữ liệu
- Error handling với UI thân thiện
- Timeline status sử dụng emojis dễ nhìn
