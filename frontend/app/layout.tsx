// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Nunito_Sans, Open_Sans } from 'next/font/google';
import './globals.css';
import styles from './layout.module.css';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

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
    <footer className={styles.footer}>
      <div className="container">
        <p>&copy; 2025 MyBeauty. All rights reserved.</p>
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
        {/* DUY NHẤT 1 DÒNG NÀY LÀ ĐỦ */}
        <link rel="stylesheet" href="/css/product-details.css" />
      </head>

      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              <Header />
              <main className={`container ${styles.mainContent}`}>
                {children}
              </main>
              <Footer />
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}