import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { PikaChevron } from "./PikaChevron";

export default function OpenSketchbook({
  pages = [],
  bookSettings = {},
  initialOpen = false,
  initialSpread = 0,
  onSpreadChange = null,
  showControls = true,
}) {
  // Book open/closed state: defaults to closed on both mobile and desktop!
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Ensure we have at least 4 individual pages, padded to an even number
  const formattedPages = useMemo(() => {
    const list = [...(pages || [])];
    while (list.length < 4) {
      const idx = list.length + 1;
      list.push({
        id: `page-${idx}`,
        pageNumber: idx,
        title: "Blank Folio",
        isBlank: true,
        image: null,
      });
    }
    // Pad to even number
    if (list.length % 2 !== 0) {
      const idx = list.length + 1;
      list.push({
        id: `page-${idx}`,
        pageNumber: idx,
        title: "Blank Folio",
        isBlank: true,
        image: null,
      });
    }
    return list;
  }, [pages]);

  const totalSpreads = Math.ceil(formattedPages.length / 2);
  const [spread, setSpread] = useState(() => Math.max(0, Math.min(totalSpreads - 1, initialSpread)));

  // Turn animation / direct-drag state
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [activeTurnDir, setActiveTurnDir] = useState(null); // 'forward' | 'backward' | null
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef(null);
  const animFrameRef = useRef(0);
  const dragRef = useRef(null);

  // Open book transition
  const handleOpenBook = useCallback(() => {
    if (isOpen || isOpening || isClosing) return;
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsOpening(false);
      setSpread(0);
    }, 440);
  }, [isOpen, isOpening, isClosing]);

  // Close book transition
  const handleCloseBook = useCallback(() => {
    if (!isOpen || isClosing || isOpening) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setSpread(0);
    }, 440);
  }, [isOpen, isClosing, isOpening]);

  // Synchronize when spread changes
  const changeSpread = useCallback(
    (newSpread) => {
      const clamped = Math.max(0, Math.min(totalSpreads - 1, newSpread));
      setSpread(clamped);
      if (onSpreadChange) onSpreadChange(clamped);
    },
    [totalSpreads, onSpreadChange]
  );

  // Smooth animation to complete or revert turn
  const animateTo = useCallback((targetProgress, onComplete) => {
    setIsAnimating(true);
    cancelAnimationFrame(animFrameRef.current);

    const startTime = performance.now();
    let startProgress = 0;
    setDragProgress((prev) => {
      startProgress = prev;
      return prev;
    });

    const duration = Math.max(160, 420 * Math.abs(targetProgress - startProgress));

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Natural spring-like easing (cubic ease-out)
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startProgress + (targetProgress - startProgress) * eased;
      setDragProgress(current);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
        if (onComplete) onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  // Programmatic turn (e.g. from desktop arrow buttons or keyboard)
  const turnSpread = useCallback(
    (direction) => {
      if (!isOpen || isAnimating || dragRef.current) return;
      if (direction === "forward" && spread >= totalSpreads - 1) return;
      if (direction === "backward") {
        if (spread <= 0) {
          // Backward on first spread smoothly closes the book back to cover!
          handleCloseBook();
          return;
        }
      }

      setActiveTurnDir(direction);
      setDragProgress(0);

      animateTo(1, () => {
        if (direction === "forward") {
          changeSpread(spread + 1);
        } else {
          changeSpread(spread - 1);
        }
        setActiveTurnDir(null);
        setDragProgress(0);
      });
    },
    [isOpen, isAnimating, spread, totalSpreads, animateTo, changeSpread, handleCloseBook]
  );

  // Keyboard navigation (desktop)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.closest("input, textarea, select, [contenteditable=true]")) return;
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenBook();
        }
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        turnSpread("forward");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        turnSpread("backward");
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCloseBook();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, turnSpread, handleOpenBook, handleCloseBook]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // --- Pointer & Direct Touch Drag Mechanics ---
  const handlePointerDown = (e) => {
    if (!isOpen || isAnimating || e.button !== 0 || e.target.closest(".open-book-nav-btn, .open-book-close-pill")) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isRightHalf = x >= rect.width / 2;

    const direction = isRightHalf ? "forward" : "backward";

    if (direction === "forward" && spread >= totalSpreads - 1) return;

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      direction,
      isLocked: false,
      isCancelled: false,
      startTime: performance.now(),
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || drag.isCancelled) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Detect gesture direction during initial movement
    if (!drag.isLocked) {
      if (Math.abs(dy) > Math.abs(dx) * 1.15 && Math.abs(dy) > 7) {
        // Vertical mobile page scroll: release pointer so native scroll works smoothly!
        drag.isCancelled = true;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (_) {}
        return;
      }
      if (Math.abs(dx) > 6) {
        drag.isLocked = true;
        setActiveTurnDir(drag.direction);
      } else {
        return;
      }
    }

    // Direct 1:1 finger tracking
    const halfWidth = (containerRef.current?.getBoundingClientRect().width || 400) / 2;
    let p = 0;
    if (drag.direction === "forward") {
      // Swiping right page to the left (dx is negative)
      p = -dx / halfWidth;
    } else {
      // Swiping left page to the right (dx is positive)
      p = dx / halfWidth;
    }

    // Clamp between 0 and 1: follows finger continuously, supports pausing halfway and reversing!
    p = Math.max(0, Math.min(1, p));
    setDragProgress(p);
  };

  const handlePointerUp = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    dragRef.current = null;

    if (!drag.isLocked || drag.isCancelled) {
      setActiveTurnDir(null);
      setDragProgress(0);
      return;
    }

    const dt = Math.max(1, performance.now() - drag.startTime);
    const dx = e.clientX - drag.startX;
    const velocity = Math.abs(dx) / dt; // px/ms

    // Fast flick or dragging past 45% completes the turn
    const isFlick =
      velocity > 0.45 &&
      (drag.direction === "forward" ? dx < -30 : dx > 30);
    const shouldComplete = dragProgress > 0.45 || isFlick;

    if (shouldComplete) {
      if (drag.direction === "backward" && spread === 0) {
        // Dragging left page backward past 0 closes the book back to cover!
        setActiveTurnDir(null);
        setDragProgress(0);
        handleCloseBook();
        return;
      }

      // Smoothly animate the rest of the way to 1.0
      animateTo(1, () => {
        if (drag.direction === "forward") {
          changeSpread(spread + 1);
        } else {
          changeSpread(spread - 1);
        }
        setActiveTurnDir(null);
        setDragProgress(0);
      });
    } else {
      // Smoothly reverse back to 0.0
      animateTo(0, () => {
        setActiveTurnDir(null);
        setDragProgress(0);
      });
    }
  };

  const handlePointerCancel = (e) => {
    if (dragRef.current && dragRef.current.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
      dragRef.current = null;
      animateTo(0, () => {
        setActiveTurnDir(null);
        setDragProgress(0);
      });
    }
  };

  // Content for current static spread
  const leftPageIndex = spread * 2;
  const rightPageIndex = spread * 2 + 1;
  const currentLeftPage = formattedPages[leftPageIndex];
  const currentRightPage = formattedPages[rightPageIndex];

  // Content for turning leaf
  let turningFrontPage = null;
  let turningBackPage = null;
  let underLeftPage = currentLeftPage;
  let underRightPage = currentRightPage;

  if (activeTurnDir === "forward") {
    // Right leaf turns over to become next left page
    turningFrontPage = currentRightPage;
    turningBackPage = formattedPages[rightPageIndex + 1];
    underLeftPage = currentLeftPage;
    underRightPage = formattedPages[rightPageIndex + 2] || { isBlank: true, pageNumber: rightPageIndex + 3 };
  } else if (activeTurnDir === "backward") {
    // Left leaf turns over to become previous right page
    turningFrontPage = currentLeftPage;
    turningBackPage = formattedPages[leftPageIndex - 1];
    underLeftPage = formattedPages[leftPageIndex - 2] || { isBlank: true, pageNumber: leftPageIndex - 1 };
    underRightPage = currentRightPage;
  }

  // Calculate 3D rotation angles & paper curl
  const isTurning = activeTurnDir !== null;
  let rotateAngle = 0;
  let curlSkew = 0;
  let leafShadowOpacity = 0;

  if (activeTurnDir === "forward") {
    rotateAngle = -dragProgress * 180;
    curlSkew = Math.sin(dragProgress * Math.PI) * 2.2;
    leafShadowOpacity = Math.sin(dragProgress * Math.PI) * 0.28;
  } else if (activeTurnDir === "backward") {
    rotateAngle = -(1 - dragProgress) * 180;
    curlSkew = Math.sin((1 - dragProgress) * Math.PI) * -2.2;
    leafShadowOpacity = Math.sin(dragProgress * Math.PI) * 0.28;
  }

  // Helper to render individual page content (sketch or blank placeholder)
  const renderPageContent = (pageData, isLeft) => {
    if (!pageData) return null;
    const pageNum = pageData.pageNumber || (isLeft ? spread * 2 + 1 : spread * 2 + 2);

    const imageSrc =
      pageData.image &&
      (pageData.image.startsWith("http") ||
        pageData.image.startsWith("data:") ||
        pageData.image.startsWith("/")
        ? pageData.image
        : `/${pageData.image}`);

    return (
      <div className={`open-page-content ${pageData.isBlank ? "is-blank-page" : "has-artwork"}`}>
        {imageSrc && !pageData.isBlank ? (
          <div className="open-page-art-container">
            <img
              src={imageSrc}
              alt={pageData.title || `Sketchbook Page ${pageNum}`}
              className="open-page-art-img"
              draggable={false}
            />
          </div>
        ) : (
          <div className="open-page-blank-paper">
            <div className="open-page-paper-texture" />
          </div>
        )}

        {/* Minimal Archival Page Number */}
        <span className={`open-page-folio-num ${isLeft ? "left-num" : "right-num"}`}>
          {String(pageNum).padStart(2, "0")}
        </span>
      </div>
    );
  };

  // --- RENDER 1: CLOSED STATE (Mobile & Desktop Initial View) ---
  if (!isOpen) {
    return (
      <div className="open-sketchbook-root is-closed-state" aria-label="Closed Artist Field Sketchbook">
        <div
          className={`closed-book-wrapper ${isOpening ? "is-opening" : ""}`}
          onClick={handleOpenBook}
          role="button"
          tabIndex={0}
          aria-label="Closed Artist Field Sketchbook. Tap or click to open double-page spread."
        >
          {/* 3D Physical Sketchbook Body */}
          <div className="closed-book-3d">
            {/* Stitched Spine Binding along Left Edge */}
            <div className="closed-book-spine" aria-hidden="true">
              <div className="closed-spine-crease" />
              <div className="closed-spine-stitches">
                <span /><span /><span /><span /><span /><span /><span />
              </div>
            </div>

            {/* Hardcover Front Plate */}
            <div className="closed-book-front-cover">
              <div className="closed-cover-inner-border">
                {/* Archival Debossed Eyebrow */}
                <div className="closed-cover-eyebrow">
                  {bookSettings.coverEyebrow || "TRANS-HIMALAYAN ATELIER · 2026"}
                </div>

                {/* Central Debossed Insignia */}
                <div className="closed-cover-emblem" aria-hidden="true">
                  <div className="closed-cover-crest">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2L2 22h20L12 2z" />
                      <path d="M12 8l4 8H8l4-8z" />
                    </svg>
                  </div>
                </div>

                {/* Cover Foil Typography */}
                <div className="closed-cover-titles">
                  <h2 className="closed-cover-main-title">
                    {bookSettings.bookTitle || "LADAKH EXPEDITION JOURNAL"}
                  </h2>
                  <p className="closed-cover-subtitle">
                    {bookSettings.bookSubtitle || "Plein Air Field Studies & Monastic Pigments"}
                  </p>
                </div>

                {/* Tap to Open Interactive Pill Cue */}
                <div className="closed-cover-cta">
                  <span className="closed-cta-pill">
                    <span className="closed-cta-dot" aria-hidden="true" />
                    TAP TO OPEN
                  </span>
                </div>
              </div>

              {/* Elastic Retention Ribbon */}
              <div className="closed-book-elastic" aria-hidden="true" />
            </div>

            {/* Layered Archival 300gsm Paper Block along Right & Bottom */}
            <div className="closed-book-paper-block right-edge" aria-hidden="true" />
            <div className="closed-book-paper-block bottom-edge" aria-hidden="true" />
          </div>

          {/* Natural Ambient Contact & Drop Shadow */}
          <div className="closed-book-shadow" aria-hidden="true" />
        </div>
      </div>
    );
  }

  // --- RENDER 2: OPEN DOUBLE-PAGE SPREAD ---
  return (
    <div className={`open-sketchbook-root is-open-state ${isClosing ? "is-closing" : ""}`} aria-label="Interactive Open Artist Sketchbook">
      {/* Desktop Previous Button (Hidden on Mobile) */}
      {showControls && (
        <button
          type="button"
          className="open-book-nav-btn prev-btn"
          onClick={() => turnSpread("backward")}
          disabled={isAnimating}
          aria-label={spread <= 0 ? "Close Sketchbook" : "Previous Spread"}
          title={spread <= 0 ? "Close Sketchbook" : "Previous Spread"}
        >
          <PikaChevron direction="left" />
        </button>
      )}

      {/* Close Control Pill (Minimal & Unobtrusive) */}
      <button
        type="button"
        className="open-book-close-pill"
        onClick={handleCloseBook}
        aria-label="Close sketchbook to cover"
        title="Close sketchbook"
      >
        <span>✕ Close Journal</span>
      </button>

      {/* The Physical Double-Page Open Sketchbook Spread */}
      <div
        ref={containerRef}
        className={`open-book-spread ${isTurning ? "is-turning" : ""} ${isAnimating ? "is-animating" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        role="region"
        aria-label={`Open Sketchbook: Showing Pages ${spread * 2 + 1} and ${spread * 2 + 2}`}
      >
        {/* Left Page (Underlying / Static) */}
        <div className="open-book-leaf left-leaf">
          {renderPageContent(underLeftPage, true)}
          <div className="open-leaf-spine-shadow left-spine-shadow" />
        </div>

        {/* Central Spine Binding Crease */}
        <div className="open-book-spine-groove" aria-hidden="true">
          <div className="spine-crease-highlight" />
          <div className="spine-crease-shadow" />
        </div>

        {/* Right Page (Underlying / Static) */}
        <div className="open-book-leaf right-leaf">
          {renderPageContent(underRightPage, false)}
          <div className="open-leaf-spine-shadow right-spine-shadow" />
        </div>

        {/* The 3D Turning Leaf (Active during continuous drag & animation) */}
        {isTurning && (
          <div
            className={`open-book-turning-leaf ${activeTurnDir}`}
            style={{
              transform: `perspective(1400px) rotateY(${rotateAngle}deg) skewY(${curlSkew}deg)`,
            }}
          >
            {/* Front Side of Turning Leaf */}
            <div className="turning-leaf-face face-front">
              {renderPageContent(turningFrontPage, activeTurnDir === "backward")}
              <div
                className="turning-leaf-shadow"
                style={{ opacity: leafShadowOpacity }}
              />
            </div>

            {/* Back Side of Turning Leaf */}
            <div className="turning-leaf-face face-back">
              {renderPageContent(turningBackPage, activeTurnDir === "forward")}
              <div
                className="turning-leaf-shadow"
                style={{ opacity: leafShadowOpacity }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Next Button (Hidden on Mobile) */}
      {showControls && (
        <button
          type="button"
          className="open-book-nav-btn next-btn"
          onClick={() => turnSpread("forward")}
          disabled={spread >= totalSpreads - 1 || isAnimating}
          aria-label="Next Spread"
          title="Next Spread"
        >
          <PikaChevron direction="right" />
        </button>
      )}
    </div>
  );
}
