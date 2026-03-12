"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");  // ĐÚNG 100% với cấu trúc của bạn
  }, [router]);

  return null;
}