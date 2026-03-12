// app/components/Slideshow.tsx
"use client"; // Bắt buộc vì có tương tác (useState, useEffect)

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Định nghĩa kiểu dữ liệu cho mỗi ảnh
interface SlideImage {
  src: string;
  alt: string;
}

// Định nghĩa props cho component, cho phép truyền vào một mảng ảnh
interface SlideshowProps {
  images: SlideImage[];
}

export default function Slideshow({ images }: SlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0); // Dùng 0-based index

  // Hàm xử lý khi bấm nút prev/next
  const plusSlides = (n: number) => {
    let newIndex = currentSlide + n;
    
    if (newIndex >= images.length) {
      newIndex = 0; // Quay về slide đầu tiên
    } else if (newIndex < 0) {
      newIndex = images.length - 1; // Về slide cuối cùng
    }
    
    setCurrentSlide(newIndex);
  };

  // Tự động chuyển slide mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      // Tự động chuyển đến slide tiếp theo
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000); // 3000ms = 3 giây

    // Dọn dẹp interval khi component bị hủy
    return () => clearInterval(timer);
  }, [images.length]); // Chạy lại nếu số lượng ảnh thay đổi

  return (
    <section>
      <div className="slideshow-container">
        
        {images.map((image, index) => (
          <div
            key={index}
            className="mySlides"
            // Dùng style để ẩn/hiện, giống hệt logic JS cũ của bạn
            style={{ display: index === currentSlide ? 'block' : 'none' }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill // Tự động lấp đầy container
              objectFit="cover" // Tương đương với CSS object-fit
              priority={index === 0} // Ưu tiên tải ảnh đầu tiên
            />
          </div>
        ))}

        {/* Nút Bấm Prev/Next */}
        <a className="prev" onClick={() => plusSlides(-1)}>&#10094;</a>
        <a className="next" onClick={() => plusSlides(1)}>&#10095;</a>
      </div>
    </section>
  );
}