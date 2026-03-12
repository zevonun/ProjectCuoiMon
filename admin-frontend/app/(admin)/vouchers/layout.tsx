// app/(admin)/vouchers/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function VouchersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const user = getUser();

        // Chưa đăng nhập
        if (!user) {
            alert("Vui lòng đăng nhập");
            router.push("/login");
            return;
        }

        // Không phải admin
        if (user.role !== "admin") {
            alert("Chỉ admin mới có quyền truy cập");
            router.push("/dashboard");
            return;
        }
    }, [router]);

    return <>{children}</>;
}