import React, { useEffect, useRef, useState, useCallback } from "react";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";
import { calculateBookDimensions } from "./responsive-dimensions";
import PhysicalBookSpread from "./PhysicalBookSpread";
import "./swiper-coverflow.css";

const DEFAULT_BOOKS = [
  {
    id: "slide-1",
    title: "Alchi Choskor",
    subtitle: "Ultramarine & Lapis Studies",
    image: "/editorial/sketchbook-a4-cover.jpg",
    coverColor: "#1b3358",
    edgeColor: "#0f1e33",
    pages: [
      { id: "p1", pageNumber: 1, title: "Alchi Monastery Study", image: "/editorial/sketch-placeholder-1.png", isBlank: false },
      { id: "p2", pageNumber: 2, title: "Lapis Lazuli Mineral Wash", image: "/editorial/sketch-placeholder-2.png", isBlank: false },
      { id: "p3", pageNumber: 3, title: "Courtyard Samovar", image: "/editorial/sketch-tea-stall.png", isBlank: false },
      { id: "p4", pageNumber: 4, title: "Monastic Window Herbs", image: "/editorial/sketch-window-plants.png", isBlank: false },
      { id: "p5", pageNumber: 5, title: "Village Dog Sunning", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
      { id: "p6", pageNumber: 6, title: "Archival Cotton Folio", isBlank: true },
    ],
  },
  {
    id: "slide-2",
    title: "Basgo Citadel",
    subtitle: "Trans-Himalayan Pass Journal",
    image: "/editorial/mountain-peaks.jpg",
    coverColor: "#1c2328",
    edgeColor: "#101417",
    pages: [
      { id: "b1", pageNumber: 1, title: "Citadel Stone Ramparts", image: "/editorial/mountain-peaks.jpg", isBlank: false },
      { id: "b2", pageNumber: 2, title: "Obsidian Slate Journal", image: "/editorial/mountain-notes.jpg", isBlank: false },
      { id: "b3", pageNumber: 3, title: "High Pass Ridge Path", image: "/editorial/contour-route.jpg", isBlank: false },
      { id: "b4", pageNumber: 4, title: "Plein Air Trail Marker", image: "/editorial/traveler-trail.png", isBlank: false },
      { id: "b5", pageNumber: 5, title: "Topographic Study", image: "/editorial/topographic-relief.jpg", isBlank: false },
      { id: "b6", pageNumber: 6, title: "Archival Field Folio", isBlank: true },
    ],
  },
  {
    id: "slide-3",
    title: "Hemis Monastery",
    subtitle: "Monastic Ochre & Murals",
    image: "/editorial/dark-forest.jpg",
    coverColor: "#8f3d2a",
    edgeColor: "#592418",
    pages: [
      { id: "h1", pageNumber: 1, title: "Monastic Ochre Courtyard", image: "/editorial/dark-forest.jpg", isBlank: false },
      { id: "h2", pageNumber: 2, title: "Mural Portrait Observation", image: "/editorial/sketch-placeholder-1.png", isBlank: false },
      { id: "h3", pageNumber: 3, title: "Steaming Brass Samovar", image: "/editorial/sketch-tea-stall.png", isBlank: false },
      { id: "h4", pageNumber: 4, title: "Terra Cotta Herb Pots", image: "/editorial/sketch-window-plants.png", isBlank: false },
      { id: "h5", pageNumber: 5, title: "Khardung La Raven", image: "/editorial/sketch-utility-pole.png", isBlank: false },
      { id: "h6", pageNumber: 6, title: "Handmade Rag Folio", isBlank: true },
    ],
  },
  {
    id: "slide-4",
    title: "Nubra Valley",
    subtitle: "Himalayan Juniper & Dunes",
    image: "/editorial/artidote-editorial.jpg",
    coverColor: "#1e382b",
    edgeColor: "#102219",
    pages: [
      { id: "n1", pageNumber: 1, title: "Himalayan Juniper & Dunes", image: "/editorial/artidote-editorial.jpg", isBlank: false },
      { id: "n2", pageNumber: 2, title: "Shyok River Transit", image: "/editorial/eiger-path.jpg", isBlank: false },
      { id: "n3", pageNumber: 3, title: "Diskit Roadside Tea", image: "/editorial/sketch-tea-stall.png", isBlank: false },
      { id: "n4", pageNumber: 4, title: "Monastery Flora", image: "/editorial/sketch-window-plants.png", isBlank: false },
      { id: "n5", pageNumber: 5, title: "Resting Dog Study", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
      { id: "n6", pageNumber: 6, title: "Blank Archival Rag Folio", isBlank: true },
    ],
  },
  {
    id: "slide-5",
    title: "Likir Sanctuary",
    subtitle: "Tibetan Turquoise Atelier",
    image: "/editorial/eiger-path.jpg",
    coverColor: "#135460",
    edgeColor: "#0b3138",
    pages: [
      { id: "l1", pageNumber: 1, title: "Tibetan Turquoise Sanctuary", image: "/editorial/eiger-path.jpg", isBlank: false },
      { id: "l2", pageNumber: 2, title: "Meltwater Stream Studies", image: "/editorial/oil-clouds.jpg", isBlank: false },
      { id: "l3", pageNumber: 3, title: "Sanctuary Tea Stall", image: "/editorial/sketch-tea-stall.png", isBlank: false },
      { id: "l4", pageNumber: 4, title: "Clay Herb Containers", image: "/editorial/sketch-window-plants.png", isBlank: false },
      { id: "l5", pageNumber: 5, title: "Valley Trail Bench", image: "/editorial/sketch-park-bench.png", isBlank: false },
      { id: "l6", pageNumber: 6, title: "Pure Archival Paper", isBlank: true },
    ],
  },
  {
    id: "slide-6",
    title: "Zanskar Gorge",
    subtitle: "Contour & River Study",
    image: "/editorial/contour-route.jpg",
    coverColor: "#2c3e50",
    edgeColor: "#1a252f",
    pages: [
      { id: "z1", pageNumber: 1, title: "Zanskar River Gorge", image: "/editorial/contour-route.jpg", isBlank: false },
      { id: "z2", pageNumber: 2, title: "Topographic Study", image: "/editorial/topographic-relief.jpg", isBlank: false },
      { id: "z3", pageNumber: 3, title: "High Trail Bench", image: "/editorial/sketch-park-bench.png", isBlank: false },
      { id: "z4", pageNumber: 4, title: "Archival Folio", isBlank: true },
    ],
  },
  {
    id: "slide-7",
    title: "Khardung La",
    subtitle: "High Pass Graphite",
    image: "/editorial/mountain-notes.jpg",
    coverColor: "#34495e",
    edgeColor: "#212f3d",
    pages: [
      { id: "k1", pageNumber: 1, title: "High Pass Field Study", image: "/editorial/mountain-notes.jpg", isBlank: false },
      { id: "k2", pageNumber: 2, title: "Raven at Approach", image: "/editorial/sketch-utility-pole.png", isBlank: false },
      { id: "k3", pageNumber: 3, title: "Cotton Paper Folio", isBlank: true },
    ],
  },
  {
    id: "slide-8",
    title: "Pangong Tso",
    subtitle: "Ultramarine Saline Lake",
    image: "/editorial/topographic-relief.jpg",
    coverColor: "#1a5276",
    edgeColor: "#11344a",
    pages: [
      { id: "pt1", pageNumber: 1, title: "Pangong Topography", image: "/editorial/topographic-relief.jpg", isBlank: false },
      { id: "pt2", pageNumber: 2, title: "Lapis Mineral Wash", image: "/editorial/sketch-placeholder-2.png", isBlank: false },
      { id: "pt3", pageNumber: 3, title: "Plein Air Folio", isBlank: true },
    ],
  },
  {
    id: "slide-9",
    title: "Lamayuru Moonland",
    subtitle: "Sedimentary Formations",
    image: "/editorial/vintage-relief.jpg",
    coverColor: "#784212",
    edgeColor: "#4e2a0b",
    pages: [
      { id: "lm1", pageNumber: 1, title: "Moonland Sediments", image: "/editorial/vintage-relief.jpg", isBlank: false },
      { id: "lm2", pageNumber: 2, title: "Monastic Window Study", image: "/editorial/sketch-window-plants.png", isBlank: false },
      { id: "lm3", pageNumber: 3, title: "Handmade Rag Folio", isBlank: true },
    ],
  },
  {
    id: "slide-10",
    title: "Shey Palace",
    subtitle: "Monastic Wall Terraces",
    image: "/editorial/traveler-trail.png",
    coverColor: "#4a235a",
    edgeColor: "#2d1537",
    pages: [
      { id: "s1", pageNumber: 1, title: "Shey Palace Ascent", image: "/editorial/traveler-trail.png", isBlank: false },
      { id: "s2", pageNumber: 2, title: "Sleeping Monastery Dog", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
      { id: "s3", pageNumber: 3, title: "Pure Field Folio", isBlank: true },
    ],
  },
];

/**
 * SwiperCoverflowCarousel
 * Unified architecture combining:
 * 1. Swiper Coverflow carousel with responsive A4 dimensions
 * 2. PhysicalBookSpread WebGL Three.js interactive 3D reading engine
 * 3. Strict separation of tap and drag
 * 4. Continuous background blur and softening during reading
 * 5. Closing from front or back with 100% geometric restoration
 */
export function SwiperCoverflowCarousel({ slides = DEFAULT_BOOKS }) {
  const containerRef = useRef(null);
  const swiperRef = useRef(null);
  const swiperInstance = useRef(null);

  const [activeRealIndex, setActiveRealIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingBook, setReadingBook] = useState(null);

  // Responsive dimensions calculated from available space
  const [dimensions, setDimensions] = useState(() =>
    calculateBookDimensions(
      typeof window !== "undefined" ? window.innerWidth : 1280,
      typeof window !== "undefined" ? window.innerHeight * 0.5 : 400
    )
  );

  // Calculate open book dimensions first and sync scale
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDims = () => {
      const rect = container.getBoundingClientRect();
      const dims = calculateBookDimensions(rect.width, rect.height);
      setDimensions(dims);
    };

    updateDims();
    const observer = new ResizeObserver(updateDims);
    observer.observe(container);
    window.addEventListener("resize", updateDims);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDims);
    };
  }, []);

  const openActiveBook = useCallback(() => {
    const swiper = swiperInstance.current;
    if (!swiper) return;
    const realIdx = swiper.realIndex;
    const book = slides[realIdx] || slides[0];
    setReadingBook(book);
    setIsReading(true);
  }, [slides]);

  // Swiper Coverflow initialization
  useEffect(() => {
    if (!swiperRef.current) return;

    const swiper = new Swiper(swiperRef.current, {
      effect: "coverflow",
      loop: true,
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      slideToClickedSlide: true,
      preventClicks: false,
      preventClicksPropagation: false,

      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },

      on: {
        slideChange(s) {
          setActiveRealIndex(s.realIndex);
        },
        tap(s, e) {
          // Swiper native tap detection
          const clicked = s.clickedSlide;
          if (clicked && clicked.classList.contains("swiper-slide-active")) {
            openActiveBook();
          }
        },
      },
    });

    swiperInstance.current = swiper;

    return () => {
      swiper.destroy(true, true);
    };
  }, [openActiveBook]);

  // Lock carousel drag when reading an open book
  useEffect(() => {
    const swiper = swiperInstance.current;
    if (!swiper) return;

    if (isReading) {
      swiper.allowTouchMove = false;
    } else {
      swiper.allowTouchMove = true;
    }
  }, [isReading]);

  // Fallback direct click handler on active slide
  const handleSlideClick = (e, index) => {
    const slideEl = e.currentTarget;
    if (slideEl.classList.contains("swiper-slide-active") && !isReading) {
      openActiveBook();
    }
  };

  // Continuous background blur callback driven directly by gesture progress
  const handleProgressChange = useCallback((prog) => {
    const container = containerRef.current;
    if (!container) return;

    const blurPx = prog * 14;
    const opacity = 1.0 - prog * 0.65;
    container.style.setProperty("--reading-blur", `${blurPx.toFixed(1)}px`);
    container.style.setProperty("--reading-opacity", opacity.toFixed(2));
  }, []);

  // Book closing callback
  const handleClose = useCallback((direction) => {
    setIsReading(false);
    setReadingBook(null);

    const container = containerRef.current;
    if (container) {
      container.style.setProperty("--reading-blur", "0px");
      container.style.setProperty("--reading-opacity", "1");
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`coverflow-carousel-container ${isReading ? "is-reading" : ""}`}
      style={{
        "--slide-width": `${dimensions.closedWidth}px`,
        "--slide-height": `${dimensions.closedHeight}px`,
      }}
      aria-label="Swiper Coverflow Carousel"
    >
      <div ref={swiperRef} className="swiper">
        <div className="swiper-wrapper">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="swiper-slide"
              role="group"
              aria-label={slide.title}
              onClick={(e) => handleSlideClick(e, index)}
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

      {/* Mount single 3D WebGL Physical Book Spread centered over active book */}
      {isReading && readingBook && (
        <PhysicalBookSpread
          book={readingBook}
          dimensions={dimensions}
          initialProgress={0}
          onProgressChange={handleProgressChange}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default SwiperCoverflowCarousel;
