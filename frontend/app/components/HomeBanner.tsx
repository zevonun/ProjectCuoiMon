// k:\DAN\ProjectCuoiMon\frontend\app\components\HomeBanner.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Banner {
  id: string;
  image: string;
  title: string;
  link?: string;
  position: string;
  active: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomeBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH BANNERS FROM BACKEND
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        // Lọc position=home và active=true
        const res = await fetch(`${API_URL}/api/banners?position=home&active=true`, {
          cache: 'no-store'
        });
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((b: any) => ({
            id: b._id,
            image: b.image.startsWith('http') ? b.image : `${API_URL}${b.image}`,
            title: b.title,
            link: b.link,
            position: b.position,
            active: b.active
          }));
          setBanners(mapped);
        }
      } catch (err) {
        console.error("Lỗi fetch banner:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // ✅ NEXT / PREV
  const plusSlides = (n: number) => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => {
      let next = prev + n;
      if (next >= banners.length) next = 0;
      if (next < 0) next = banners.length - 1;
      return next;
    });
  };

  // ✅ AUTO SLIDE - 4 GIÂY (tăng thời gian để xem ảnh rõ hơn)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [banners]);

  if (loading) return (
    <div className="slideshow-container" style={{ background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Đang tải banner...</p>
    </div>
  );

  if (banners.length === 0) return null;

  return (
    <section>
      <div className="slideshow-container">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="mySlides"
            style={{ display: index === currentSlide ? "block" : "none" }}
          >
            {banner.link ? (
              <a href={banner.link} target="_blank" rel="noopener noreferrer">
                <Image
                  src={banner.image}
                  alt={banner.title || "Banner"}
                  fill
                  style={{ objectFit: "cover" }}
                  priority={index === 0}
                  unoptimized
                />
              </a>
            ) : (
              <Image
                src={banner.image}
                alt={banner.title || "Banner"}
                fill
                style={{ objectFit: "cover" }}
                priority={index === 0}
                unoptimized
              />
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <a className="prev" onClick={() => plusSlides(-1)}>&#10094;</a>
            <a className="next" onClick={() => plusSlides(1)}>&#10095;</a>
          </>
        )}
      </div>
    </section>
  );
}
