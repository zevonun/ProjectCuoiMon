'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut();
    router.replace('/login');
  }, [router]);

  return (
    <div style={{ padding: 40, color: '#94a3b8' }}>
      Đang đăng xuất...
    </div>
  );
}
