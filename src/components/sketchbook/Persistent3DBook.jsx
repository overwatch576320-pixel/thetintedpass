import React, { useState, useRef, useEffect } from "react";
import { getCoordinatedBookTransform } from "./bookCollisionAvoidance";
import "./sketchbook.css";

/**
 * Persistent3DBook
 * An authentic physical 3D hardcover artist sketchbook.
 *
 * It remains the EXACT SAME physical object across:
 * - 'inCollection': fanned upright in the 3-book mobile arrangement.
 * - 'repositioning': coordinated dynamic local Z-axis rotation & collision avoidance.
 * - 'opening': front cover leaf swings open outward (-180°).
 * - 'open': double-page cotton rag spread with gesture-driven page turning.
 * - 'closingCover': front cover swings shut (0°).
 * - 'reversing': smooth coordinated return to original fanned slots without collision.
 */
export default function Persistent3DBook({
  book,
  bookIndex,
  scrollProgress,
  animationState = "inCollection",
  targetBookIndex = null,
  transitionProgress = 1.0,
  dragYaw = 0,
  dragVelocity = 0,
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
    if (
      animationState === "inCollection" ||
      animationState === "closingCover" ||
      animationState === "reversing"
    ) {
      setCurrentSpread(1);
      setDragProgress(0);
      setIsDraggingLeaf(false);
    }
  }, [animationState]);

  // Compute coordinated 3D transform with dynamic local Z-axis rotation, movement-responsive Y-axis rotation, and collision avoidance
  const bookTransform = getCoordinatedBookTransform({
    bookIndex,
    scrollProgress,
    targetBookIndex,
    animationState,
    transitionProgress,
    dragYaw,
    dragVelocity,
    dimensions,
    totalBooks: 5,
  });

  const {
    x: currentX,
    y: currentY,
    z: currentZ,
    rotateZ: currentRotateZ,
    rotateY: currentRotateY,
    scale: currentScale,
    opacity: currentOpacity,
    filter: currentFilter,
    zIndex,
    coverAngle,
    isTarget: isTargetBook,
  } = bookTransform;

  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);

  const isAnyActive = targetBookIndex !== null && animationState !== "inCollection";
  const isBackgroundBook = isAnyActive && !isTargetBook;
  const isOpeningOrOpen =
    (animationState === "opening" || animationState === "open" || animationState === "closingCover") &&
    isTargetBook;

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

  // Progressive depth-of-field softening for distant books
  let dofFilter = currentFilter || "none";
  if (isBackgroundBook) {
    dofFilter = "brightness(0.68) blur(0.4px)";
  }

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
        filter: dofFilter,
        pointerEvents: isTargetBook ? "auto" : absDiff < 2.5 && !isAnyActive ? "auto" : "none",
        transform: `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, ${currentZ.toFixed(2)}px) rotateZ(${currentRotateZ.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`,
        transition:
          animationState === "repositioning" || animationState === "reversing"
            ? "none"
            : animationState === "inCollection"
            ? "none" // Driven at 60fps by requestAnimationFrame / pointer gestures without transition lag
            : isAnyActive
            ? "opacity 0.45s ease"
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
            transition:
              isTargetBook &&
              (animationState === "opening" ||
                animationState === "open" ||
                animationState === "closingCover")
                ? "transform 0.62s cubic-bezier(0.22, 1, 0.36, 1)"
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
