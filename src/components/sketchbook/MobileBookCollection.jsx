import React, { useState, useRef, useEffect, useCallback } from "react";
import Closed3DBook from "./Closed3DBook";
import DesktopSketchbook from "./DesktopSketchbook";
import { DEFAULT_BOOK_COLLECTION } from "../../data/defaultBookCollection";
import "./sketchbook.css";

const PAGE_ASPECT = 1.4142857; // ISO A4 aspect ratio

function getMobileBookDimensions() {
  if (typeof window === "undefined") {
    return { width: 164, height: Math.round(164 * PAGE_ASPECT) };
  }
  const w = window.innerWidth;
  let bookW = 164;
  if (w < 380) {
    bookW = 154;
  } else if (w >= 415) {
    bookW = 174;
  } else {
    bookW = 164;
  }
  return { width: bookW, height: Math.round(bookW * PAGE_ASPECT) };
}

export default function MobileBookCollection({
  books = DEFAULT_BOOK_COLLECTION,
  initialIndex = 1, // Start with Book 1 in center, Book 0 on left, Book 2 on right
  onOpenBook,
  onCloseBook,
}) {
  const collection = books && books.length > 0 ? books : DEFAULT_BOOK_COLLECTION;
  const maxIndex = collection.length - 1;

  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(maxIndex, Math.max(0, initialIndex))
  );
  const [scrollProgress, setScrollProgress] = useState(() =>
    Math.min(maxIndex, Math.max(0, initialIndex))
  );
  const [viewMode, setViewMode] = useState("browsing"); // 'browsing' | 'opening' | 'open'
  const [openBookIndex, setOpenBookIndex] = useState(null);
  const [dimensions, setDimensions] = useState(getMobileBookDimensions);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const startProgressRef = useRef(0);
  const hasMovedRef = useRef(false);
  const animFrameRef = useRef(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setDimensions(getMobileBookDimensions());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth animation to target index
  const animateToProgress = useCallback(
    (target, duration = 380) => {
      cancelAnimationFrame(animFrameRef.current);
      const start = scrollProgress;
      const startTime = performance.now();
      const change = target - start;

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const current = start + change * easeOutCubic(t);
        setScrollProgress(current);

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          setScrollProgress(target);
          setActiveIndex(target);
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [scrollProgress]
  );

  // Pointer drag gestures
  const handlePointerDown = (e) => {
    if (viewMode !== "browsing") return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    cancelAnimationFrame(animFrameRef.current);
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
    startProgressRef.current = scrollProgress;
    hasMovedRef.current = false;

    if (containerRef.current) {
      try {
        containerRef.current.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || viewMode !== "browsing") return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!hasMovedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      hasMovedRef.current = true;
    }

    // Convert horizontal pixel drag to float index delta
    // Dragging ~160px advances 1 full book
    const dragSensitivity = dimensions.width * 0.95;
    const progressDelta = -dx / dragSensitivity;
    let newProgress = startProgressRef.current + progressDelta;

    // Apply rubber-band damping at boundaries
    if (newProgress < 0) {
      newProgress = newProgress * 0.25;
    } else if (newProgress > maxIndex) {
      newProgress = maxIndex + (newProgress - maxIndex) * 0.25;
    }

    setScrollProgress(newProgress);
  };

  const finishGesture = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (containerRef.current && e?.pointerId) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    const elapsed = Math.max(1, performance.now() - startTimeRef.current);
    const dx = e ? e.clientX - startXRef.current : 0;
    const velocity = dx / elapsed; // px/ms

    // If small movement or quick release without drag, let click handle it
    if (!hasMovedRef.current || Math.abs(dx) < 6) {
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 50);
      return;
    }

    // Reset hasMovedRef shortly after click event has had a chance to be cancelled
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);

    // Swipe flick detection
    let target = Math.round(scrollProgress);
    if (Math.abs(velocity) > 0.22 && elapsed < 400) {
      if (velocity < 0) {
        // Flicked left -> advance to next book
        target = Math.min(maxIndex, Math.ceil(scrollProgress));
      } else {
        // Flicked right -> return to previous book
        target = Math.max(0, Math.floor(scrollProgress));
      }
    }

    target = Math.max(0, Math.min(maxIndex, target));
    animateToProgress(target, 360);
  };

  const handlePointerUp = (e) => finishGesture(e);
  const handlePointerCancel = (e) => finishGesture(e);

  // Tap a book
  const handleBookTap = (index) => {
    if (hasMovedRef.current) return;

    if (index === Math.round(scrollProgress)) {
      // Tap centered book -> OPEN
      handleOpenBook(index);
    } else {
      // Tap side book -> smoothly animate to center it
      animateToProgress(index, 380);
    }
  };

  // Open book transition
  const handleOpenBook = (index) => {
    setOpenBookIndex(index);
    setViewMode("opening");
    if (onOpenBook) onOpenBook(collection[index]);

    setTimeout(() => {
      setViewMode("open");
    }, 240);
  };

  // Close book transition
  const handleCloseBook = () => {
    setViewMode("browsing");
    setOpenBookIndex(null);
    if (onCloseBook) onCloseBook();
    // Active index & scrollProgress remain preserved at the book that was just viewed!
  };

  // Calculate layout transform for each book in the fanned arrangement
  const getBookStyle = (index) => {
    const diff = index - scrollProgress;
    const absDiff = Math.abs(diff);

    // Lateral step offset: ~67px on mobile, ensuring 20-35px screen edge margins
    const stepX = dimensions.width * 0.41;
    const translateX = diff * stepX;

    // Subtle downward dip for side books
    const translateY = absDiff * 6;

    // Authentic fanned angles matching reference screenshot (~-12.5deg to +12.5deg)
    const rotateZ = diff * 12.5;

    // 3D perspective tilt
    const rotateY = -diff * 9;

    // Scale down slightly as books move to sides
    const scale = Math.max(0.74, 1 - absDiff * 0.075);

    // Z-index: center book is in front, side books tuck behind
    const zIndex = Math.max(1, Math.round(20 - absDiff * 6));

    // Opacity: prominently display ~3 books at a time, fade out further books
    let opacity = 1;
    if (absDiff > 1.2) {
      opacity = Math.max(0, 1 - (absDiff - 1.2) / 0.55);
    }
    if (absDiff >= 1.75) {
      opacity = 0;
    }

    return {
      "--book-w": `${dimensions.width}px`,
      "--book-h": `${dimensions.height}px`,
      transform: `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) rotateZ(${rotateZ.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
      zIndex,
      opacity,
      pointerEvents: absDiff < 1.3 ? "auto" : "none",
      transition: isDraggingRef.current ? "none" : "transform 0.35s ease-out, opacity 0.35s ease-out",
    };
  };

  const selectedBook = openBookIndex !== null ? collection[openBookIndex] : null;

  return (
    <div
      className={`mobile-book-collection-stage ${
        viewMode === "open" ? "is-reading-mode" : ""
      }`}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      aria-label="Interactive 3D Book Collection. Swipe to browse, tap to open."
    >
      {/* Browsing Fan Layout */}
      {viewMode !== "open" && (
        <div
          className={`fanned-collection-container ${
            viewMode === "opening" ? "is-fading-out" : ""
          }`}
          style={{ height: `${dimensions.height + 36}px` }}
        >
          {collection.map((book, idx) => (
            <div
              key={book.id || `book-${idx}`}
              className="fanned-book-slot"
              style={getBookStyle(idx)}
            >
              <Closed3DBook
                book={book}
                width={dimensions.width}
                height={dimensions.height}
                isActive={idx === Math.round(scrollProgress)}
                isOpening={viewMode === "opening" && openBookIndex === idx}
                onClick={() => handleBookTap(idx)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Active Open Book (Three.js Double-Page Spread Engine) */}
      {viewMode === "open" && selectedBook && (
        <div className="open-book-viewport animate-fade-in">
          {/* Subtle Back to Collection Action Bar */}
          <div className="open-book-header-bar">
            <button
              className="return-to-collection-btn"
              onClick={handleCloseBook}
              aria-label="Close book and return to collection"
            >
              <span className="return-arrow" aria-hidden="true">←</span>
              <span>COLLECTION ({openBookIndex + 1} OF {collection.length})</span>
            </button>
            <span className="open-book-title-tag">{selectedBook.title}</span>
          </div>

          {/* Mount Three.js Double-Page Spread Engine with this specific book's pages */}
          <div className="open-book-canvas-container">
            <DesktopSketchbook
              key={`open-book-${selectedBook.id}`}
              bookSettings={{
                title: selectedBook.title,
                subtitle: selectedBook.subtitle,
                edition: selectedBook.edition,
                coverColor: selectedBook.coverColor,
                edgeColor: selectedBook.edgeColor,
                paperColor: selectedBook.paperColor,
                coverImage: selectedBook.coverImage || null,
              }}
              pages={selectedBook.pages || []}
              initialPage={1} // Open immediately to double-page spread!
              onPageChange={(page) => {
                if (page === 0) {
                  // User turned backward past spread 1 to front cover: close and return to collection!
                  handleCloseBook();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
