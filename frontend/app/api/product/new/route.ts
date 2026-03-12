// app/api/product/new/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('http://localhost:5000/api/product/new', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Backend lỗi /product/new:', res.status, await res.text());
      return NextResponse.json({ success: false, data: [] });
    }

    const json = await res.json();
    const products = json.success && Array.isArray(json.data) ? json.data : [];

    // Sắp xếp mới nhất (nếu backend chưa sort)
    const sorted = products
      .sort((a: any, b: any) => (b.ngay || b.createdAt || '').localeCompare(a.ngay || a.createdAt || ''))
      .slice(0, 16);

    return NextResponse.json({ success: true, data: sorted });
  } catch (error) {
    console.error('Lỗi proxy new:', error);
    return NextResponse.json({ success: false, data: [] });
  }
}