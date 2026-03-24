// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Nunito_Sans, Open_Sans } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import styles from './layout.module.css';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import Chatbot from './components/chatbot';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter'
});
const nunito_sans = Nunito_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-nunito-sans'
});
const open_sans = Open_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-open-sans'
});

export const metadata: Metadata = {
  title: 'Cosmetics Shop',
  description: 'Nơi mua sắm mỹ phẩm uy tín',
};
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* TOP */}
        <div className="footer-top">
          <div className="footer-left">
            <img src="/img/logo.png" className="logo" />
            <p>MỸ PHẨM THIÊN NHIÊN LÀNH VÀ THẬT</p>
          </div>

          <div className="footer-subscribe">
            <input placeholder="Đăng ký email để nhận ưu đãi *" />
            <button>ĐĂNG KÝ</button>
          </div>
        </div>

        {/* GRID */}
        <div className="footer-grid">
          <div>
            <h4>VỀ CỎ MỀM</h4>
            <p>Chuyện của Cỏ</p>
            <p>Về nhà máy</p>
            <p>Tuyển dụng</p>
          </div>

          <div>
            <h4>HƯỚNG DẪN MUA HÀNG</h4>
            <p>Chính sách mua hàng và thanh toán</p>
            <p>Chính sách bảo hành</p>
            <p>Chính sách đổi trả và hoàn tiền</p>
            <p>Chính sách bảo mật thông tin</p>
          </div>

          <div>
            <h4>HOẠT ĐỘNG CỘNG ĐỒNG</h4>
            <p>Xây trường cho trẻ em</p>
            <p>Trồng rừng</p>
            <p>Chung tay phòng chống COVID</p>
          </div>

          <div className="footer-contact">
            <a href="/stores" className="store-btn">
              <i className="fas fa-store"></i>
              Hệ thống cửa hàng
            </a>

            <p>
              <b>EMAIL</b>
            </p>
            <a href="mailto:facebook@comem.vn">facebook@comem.vn</a>

            <p>
              <b>HOTLINE</b>
            </p>
            <a href="tel:1800646890">1800 646 890</a>

            <div className="social">
              <a href="https://facebook.com" target="_blank">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" target="_blank">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" target="_blank">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        {/* COMPANY */}
        <div className="footer-company">
          <h4>Công ty Cổ phần Mỹ phẩm Thiên nhiên Cỏ Mềm</h4>
          <p>GPĐKKD số 0109153702 do Sở KHĐT Tp.Hà Nội cấp 09/04/2020</p>
          <p>Sản xuất tại Nhà máy Mỹ phẩm Thiên Nhiên Song An</p>
          <p>225 Trần Đăng Ninh, Cầu Giấy, Hà Nội</p>
        </div>

        {/* BADGE */}
        <div className="footer-badge">
          <img src="/img/bocongthuong.png" />
          <img src="/img/dmca.png" />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        *Lưu ý: Tác dụng có thể thay đổi tùy cơ địa
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning={true}
      className={`${inter.variable} ${nunito_sans.variable} ${open_sans.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
        />
      </head>

     <body className={inter.className}>
  <Suspense fallback={<div>Loading...</div>}>
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Header />

          <main className={`container ${styles.mainContent}`}>
            {children}
          </main>

          <Footer />

          {/* ✅ CHATBOT */}
          <Chatbot />

        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  </Suspense>
</body>
    </html>
  );
}