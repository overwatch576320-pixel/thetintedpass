import { useEffect, useRef, useState, useCallback } from "react";
import Swiper from "swiper";
import "swiper/css";
import "./stage2-carousel.css";
import { DEFAULT_BOOK_COLLECTION } from "../../../data/defaultBookCollection";

/**
 * Stage 2: Swiper Coverflow Carousel Prototype
 * Implements the Swiper Coverflow configuration with:
 * - 100% scale and 0° Y-axis rotation for center slide
 * - 75% scale and mirrored inward Y-axis rotation for side slides
 * - Progressive depth-of-field blur based on distance from center
 * - Verified responsive breakpoints and fluid touch/pointer dragging
 */
export default function Stage2Carousel({
  onSelectBook = null,
  books = DEFAULT_BOOK_COLLECTION,
}) {
  const swiperContainerRef = useRef(null);
  const swiperInstanceRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(2); // Center book initial (e.g. Hemis)

  const applyCustomCoverflow = useCallback((swiper) => {
    const slides = swiper.slides;
    if (!slides || !slides.length) return;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      // slide.progress: 0 at center, -1 for immediate left, +1 for immediate right
      const progress = slide.progress !== undefined ? slide.progress : 0;
      const absProgress = Math.abs(progress);

      // 1. Scale: 1.0 at center, 0.75 at immediate sides, smoothly interpolating
      let scale = 1.0;
      if (absProgress > 0) {
        scale = Math.max(0.58, 1.0 - absProgress * 0.25);
      }

      // 2. Inward-facing mirrored Y-axis rotation:
      // Left-side books (progress < 0) face inward towards right (+deg)
      // Right-side books (progress > 0) face inward towards left (-deg)
      // Center (progress = 0) has exactly 0° rotation
      let rotateY = 0;
      if (progress < 0) {
        rotateY = Math.min(60, Math.abs(progress) * 28);
      } else if (progress > 0) {
        rotateY = -Math.min(60, progress * 28);
      }

      // 3. Progressive depth-of-field blur:
      // Center is 0px blur, immediate sides ~1.5px, further ~3.5px to 5px
      const blurPx = Math.min(6, absProgress * 1.6);

      // 4. Progressive opacity:
      const opacity = Math.max(0.5, 1.0 - absProgress * 0.14);

      // 5. Z-index ordering (center on top)
      const zIndex = Math.round(100 - absProgress * 10);

      // Apply transform directly to slide inner card
      const card = slide.querySelector(".stage2-book-card");
      if (card) {
        card.style.transform = `scale(${scale.toFixed(4)}) rotateY(${rotateY.toFixed(2)}deg)`;
        card.style.filter = `blur(${blurPx.toFixed(2)}px)`;
        card.style.opacity = opacity.toFixed(3);
        slide.style.zIndex = String(zIndex);
      }
    }
  }, []);

  useEffect(() => {
    if (!swiperContainerRef.current) return;

    const swiper = new Swiper(swiperContainerRef.current, {
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      initialSlide: activeIndex,
      speed: 400,
      watchSlidesProgress: true,
      preventClicks: true,
      preventClicksPropagation: true,
      breakpoints: {
        320: {
          slidesPerView: 1.5,
          spaceBetween: 10,
        },
        580: {
          slidesPerView: 2.2,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3.5,
          spaceBetween: 24,
        },
        1280: {
          slidesPerView: 4,
          spaceBetween: 28,
        },
      },
      on: {
        init(s) {
          applyCustomCoverflow(s);
        },
        progress(s) {
          applyCustomCoverflow(s);
        },
        setTranslate(s) {
          applyCustomCoverflow(s);
        },
        slideChange(s) {
          setActiveIndex(s.activeIndex);
          if (onSelectBook) onSelectBook(books[s.activeIndex]);
        },
      },
    });

    swiperInstanceRef.current = swiper;

    return () => {
      swiper.destroy(true, true);
    };
  }, [applyCustomCoverflow, books, onSelectBook]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #09121a 0%, #15222e 60%, #1a2a38 100%)",
        color: "#f5f5f5",
        padding: "40px 20px",
        boxSizing: "border-box",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 640, marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#64b5f6",
            marginBottom: 8,
          }}
        >
          STAGE 2 VERIFICATION PROTOTYPE
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 10px 0", fontWeight: 400, letterSpacing: "-0.01em" }}>
          Swiper Coverflow Carousel Engine
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
          Center book: 100% scale, 0° rotation, 0px blur.
          <br />
          Side books: 75% scale, mirrored inward Y-axis rotation, progressive depth-of-field blur.
        </p>
      </div>

      {/* Swiper Carousel Root */}
      <div className="stage2-carousel-root">
        <div ref={swiperContainerRef} className="swiper stage2-swiper">
          <div className="swiper-wrapper">
            {books.map((book, idx) => (
              <div
                key={book.id}
                className={`swiper-slide stage2-slide ${
                  idx === activeIndex ? "is-active-slide" : ""
                }`}
                onClick={() => {
                  swiperInstanceRef.current?.slideTo(idx);
                }}
              >
                <div
                  className="stage2-book-card"
                  style={{
                    backgroundColor: book.coverColor,
                    borderColor: book.edgeColor,
                  }}
                >
                  <div>
                    <div className="stage2-card-eyebrow">
                      {book.edition || `COHORT 0${idx + 1}`}
                    </div>
                    <h3 className="stage2-card-title">{book.title}</h3>
                    <p className="stage2-card-subtitle">{book.subtitle}</p>
                  </div>

                  <div className="stage2-card-footer">
                    <span>THE TINTED PASS</span>
                    <span>{idx === activeIndex ? "CENTER (100%)" : "SIDE (75%)"}</span>
                  </div>

                  {/* Layered paper edge indicator */}
                  <div className="stage2-card-paper-edge" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostic indicator */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 20px",
          background: "rgba(0,0,0,0.35)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 12,
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
        }}
      >
        <span>Active Center Book: </span>
        <strong style={{ color: "#64b5f6" }}>{books[activeIndex]?.title}</strong>
        <span> (Slide {activeIndex + 1} of {books.length})</span>
      </div>
    </div>
  );
}
