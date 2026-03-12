'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getUser, getAccessToken, signOut } from '@/lib/auth';
import '../globals.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    const token = getAccessToken();

    if (!user || !token || user.role !== 'admin') {
      signOut();
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
