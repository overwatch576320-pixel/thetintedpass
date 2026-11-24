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
  initialIndex = 2, // Start with Book 2 (Hemis Monastery) centered to display layered wings on both sides
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

  // Unified continuous physical opening progress: 0.0 (closed in collection) -> 1.0 (fully open spread)
  const [openProgress, setOpenProgress] = useState(0);
  const openProgressRef = useRef(0);
  const openAnimRef = useRef(null);
  const [targetBookIndex, setTargetBookIndex] = useState(null);

  const [dragYaw, setDragYaw] = useState(0);
  const [dragVelocity, setDragVelocity] = useState(0);
  const [dimensions, setDimensions] = useState(getMobileBookDimensions);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const startTimeRef = useRef(0);
  const startProgressRef = useRef(0);
  const hasMovedRef = useRef(false);
  const scrollAnimRef = useRef(null);

  // Responsive resize listener
  useEffect(() => {
    const handleResize = () => setDimensions(getMobileBookDimensions());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  // Smooth scroll along the collection fan with dynamic movement-responsive yaw
  const animateScrollTo = useCallback(
    (target, duration = 360) => {
      cancelAnimationFrame(scrollAnimRef.current);
      const start = scrollProgress;
      const startTime = performance.now();
      const change = target - start;
      const snapVelocity = change < 0 ? -1 : change > 0 ? 1 : 0;
      setDragVelocity(snapVelocity);

      const step = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const current = start + change * easeOutCubic(t);
        setScrollProgress(current);

        const snapDirection = change > 0 ? -1 : 1;
        const snapMagnitude = Math.min(1, Math.abs(change));
        const snapBell = Math.sin(Math.PI * t);
        setDragYaw(snapDirection * snapMagnitude * 10 * snapBell);

        if (t < 1) {
          scrollAnimRef.current = requestAnimationFrame(step);
        } else {
          setScrollProgress(target);
          setActiveIndex(target);
          setDragYaw(0);
          setDragVelocity(0);
        }
      };

      scrollAnimRef.current = requestAnimationFrame(step);
    },
    [scrollProgress]
  );

  // Smooth continuous physical opening / closing animation loop (60 FPS, fully reversible)
  const animateToOpenProgress = useCallback((targetProgress, duration = 760) => {
    cancelAnimationFrame(openAnimRef.current);
    const startProgress = openProgressRef.current;
    const change = targetProgress - startProgress;

    if (Math.abs(change) < 0.001) {
      openProgressRef.current = targetProgress;
      setOpenProgress(targetProgress);
      if (targetProgress === 0) setTargetBookIndex(null);
      return;
    }

    // Adaptive duration so reversing mid-flight maintains constant physical speed
    const actualDuration = Math.max(160, duration * Math.abs(change));
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / actualDuration);
      // Smoothstep polynomial S(t) = t * t * (3 - 2 * t)
      const eased = t * t * (3 - 2 * t);
      const current = startProgress + change * eased;
      openProgressRef.current = current;
      setOpenProgress(current);

      if (t < 1) {
        openAnimRef.current = requestAnimationFrame(step);
      } else {
        openProgressRef.current = targetProgress;
        setOpenProgress(targetProgress);
        if (targetProgress === 0) {
          setTargetBookIndex(null);
        }
      }
    };

    openAnimRef.current = requestAnimationFrame(step);
  }, []);

  // --- HORIZONTAL SWIPE BROWSING ---
  const handlePointerDown = (e) => {
    // Disable carousel dragging while book is opening, open, or closing
    if (openProgressRef.current > 0.02) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    cancelAnimationFrame(scrollAnimRef.current);
    cancelAnimationFrame(openAnimRef.current);
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
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
    if (!isDraggingRef.current || openProgressRef.current > 0.02) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!hasMovedRef.current && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      hasMovedRef.current = true;
    }

    const dragSensitivity = dimensions.width * 0.95;
    const progressDelta = -dx / dragSensitivity;
    let newProgress = startProgressRef.current + progressDelta;

    if (newProgress < 0) {
      newProgress = newProgress * 0.25;
    } else if (newProgress > maxIndex) {
      newProgress = maxIndex + (newProgress - maxIndex) * 0.25;
    }

    setScrollProgress(newProgress);

    const currentDeltaX = e.clientX - (lastXRef.current || startXRef.current);
    lastXRef.current = e.clientX;
    const instantYaw = Math.max(-13, Math.min(13, currentDeltaX * 1.8));
    setDragYaw(instantYaw);
    const instantVelocity = currentDeltaX !== 0 ? (currentDeltaX > 0 ? -1 : 1) : 0;
    setDragVelocity(instantVelocity);
  };

  const finishGesture = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastXRef.current = 0;
    setDragVelocity(0);

    if (containerRef.current && e?.pointerId) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    const elapsed = Math.max(1, performance.now() - startTimeRef.current);
    const dx = e ? e.clientX - startXRef.current : 0;
    const velocity = dx / elapsed;

    if (!hasMovedRef.current || Math.abs(dx) < 7) {
      setDragYaw(0);
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 50);
      return;
    }

    setTimeout(() => {
      hasMovedRef.current = false;
    }, 60);

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

  // --- PHYSICAL BOOK SELECTION & OPENING ---
  const handleBookTap = (index) => {
    if (hasMovedRef.current) return;

    // If tapping while already open or opening:
    if (openProgressRef.current > 0.05 && targetBookIndex === index) {
      return;
    }

    cancelAnimationFrame(scrollAnimRef.current);
    setTargetBookIndex(index);
    setDragYaw(0);
    setDragVelocity(0);

    // Smoothly lifts front cover and opens sketchbook in 760ms
    animateToOpenProgress(1.0, 760);
    if (onOpenBook) onOpenBook(collection[index]);
  };

  // --- PHYSICAL BOOK CLOSING ---
  const handleCloseBook = () => {
    if (openProgressRef.current < 0.02) return;

    // Smoothly rotates front cover back around spine hinge and returns to fan in 720ms
    animateToOpenProgress(0.0, 720);
    if (onCloseBook) onCloseBook();
  };

  const isReadingMode = openProgress > 0.05;
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
      aria-label="Interactive 3D Book Collection. Tap any book to open, or swipe to browse."
    >
      {/* Top Action Bar when Book is Opening or Open (Independent absolute overlay) */}
      {selectedBook && openProgress > 0.005 && (
        <div
          className="open-book-header-bar"
          style={{
            opacity: Math.min(1, openProgress * 1.8),
            pointerEvents: openProgress > 0.2 ? "auto" : "none",
          }}
          aria-hidden={openProgress < 0.05}
        >
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
            openProgress={openProgress}
            targetBookIndex={targetBookIndex}
            dragYaw={dragYaw}
            dragVelocity={dragVelocity}
            dimensions={dimensions}
            onTap={() => handleBookTap(idx)}
            onCloseRequest={handleCloseBook}
          />
        ))}
      </div>
    </div>
  );
}
