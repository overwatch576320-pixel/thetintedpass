import React, { useState, useRef, useEffect } from "react";
import "./sketchbook.css";

/**
 * Persistent3DBook
 * An authentic physical 3D hardcover artist sketchbook.
 *
 * It remains the EXACT SAME physical object across:
 * - 'inCollection': fanned upright in the 3-book mobile arrangement.
 * - 'opening': immediately lifts forward to reading position while front cover rotates -180°.
 * - 'open': double-page cotton rag spread with gesture-driven page turning.
 * - 'closing': cover folds shut and book smoothly settles back into its fanned slot.
 */
export default function Persistent3DBook({
  book,
  bookIndex,
  scrollProgress,
  animationState = "inCollection",
  targetBookIndex = null,
  dimensions = { width: 160, height: 226 },
  onTap,
  onCloseRequest,
}) {
  const W = dimensions.width;
  const H = dimensions.height;
  const D = 22; // Physical hardcover depth / spine thickness in pixels

  const [currentSpread, setCurrentSpread] = useState(1);
  const [dragProgress, setDragProgress] = useState(0);
  const [isDraggingLeaf, setIsDraggingLeaf] = useState(false);
  const leafDragRef = useRef(null);

  const coverColor = book.coverColor || "#1c2328";
  const edgeColor = book.edgeColor || "#101417";
  const paperColor = book.paperColor || "#fbf8f0";

  // Reset spread to 1 when book closes or returns to collection
  useEffect(() => {
    if (animationState === "inCollection" || animationState === "closing") {
      setCurrentSpread(1);
      setDragProgress(0);
      setIsDraggingLeaf(false);
    }
  }, [animationState]);

  // Compute 3-book fanned arrangement coordinates
  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);

  const isTargetBook = targetBookIndex === bookIndex;
  const isOpeningOrOpen = (animationState === "opening" || animationState === "open") && isTargetBook;
  const isClosing = animationState === "closing" && isTargetBook;
  const isAnyActive = (animationState === "opening" || animationState === "open" || animationState === "closing") && targetBookIndex !== null;
  const isBackgroundBook = isAnyActive && !isTargetBook;

  // --- FAN POSITIONING (Zero 3D Intersection, Zero Distortion) ---
  // Lateral step offset: ~70px between books on 390px screens
  const stepX = W * 0.44;
  const fanX = diff * stepX;
  // Natural downward curvature for side books
  const fanY = absDiff * 6;
  // 3D Depth separation:
  // Center book (absDiff === 0): Z = +30px (prominently in front)
  // Side books (absDiff > 0): Z = -30px (recessed behind by 60px!)
  // This physically separates bounding planes along Z, preventing polygon clipping and z-fighting.
  const fanZ = absDiff === 0 ? 30 : -30 - (absDiff - 1) * 35;
  // Gentle fan rotation: -8.5deg on left, +8.5deg on right
  const fanRotateZ = diff * 8.5;
  // Controlled Y rotation: faces slightly toward viewer
  const fanRotateY = -diff * 5.0;
  // Scale stepping: 1.0 at center, 0.94 at sides
  const fanScale = Math.max(0.75, 1 - absDiff * 0.06);

  // Stacking z-index: center is highest, side books tucked behind
  const zIndex = isTargetBook
    ? 100
    : isBackgroundBook
    ? Math.max(1, Math.round(10 - absDiff * 2))
    : Math.max(1, Math.round(30 - absDiff * 8));

  // Opacity: Center and 2 side books are 100% full opacity in collection
  let fanOpacity = 1;
  if (absDiff > 1.35) {
    fanOpacity = Math.max(0, 1 - (absDiff - 1.35) / 0.45);
  }
  if (absDiff >= 1.8) {
    fanOpacity = 0;
  }

  // --- TRANSFORMATION STATE (Fanned vs Reading) ---
  // When opening or open: shift X by W/2 so the spine is at screen center,
  // making the 2W wide double-page spread perfectly centered on mobile!
  const currentX = isTargetBook && (isOpeningOrOpen || isClosing) ? W / 2 : fanX;
  const currentY = isTargetBook && (isOpeningOrOpen || isClosing) ? -8 : fanY;
  const currentZ = isTargetBook && (isOpeningOrOpen || isClosing) ? 75 : fanZ;
  const currentRotateZ = isTargetBook && (isOpeningOrOpen || isClosing) ? 0 : fanRotateZ;
  const currentRotateY = isTargetBook && (isOpeningOrOpen || isClosing) ? 0 : fanRotateY;
  const currentScale = isTargetBook && (isOpeningOrOpen || isClosing) ? 1.0 : fanScale;

  // Background books fade out completely when any book is opening or open
  const currentOpacity = isBackgroundBook ? 0 : isTargetBook ? 1 : fanOpacity;

  // Front cover leaf rotation: 0° closed, -180° open
  let coverAngle = 0;
  if (isTargetBook) {
    if (animationState === "open") {
      coverAngle = -180;
    } else if (animationState === "opening") {
      coverAngle = -180;
    } else if (animationState === "closing") {
      coverAngle = 0;
    }
  }

  // --- INTERACTIVE PAGE TURNING (WHEN OPEN) ---
  const handleLeafPointerDown = (e) => {
    if (animationState !== "open" || !isTargetBook) return;
    leafDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      direction: e.clientX < window.innerWidth / 2 ? -1 : 1, // -1 = left page, 1 = right page
      moved: false,
    };
  };

  const handleLeafPointerMove = (e) => {
    const gesture = leafDragRef.current;
    if (!gesture || animationState !== "open") return;

    const dx = e.clientX - gesture.startX;
    if (Math.abs(dx) > 6) {
      gesture.moved = true;
      setIsDraggingLeaf(true);
    }

    if (gesture.direction === 1) {
      const progress = Math.max(0, Math.min(1, -dx / (W * 0.85)));
      setDragProgress(progress);
    } else {
      const progress = Math.max(0, Math.min(1, dx / (W * 0.85)));
      setDragProgress(progress);
    }
  };

  const handleLeafPointerUp = () => {
    const gesture = leafDragRef.current;
    if (!gesture || animationState !== "open") {
      leafDragRef.current = null;
      return;
    }
    leafDragRef.current = null;

    if (!gesture.moved) {
      // Clean tap on page: right page advances, left page retreats
      if (gesture.direction === 1) {
        advanceSpread(1);
      } else {
        advanceSpread(-1);
      }
    } else {
      // Drag released
      if (gesture.direction === 1 && dragProgress > 0.32) {
        advanceSpread(1);
      } else if (gesture.direction === -1 && dragProgress > 0.32) {
        advanceSpread(-1);
      }
    }
    setIsDraggingLeaf(false);
    setDragProgress(0);
  };

  const advanceSpread = (delta) => {
    const totalSpreads = Math.ceil((book.pages?.length || 8) / 2);
    const next = currentSpread + delta;

    if (next < 1) {
      // Turned backward past Spread 1 -> close book and return to fan!
      if (onCloseRequest) onCloseRequest();
      return;
    }

    if (next <= totalSpreads) {
      setCurrentSpread(next);
    }
  };

  const isFirstSpread = currentSpread === 1;

  // Spread page numbering
  const spreadIndex = currentSpread - 1;
  const leftPageNum = spreadIndex * 2 + 1;
  const rightPageNum = spreadIndex * 2 + 2;

  const leftPageData = book.pages?.[leftPageNum - 1] || null;
  const rightPageData = book.pages?.[rightPageNum - 1] || null;

  return (
    <div
      className={`persistent-3d-book-root ${isTargetBook ? "is-target-book" : ""} ${
        isOpeningOrOpen ? "is-book-open" : ""
      } ${isBackgroundBook ? "is-background-book" : ""}`}
      style={{
        width: `${W}px`,
        height: `${H}px`,
        marginLeft: `-${W / 2}px`,
        marginTop: `-${H / 2}px`,
        zIndex,
        opacity: currentOpacity,
        pointerEvents: isTargetBook ? "auto" : absDiff < 1.35 && !isAnyActive ? "auto" : "none",
        transform: `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, ${currentZ.toFixed(2)}px) rotateZ(${currentRotateZ.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`,
        transition: isTargetBook
          ? "transform 0.62s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease"
          : "transform 0.35s ease-out, opacity 0.35s ease-out, filter 0.4s ease",
      }}
      onClick={!isAnyActive ? onTap : undefined}
      role="button"
      tabIndex={0}
      aria-label={`${book.title} - ${isOpeningOrOpen ? "Open sketchbook" : "Tap to open book"}`}
    >
      {/* 3D Physical Hardcover Volume */}
      <div
        className="persistent-book-chassis"
        style={{
          width: `${W}px`,
          height: `${H}px`,
        }}
        onPointerDown={handleLeafPointerDown}
        onPointerMove={handleLeafPointerMove}
        onPointerUp={handleLeafPointerUp}
        onPointerCancel={handleLeafPointerUp}
      >
        {/* Soft Contact Shadow on Surface */}
        <div className="persistent-contact-shadow" aria-hidden="true" />

        {/* 1. BACK HARDCOVER BOARD (Faces -Z) */}
        <div
          className="persistent-book-face persistent-back-cover"
          style={{
            width: `${W}px`,
            height: `${H}px`,
            backgroundColor: coverColor,
            borderColor: edgeColor,
          }}
          aria-hidden="true"
        >
          <div className="persistent-back-monogram">TTP</div>
        </div>

        {/* 2. SPINAL CASING (Faces -X, on Left Edge) */}
        <div
          className="persistent-book-face persistent-spine-casing"
          style={{
            width: `${D}px`,
            height: `${H}px`,
            backgroundColor: coverColor,
          }}
          aria-hidden="true"
        >
          <div className="persistent-spine-sheen" />
          <div className="persistent-spine-title">
            <span>{book.title}</span>
          </div>
        </div>

        {/* 3. FORE-EDGE PAPER BLOCK (Faces +X, on Right Edge, only when closed) */}
        {!isOpeningOrOpen && (
          <div
            className="persistent-book-face persistent-fore-edge"
            style={{
              width: `${D}px`,
              height: `${H - 4}px`,
              backgroundColor: paperColor,
            }}
            aria-hidden="true"
          >
            <div className="persistent-paper-lines" />
          </div>
        )}

        {/* 4. INTERIOR SPREAD (Visible when Open) */}
        {/* Right Wing (Folio 02 on Spread 1, Folio 04 on Spread 2, etc.) */}
        <div
          className="persistent-right-page-wing"
          style={{
            width: `${W}px`,
            height: `${H}px`,
            backgroundColor: paperColor,
          }}
        >
          <div className="persistent-folio-surface">
            {rightPageData?.image ? (
              <img
                src={rightPageData.image}
                alt={rightPageData.title || `Page ${rightPageNum}`}
                className="persistent-folio-img"
              />
            ) : (
              <div className="persistent-folio-blank">
                <span className="persistent-folio-num right-num">
                  {String(rightPageNum).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
          <div className="persistent-gutter-shade right-gutter" />
        </div>

        {/* Spine Gutter Ridge & Bookmark Ribbon (Only rendered when open or opening) */}
        {isOpeningOrOpen && (
          <div className="persistent-spine-ridge" aria-hidden="true">
            <div
              className="persistent-bookmark-ribbon"
              style={{ backgroundColor: coverColor }}
            />
          </div>
        )}

        {/* 6. ROTATING FRONT HARDCOVER LEAF (Hinged along Left Spine Edge) */}
        <div
          className="persistent-cover-leaf"
          style={{
            width: `${W}px`,
            height: `${H}px`,
            transform: `rotateY(${coverAngle}deg)`,
            transition: isTargetBook
              ? "transform 0.64s cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        >
          {/* A. Outside Face of Front Cover (Visible when closed) */}
          <div
            className="persistent-leaf-face front-outside-face"
            style={{
              backgroundColor: coverColor,
              borderColor: edgeColor,
            }}
          >
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title || "Book Cover"}
                className="persistent-cover-art"
              />
            ) : (
              <div className="persistent-solid-cover">
                <div className="cover-top-spacer" />
                <div className="cover-typography-block">
                  <span className="cover-brand-eyebrow">THE TINTED PASS</span>
                  <h3 className="cover-main-title">{book.title}</h3>
                  {book.subtitle && (
                    <span className="cover-subtitle">{book.subtitle}</span>
                  )}
                  {book.edition && (
                    <span className="cover-edition-tag">{book.edition}</span>
                  )}
                </div>
                <div className="cover-bottom-spacer">
                  <span className="cover-bottom-monogram">TTP</span>
                </div>
              </div>
            )}
            <div className="persistent-cover-sheen" aria-hidden="true" />
          </div>

          {/* B. Inside Face of Front Cover: Left Wing Folio (Visible when open) */}
          <div
            className="persistent-leaf-face front-inside-face"
            style={{
              backgroundColor: paperColor,
            }}
          >
            <div className="persistent-folio-surface">
              {leftPageData?.image ? (
                <img
                  src={leftPageData.image}
                  alt={leftPageData.title || `Page ${leftPageNum}`}
                  className="persistent-folio-img"
                />
              ) : (
                <div className="persistent-folio-blank">
                  <span className="persistent-folio-num left-num">
                    {String(leftPageNum).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            <div className="persistent-gutter-shade left-gutter" />
          </div>
        </div>

        {/* 7. Dynamic Turning Leaf (for Spreads 2+) */}
        {isDraggingLeaf && (
          <div
            className="persistent-turning-leaf"
            style={{
              width: `${W}px`,
              height: `${H}px`,
              backgroundColor: paperColor,
              transform: `rotateY(${-dragProgress * 180}deg)`,
            }}
          >
            <div className="leaf-curl-shadow" />
          </div>
        )}
      </div>
    </div>
  );
}
