import React, { useEffect, useRef } from "react";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";
import "./swiper-coverflow.css";

const DEFAULT_SLIDES = [
  { id: "slide-1", title: "Alchi Choskor", image: "/editorial/sketchbook-a4-cover.jpg" },
  { id: "slide-2", title: "Basgo Citadel", image: "/editorial/mountain-peaks.jpg" },
  { id: "slide-3", title: "Hemis Monastery", image: "/editorial/dark-forest.jpg" },
  { id: "slide-4", title: "Nubra Valley", image: "/editorial/artidote-editorial.jpg" },
  { id: "slide-5", title: "Likir Sanctuary", image: "/editorial/eiger-path.jpg" },
  { id: "slide-6", title: "Zanskar Gorge", image: "/editorial/contour-route.jpg" },
  { id: "slide-7", title: "Khardung La", image: "/editorial/mountain-notes.jpg" },
  { id: "slide-8", title: "Pangong Tso", image: "/editorial/topographic-relief.jpg" },
  { id: "slide-9", title: "Lamayuru Moonland", image: "/editorial/vintage-relief.jpg" },
  { id: "slide-10", title: "Shey Palace", image: "/editorial/traveler-trail.png" },
];

/**
 * SwiperCoverflowCarousel
 * Direct reproduction of the user-supplied Swiper Coverflow reference.
 * Simple image cards only - zero book geometry, opening/closing, or page deformation.
 */
export function SwiperCoverflowCarousel({ slides = DEFAULT_SLIDES }) {
  const swiperRef = useRef(null);
  const swiperInstance = useRef(null);

  useEffect(() => {
    if (!swiperRef.current) return;

    // Use exact supplied Swiper Coverflow configuration
    const swiper = new Swiper(swiperRef.current, {
      effect: "coverflow",
      loop: true,
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "1",

      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },

      breakpoints: {
        320: {
          slidesPerView: 1.5,
        },
        580: {
          slidesPerView: 2,
        },
        767: {
          slidesPerView: 3,
        },
        992: {
          slidesPerView: 3.5,
        },
        1200: {
          slidesPerView: 4,
        },
        1400: {
          slidesPerView: 4.5,
        },
      },
    });

    swiperInstance.current = swiper;

    return () => {
      swiper.destroy(true, true);
    };
  }, []);

  return (
    <div className="coverflow-carousel-container" aria-label="Swiper Coverflow Carousel">
      <div ref={swiperRef} className="swiper">
        <div className="swiper-wrapper">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="swiper-slide"
              role="group"
              aria-label={slide.title}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="slide-card-image"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SwiperCoverflowCarousel;
