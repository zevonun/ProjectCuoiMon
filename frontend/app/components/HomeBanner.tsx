"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Banner {
  _id: string;
  image: string;
  title?: string;
  link?: string;
  active?: boolean;
}

export default function HomeBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ LOAD BANNER – KHÔNG CÒN CẢNH BÁO REACT
  useEffect(() => {
    let isMounted = true;

    const fetchBanners = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/banners");
        const data = await res.json();

        if (isMounted && data.success) {
          const activeBanners = data.data.filter(
            (b: Banner) => b.active !== false
          );
          setBanners(activeBanners);
        }
      } catch (err) {
        console.error("Lỗi load banner:", err);
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ NEXT / PREV
  const plusSlides = (n: number) => {
    setCurrentSlide((prev) => {
      let next = prev + n;
      if (next >= banners.length) next = 0;
      if (next < 0) next = banners.length - 1;
      return next;
    });
  };

  // ✅ AUTO SLIDE
  useEffect(() => {
    if (!banners.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [banners]);

  if (!banners.length) return null;

  return (
    <section>
      <div className="slideshow-container">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className="mySlides"
            style={{ display: index === currentSlide ? "block" : "none" }}
          >
            <Image
              src={banner.image}
              alt={banner.title || "Banner"}
              fill
              style={{ objectFit: "cover" }}
              priority={index === 0}
            />
          </div>
        ))}

        <a className="prev" onClick={() => plusSlides(-1)}>
          &#10094;
        </a>
        <a className="next" onClick={() => plusSlides(1)}>
          &#10095;
        </a>
      </div>
    </section>
  );
}
