'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getUser, getAccessToken, signOut } from '@/lib/auth';
import '../globals.css';

type PermissionKey =
  | 'manage_products'
  | 'manage_orders'
  | 'manage_users'
  | 'manage_banners'
  | 'manage_categories'
  | 'manage_vouchers'
  | 'manage_admins'
  | 'manage_articles';

const getRequiredPermission = (pathname: string): PermissionKey | null => {
  if (pathname.startsWith('/dashboard')) return null;

  if (pathname.startsWith('/products')) return 'manage_products';
  if (pathname.startsWith('/categories')) return 'manage_categories';
  if (pathname.startsWith('/banners')) return 'manage_banners';
  if (pathname.startsWith('/vouchers')) return 'manage_vouchers';
  if (pathname.startsWith('/orders')) return 'manage_orders';
  if (pathname.startsWith('/manage-inventory')) return 'manage_products';
  if (pathname.startsWith('/brands')) return 'manage_products';

  // user/admin management + customer pages
  if (pathname.startsWith('/users')) return 'manage_users';
  if (pathname.startsWith('/customers')) return 'manage_users';

  // Treat reviews as product-management scope
  if (pathname.startsWith('/reviews')) return 'manage_products';
  if (pathname.startsWith('/articles')) return 'manage_articles';

  return null;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = getUser();
    const token = getAccessToken();

    if (!user || !token || user.role !== 'admin') {
      signOut();
      router.push('/login');
      return;
    }

    const required = getRequiredPermission(pathname);
    if (required) {
      const perms = (user as any)?.permissions || {};
      if (!perms?.[required]) {
        router.replace('/dashboard');
      }
    }
  }, [router, pathname]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
