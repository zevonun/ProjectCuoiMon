"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LOCAL_BANNERS = [
  {
    id: 1,
    image: "/img/banner/banner-1.webp",
    title: "Banner 1",
  },
  {
    id: 2,
    image: "/img/banner/banner-2.webp",
    title: "Banner 2",
  },
  {
    id: 3,
    image: "/img/banner/banner-3.webp",
    title: "Banner 3",
  },
];

export default function HomeBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = LOCAL_BANNERS;

  // ✅ NEXT / PREV
  const plusSlides = (n: number) => {
    setCurrentSlide((prev) => {
      let next = prev + n;
      if (next >= banners.length) next = 0;
      if (next < 0) next = banners.length - 1;
      return next;
    });
  };

  // ✅ AUTO SLIDE - 2.5 GIÂY
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 2500);

    return () => clearInterval(timer);
  }, [banners]);

  return (
    <section>
      <div className="slideshow-container">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
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
