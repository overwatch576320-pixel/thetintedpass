import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Swiper from "swiper";
import "swiper/css";
import { PhysicalBook } from "./PhysicalBook";
import { DEFAULT_BOOK_COLLECTION } from "../../../data/defaultBookCollection";
import "./interactive-collection.css";

/**
 * THE TINTED PASS — Interactive 3D Book Collection (v2 Engine)
 * Rebuilt with a clean dual-engine architecture:
 * 1. Swiper Coverflow Engine: Controls outer carousel positioning, perspective,
 *    75% side-book scale, mirrored inward Y-axis rotation, and progressive depth-of-field blur.
 * 2. Physical Book Engine: Controls internal 3D sketchbook mechanics, authentic spine hinge,
 *    subdivided flexible paper curl deformation, corner dragging, and closing from back cover.
 */
export function InteractiveBookCollection({
  books = DEFAULT_BOOK_COLLECTION,
  initialBookIndex = 2, // Start with Hemis Monastery centered
}) {
  const swiperContainerRef = useRef(null);
  const swiperInstanceRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(initialBookIndex);
  const [openBookId, setOpenBookId] = useState(null);
  const [pageMap, setPageMap] = useState({});

  // Curate rich, distinct pages for each book in the collection
  const enrichedBooks = useMemo(() => {
    const artCatalog = [
      [
        { id: "alchi-1", pageNumber: 1, title: "Alchi Monastery Study", image: "/editorial/sketch-placeholder-1.png", isBlank: false },
        { id: "alchi-2", pageNumber: 2, title: "Lapis Lazuli Mineral Wash", image: "/editorial/sketch-placeholder-2.png", isBlank: false },
        { id: "alchi-3", pageNumber: 3, title: "Courtyard Samovar", image: "/editorial/sketch-tea-stall.png", isBlank: false },
        { id: "alchi-4", pageNumber: 4, title: "Monastic Window Herbs", image: "/editorial/sketch-window-plants.png", isBlank: false },
        { id: "alchi-5", pageNumber: 5, title: "Village Dog Sunning", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
        { id: "alchi-6", pageNumber: 6, title: "Pass Rest Bench", image: "/editorial/sketch-park-bench.png", isBlank: false },
        { id: "alchi-7", pageNumber: 7, title: "Mountain Telegraph Raven", image: "/editorial/sketch-utility-pole.png", isBlank: false },
        { id: "alchi-8", pageNumber: 8, title: "Archival Cotton Folio", image: null, isBlank: true },
      ],
      [
        { id: "basgo-1", pageNumber: 1, title: "Citadel Stone Ramparts", image: "/editorial/mountain-peaks.jpg", isBlank: false },
        { id: "basgo-2", pageNumber: 2, title: "Obsidian Slate Journal", image: "/editorial/mountain-notes.jpg", isBlank: false },
        { id: "basgo-3", pageNumber: 3, title: "High Pass Ridge Path", image: "/editorial/contour-route.jpg", isBlank: false },
        { id: "basgo-4", pageNumber: 4, title: "Plein Air Trail Marker", image: "/editorial/traveler-trail.png", isBlank: false },
        { id: "basgo-5", pageNumber: 5, title: "Topographic Study", image: "/editorial/topographic-relief.jpg", isBlank: false },
        { id: "basgo-6", pageNumber: 6, title: "Village Courtyard Plants", image: "/editorial/sketch-window-plants.png", isBlank: false },
        { id: "basgo-7", pageNumber: 7, title: "Raven at Solitary Post", image: "/editorial/sketch-utility-pole.png", isBlank: false },
        { id: "basgo-8", pageNumber: 8, title: "Archival Field Folio", image: null, isBlank: true },
      ],
      [
        { id: "hemis-1", pageNumber: 1, title: "Monastic Ochre Courtyard", image: "/editorial/sketch-placeholder-1.png", isBlank: false },
        { id: "hemis-2", pageNumber: 2, title: "Mural Portrait Observation", image: "/editorial/sketch-placeholder-2.png", isBlank: false },
        { id: "hemis-3", pageNumber: 3, title: "Steaming Brass Samovar", image: "/editorial/sketch-tea-stall.png", isBlank: false },
        { id: "hemis-4", pageNumber: 4, title: "Terra Cotta Herb Pots", image: "/editorial/sketch-window-plants.png", isBlank: false },
        { id: "hemis-5", pageNumber: 5, title: "Village Dog in Sun", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
        { id: "hemis-6", pageNumber: 6, title: "Sanctuary Rest Bench", image: "/editorial/sketch-park-bench.png", isBlank: false },
        { id: "hemis-7", pageNumber: 7, title: "Khardung La Raven", image: "/editorial/sketch-utility-pole.png", isBlank: false },
        { id: "hemis-8", pageNumber: 8, title: "Handmade Rag Folio", image: null, isBlank: true },
      ],
      [
        { id: "nubra-1", pageNumber: 1, title: "Himalayan Juniper & Dunes", image: "/editorial/dark-forest.jpg", isBlank: false },
        { id: "nubra-2", pageNumber: 2, title: "Shyok River Transit", image: "/editorial/eiger-path.jpg", isBlank: false },
        { id: "nubra-3", pageNumber: 3, title: "Diskit Roadside Tea", image: "/editorial/sketch-tea-stall.png", isBlank: false },
        { id: "nubra-4", pageNumber: 4, title: "Monastery Courtyard Flora", image: "/editorial/sketch-window-plants.png", isBlank: false },
        { id: "nubra-5", pageNumber: 5, title: "Resting Dog Study", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
        { id: "nubra-6", pageNumber: 6, title: "High Ridge Viewpoint", image: "/editorial/sketch-park-bench.png", isBlank: false },
        { id: "nubra-7", pageNumber: 7, title: "Pass Solitary Raven", image: "/editorial/sketch-utility-pole.png", isBlank: false },
        { id: "nubra-8", pageNumber: 8, title: "Blank Archival Rag Folio", image: null, isBlank: true },
      ],
      [
        { id: "likir-1", pageNumber: 1, title: "Tibetan Turquoise Sanctuary", image: "/editorial/artidote-editorial.jpg", isBlank: false },
        { id: "likir-2", pageNumber: 2, title: "Meltwater Stream Studies", image: "/editorial/oil-clouds.jpg", isBlank: false },
        { id: "likir-3", pageNumber: 3, title: "Sanctuary Tea Stall", image: "/editorial/sketch-tea-stall.png", isBlank: false },
        { id: "likir-4", pageNumber: 4, title: "Clay Herb Containers", image: "/editorial/sketch-window-plants.png", isBlank: false },
        { id: "likir-5", pageNumber: 5, title: "Sleeping Monastery Dog", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
        { id: "likir-6", pageNumber: 6, title: "Valley Trail Bench", image: "/editorial/sketch-park-bench.png", isBlank: false },
        { id: "likir-7", pageNumber: 7, title: "Raven at High Approach", image: "/editorial/sketch-utility-pole.png", isBlank: false },
        { id: "likir-8", pageNumber: 8, title: "Pure Archival Paper", image: null, isBlank: true },
      ],
    ];

    return books.map((b, idx) => ({
      ...b,
      pages: artCatalog[idx % artCatalog.length],
    }));
  }, [books]);

  // Apply custom Coverflow transformations to every slide
  const applyCoverflowTransforms = useCallback((swiper) => {
    const slides = swiper.slides;
    if (!slides || !slides.length) return;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const progress = slide.progress !== undefined ? slide.progress : 0;
      const absProgress = Math.abs(progress);

      // 1. Scale: 100% at center (0), 75% at immediate sides (1), diminishing smoothly
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
      const blurPx = Math.min(6, absProgress * 1.6);

      // 4. Progressive opacity:
      const opacity = Math.max(0.5, 1.0 - absProgress * 0.14);

      // 5. Z-index ordering
      const zIndex = Math.round(100 - absProgress * 10);

      const inner = slide.querySelector(".tinted-book-slide-inner");
      if (inner) {
        inner.style.transform = `scale(${scale.toFixed(4)}) rotateY(${rotateY.toFixed(2)}deg)`;
        inner.style.filter = `blur(${blurPx.toFixed(2)}px)`;
        inner.style.opacity = opacity.toFixed(3);
        slide.style.zIndex = String(zIndex);
      }
    }
  }, []);

  // Initialize Swiper Coverflow
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
      touchStartPreventDefault: false,
      breakpoints: {
        320: {
          spaceBetween: 12,
        },
        580: {
          spaceBetween: 18,
        },
        768: {
          spaceBetween: 24,
        },
        1024: {
          spaceBetween: 32,
        },
        1280: {
          spaceBetween: 40,
        },
      },
      on: {
        init(s) {
          applyCoverflowTransforms(s);
        },
        progress(s) {
          applyCoverflowTransforms(s);
        },
        setTranslate(s) {
          applyCoverflowTransforms(s);
        },
        slideChange(s) {
          setActiveIndex(s.activeIndex);
          // Non-center books are strictly closed resting covers
          setPageMap({});
          setOpenBookId(null);
        },
      },
    });

    swiperInstanceRef.current = swiper;

    return () => {
      swiper.destroy(true, true);
    };
  }, [applyCoverflowTransforms, activeIndex]);

  // Isolate carousel dragging while an open book is being read
  useEffect(() => {
    const swiper = swiperInstanceRef.current;
    if (!swiper) return;

    if (openBookId !== null) {
      // Lock carousel gestures so book page swipe doesn't slide the carousel
      swiper.allowTouchMove = false;
    } else {
      // Restore carousel browsing
      swiper.allowTouchMove = true;
    }
  }, [openBookId]);

  const activeBook = enrichedBooks[activeIndex] || enrichedBooks[0];

  return (
    <div
      className="tinted-book-collection-root"
      aria-label="3D Interactive Artist Book Collection"
      onClick={(e) => {
        // If user clicks outside the active book while a book is open, close it smoothly
        if (!e.target.closest(".physical-book-container") && openBookId !== null) {
          setOpenBookId(null);
          setPageMap({});
        }
      }}
    >
      {/* Active book location tag */}
      <div className="tinted-book-active-tag">
        <div className="tinted-book-active-pill">
          <span className="tinted-book-active-dot" aria-hidden="true" />
          <span>{activeBook.title}</span>
        </div>
      </div>

      {/* Swiper Coverflow Carousel */}
      <div ref={swiperContainerRef} className="swiper tinted-book-swiper">
        <div className="swiper-wrapper">
          {enrichedBooks.map((book, idx) => {
            const isCenter = idx === activeIndex;
            const isOpen = openBookId === book.id;
            const bookPage = pageMap[book.id] || 0;

            return (
              <div
                key={book.id}
                className={`swiper-slide tinted-book-slide ${
                  isCenter ? "is-center-book" : "is-side-book"
                }`}
                onClick={(e) => {
                  if (!isCenter) {
                    e.stopPropagation();
                    // Close any open book and slide new book to center
                    setOpenBookId(null);
                    setPageMap({});
                    swiperInstanceRef.current?.slideTo(idx);
                  }
                }}
              >
                <div className="tinted-book-slide-inner">
                  <PhysicalBook
                    book={book}
                    currentPage={bookPage}
                    interactive={isCenter}
                    onPageChange={(newPage) => {
                      setPageMap((prev) => ({ ...prev, [book.id]: newPage }));
                      if (newPage > 0) {
                        setOpenBookId(book.id);
                      }
                    }}
                    onOpen={() => {
                      setOpenBookId(book.id);
                    }}
                    onClose={() => {
                      setOpenBookId(null);
                      setPageMap((prev) => ({ ...prev, [book.id]: 0 }));
                    }}
                  />
                </div>

                {/* Click blocker on side books to ensure click transitions smoothly to center */}
                {!isCenter && (
                  <div
                    className="tinted-book-slide-overlay"
                    aria-label={`Select ${book.title}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InteractiveBookCollection;
