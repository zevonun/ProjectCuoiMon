# 🔐 Setup Google OAuth20 - Hướng Dẫn Chi Tiết

## 1. Lấy Credentials từ Google Cloud Console

### Bước 1: Truy cập Google Cloud Console
- Vào https://console.cloud.google.com/
- Tạo dự án mới (hoặc chọn dự án hiện tại)

### Bước 2: Enable Google+ API
- Vào **API & Services > Library**
- Tìm **Google+ API** → Click **Enable**
- Tìm **OAuth 2.0** → Click **Create Credentials**

### Bước 3: Tạo OAuth 2.0 Credentials
- Loại: **Web application**
- Authorized Redirect URIs: `http://localhost:5000/api/users/auth/google/callback`
- Copy **Client ID** và **Client Secret**

## 2. Thêm vào .env

```dotenv
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/users/auth/google/callback
```

## 3. Backend Routes

### Route 1: Redirect đến Google
```
GET /api/users/auth/google
```
- Frontend gọi: `window.location.href = 'http://localhost:5000/api/users/auth/google'`
- Sẽ redirect đến Google login page

### Route 2: Callback từ Google
```
GET /api/users/auth/google/callback
```
- Google gọi route này sau khi user xác thực
- Response: HTML page chứa token (lưu vào localStorage)

## 4. Frontend Implementation

### Cách 1: Redirect Button
```jsx
// app/login/page.tsx
export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/users/auth/google';
  };

  return (
    <button onClick={handleGoogleLogin}>
      🔑 Đăng nhập với Google
    </button>
  );
}
```

### Cách 2: Popup (Advanced)
```jsx
const handleGoogleLoginPopup = () => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  const popup = window.open(
    'http://localhost:5000/api/users/auth/google',
    'Google Login',
    `width=${width},height=${height},left=${left},top=${top}`
  );
  
  // Listen for message từ popup
  window.addEventListener('message', (event) => {
    if (event.origin !== 'http://localhost:5000') return;
    
    const { token, refreshToken, user } = event.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    popup.close();
    window.location.href = '/'; // Redirect home
  });
};
```

## 5. Kiểm Tra Backend Credentials

### Chạy test
```bash
cd BE
npm install passport-google-oauth20  # (nếu chưa có)
npm start
```

### Test API
```bash
# Browser hoặc Postman
GET http://localhost:5000/api/users/auth/google
# Sẽ redirect đến Google login page
```

## 6. Troubleshooting

### Error: "Cannot GET /api/users/auth/google"
- ✅ Kiểm tra route đã được thêm vào routes/api/users.js
- ✅ Kiểm tra app.js đã require passport.js

### Error: "Invalid Credentials"
- ✅ Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env
- ✅ Kiểm tra GOOGLE_CALLBACK_URL chính xác

### Error: "redirect_uri_mismatch"
- ✅ Callback URL trong Google Cloud Console phải trùng với GOOGLE_CALLBACK_URL
- Ví dụ: `http://localhost:5000/api/users/auth/google/callback`

## 7. Production Setup

Khi deploy lên production:
```dotenv
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/users/auth/google/callback
```

Update trong Google Cloud Console:
- Authorized Redirect URIs: `https://yourdomain.com/api/users/auth/google/callback`

## 8. Database Schema

User model sẽ tự động thêm/cập nhật:
```javascript
{
  email: 'user@gmail.com',
  displayName: 'John Doe',
  googleId: 'google_unique_id',
  avatar: 'https://...',
  password: null // Không cần password cho Google login
}
```

---

**ℹ️ Notes:**
- Passport.js sẽ tự động tạo hoặc cập nhật user
- Token được set với expiry 24h
- RefreshToken được set với expiry 7d
