import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: true, // QUAN TRỌNG: tránh lỗi private ip
  },
  turbopack: {
    root: path.join(process.cwd(), "."), // Đặt Turbopack workspace root đúng
  },
};

export default nextConfig;
