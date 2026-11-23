import React, { useState, useRef, useEffect, useCallback } from "react";
import Persistent3DBook from "./Persistent3DBook";
import { DEFAULT_BOOK_COLLECTION } from "../../data/defaultBookCollection";
import "./sketchbook.css";

const PAGE_ASPECT = 1.4142857; // ISO A4 aspect ratio

function getMobileBookDimensions() {
  if (typeof window === "undefined") {
    return { width: 160, height: Math.round(160 * PAGE_ASPECT) };
  }
  const w = window.innerWidth;
  let bookW = 160;
  if (w < 380) {
    // 375px screens (iPhone SE)
    bookW = 150;
  } else if (w >= 415) {
    // 430px screens (iPhone Pro Max / Plus)
    bookW = 172;
  } else {
    // 390px screens (iPhone 13 / 14 / 15)
    bookW = 160;
  }
  return { width: bookW, height: Math.round(bookW * PAGE_ASPECT) };
}

export default function MobileBookCollection({
  books = DEFAULT_BOOK_COLLECTION,
  initialIndex = 1, // Start with Book 1 (Basgo Citadel) centered
  onOpenBook,
  onCloseBook,
}) {
  const collection = books && books.length > 0 ? books : DEFAULT_BOOK_COLLECTION;
  const maxIndex = collection.length - 1;

  // Browsing index & smooth scroll progress
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(maxIndex, Math.max(0, initialIndex))
  );
  const [scrollProgress, setScrollProgress] = useState(() =>
    Math.min(maxIndex, Math.max(0, initialIndex))
  );

  // Animation State: 'inCollection' | 'opening' | 'open' | 'closing'
  const [animationState, setAnimationState] = useState("inCollection");
  const [targetBookIndex, setTargetBookIndex] = useState(null);
  const [dimensions, setDimensions] = useState(getMobileBookDimensions);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const startProgressRef = useRef(0);
  const hasMovedRef = useRef(false);
  const scrollAnimRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Responsive resize listener
  useEffect(() => {
    const handleResize = () => setDimensions(getMobileBookDimensions());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  // Smooth scroll along the collection fan
  const animateScrollTo = useCallback(
    (target, duration = 360) => {
      cancelAnimationFrame(scrollAnimRef.current);
      const start = scrollProgress;
      const startTime = performance.now();
      const change = target - start;

      const step = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const current = start + change * easeOutCubic(t);
        setScrollProgress(current);

        if (t < 1) {
          scrollAnimRef.current = requestAnimationFrame(step);
        } else {
          setScrollProgress(target);
          setActiveIndex(target);
        }
      };

      scrollAnimRef.current = requestAnimationFrame(step);
    },
    [scrollProgress]
  );

  // --- HORIZONTAL SWIPE BROWSING ---
  const handlePointerDown = (e) => {
    if (animationState !== "inCollection") return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    cancelAnimationFrame(scrollAnimRef.current);
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
    if (!isDraggingRef.current || animationState !== "inCollection") return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // Movement threshold to differentiate tap from swipe
    if (!hasMovedRef.current && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      hasMovedRef.current = true;
    }

    const dragSensitivity = dimensions.width * 0.95;
    const progressDelta = -dx / dragSensitivity;
    let newProgress = startProgressRef.current + progressDelta;

    // Damped boundary rubber-banding
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
    const velocity = dx / elapsed;

    // If tap without drag, let handleBookTap execute immediately
    if (!hasMovedRef.current || Math.abs(dx) < 7) {
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 50);
      return;
    }

    setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);

    // Momentum flick
    let target = Math.round(scrollProgress);
    if (Math.abs(velocity) > 0.22 && elapsed < 400) {
      if (velocity < 0) {
        target = Math.min(maxIndex, Math.ceil(scrollProgress));
      } else {
        target = Math.max(0, Math.floor(scrollProgress));
      }
    }

    target = Math.max(0, Math.min(maxIndex, target));
    animateScrollTo(target, 340);
  };

  const handlePointerUp = (e) => finishGesture(e);
  const handlePointerCancel = (e) => finishGesture(e);

  // --- SINGLE-TAP IMMEDIATE OPENING (NO SEPARATE SELECTION STEP) ---
  const handleBookTap = (index) => {
    if (animationState !== "inCollection" || hasMovedRef.current) return;

    cancelAnimationFrame(scrollAnimRef.current);
    clearTimeout(openTimerRef.current);
    clearTimeout(closeTimerRef.current);

    // Immediately designate this tapped book as the target
    setTargetBookIndex(index);
    // Begin continuous physical opening animation immediately!
    setAnimationState("opening");
    if (onOpenBook) onOpenBook(collection[index]);

    // Settle into stable open double-page spread
    openTimerRef.current = setTimeout(() => {
      setAnimationState("open");
    }, 640);
  };

  // --- CLOSING SEQUENCE ---
  const handleCloseBook = () => {
    if (animationState !== "open" && animationState !== "opening") return;

    clearTimeout(openTimerRef.current);
    clearTimeout(closeTimerRef.current);

    // 1. Animate cover shut and chassis gliding back to fan slot
    setAnimationState("closing");
    if (onCloseBook) onCloseBook();

    // 2. Return to 'inCollection' once settled back into slot
    closeTimerRef.current = setTimeout(() => {
      setAnimationState("inCollection");
      setTargetBookIndex(null);
    }, 580);
  };

  const isReadingMode = animationState === "open" || animationState === "opening";
  const selectedBook = targetBookIndex !== null ? collection[targetBookIndex] : null;

  return (
    <div
      className={`fanned-book-collection-stage ${
        isReadingMode ? "is-reading-mode" : ""
      }`}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      aria-label="Interactive 3D Book Collection. Tap any book to open immediately, or swipe to browse."
    >
      {/* Top Action Bar when Book is Open */}
      {isReadingMode && selectedBook && (
        <div className="open-book-header-bar animate-fade-in">
          <button
            className="return-to-collection-btn"
            onClick={handleCloseBook}
            aria-label="Close book and return to collection"
          >
            <span className="return-arrow" aria-hidden="true">←</span>
            <span>COLLECTION ({targetBookIndex + 1} OF {collection.length})</span>
          </button>
          <span className="open-book-title-tag">{selectedBook.title}</span>
        </div>
      )}

      {/* 3D Scene Container */}
      <div
        className="fanned-3d-scene"
        style={{
          height: `${dimensions.height + 42}px`,
        }}
      >
        {collection.map((book, idx) => (
          <Persistent3DBook
            key={book.id || `fanned-book-${idx}`}
            book={book}
            bookIndex={idx}
            scrollProgress={scrollProgress}
            animationState={animationState}
            targetBookIndex={targetBookIndex}
            dimensions={dimensions}
            onTap={() => handleBookTap(idx)}
            onCloseRequest={handleCloseBook}
          />
        ))}
      </div>
    </div>
  );
}
