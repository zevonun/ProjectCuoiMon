// app/api/product/hot/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('http://localhost:5000/api/product/hot', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Backend lỗi /product/hot:', res.status, await res.text());
      return NextResponse.json({ success: false, data: [] });
    }

    const json = await res.json();
    const products = json.success && Array.isArray(json.data) ? json.data : [];

    return NextResponse.json({ success: true, data: products.slice(0, 16) });
  } catch (error) {
    console.error('Lỗi proxy hot:', error);
    return NextResponse.json({ success: false, data: [] });
  }
}