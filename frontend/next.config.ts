import type { NextConfig } from "next";

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
};

export default nextConfig;
