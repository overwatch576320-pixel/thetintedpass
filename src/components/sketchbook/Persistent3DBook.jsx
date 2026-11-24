import React, { useState, useRef, useEffect } from "react";
import { getCoordinatedBookTransform } from "./bookCollisionAvoidance";
import "./sketchbook.css";

/**
 * Persistent3DBook
 * An authentic physical 3D hardcover artist sketchbook.
 *
 * It remains the EXACT SAME physical object across:
 * - Closed in collection fan (0.0): upright, mirrored inward yaw, 3D hardcover volume.
 * - Opening / Closing (0.0 < p < 1.0): front cover lifts naturally around the left spine hinge,
 *   smoothly revealing the page stack underneath with physical cast shadows and centering shift.
 * - Open spread (1.0): full double-page spread with gesture-driven folio navigation.
 */
export default function Persistent3DBook({
  book,
  bookIndex,
  scrollProgress,
  openProgress = 0,
  targetBookIndex = null,
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

  // Reset spread to 1 when book closes
  useEffect(() => {
    if (openProgress === 0) {
      setCurrentSpread(1);
      setDragProgress(0);
      setIsDraggingLeaf(false);
    }
  }, [openProgress]);

  // Compute continuous 60fps 3D transforms for physical positioning
  const bookTransform = getCoordinatedBookTransform({
    bookIndex,
    scrollProgress,
    targetBookIndex,
    openProgress,
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

  const isAnyActive = targetBookIndex !== null && openProgress > 0;
  const isBackgroundBook = isAnyActive && !isTargetBook;
  const isOpeningOrOpen = isTargetBook && openProgress > 0.05;
  const isFullyOpen = isTargetBook && openProgress >= 0.92;

  // --- INTERACTIVE SPREAD TURNING (WHEN OPEN) ---
  const handleLeafPointerDown = (e) => {
    if (!isFullyOpen) return;
    if (e.target.closest(".persistent-back-cover-close-zone") || e.target.closest(".persistent-back-cover")) {
      return;
    }
    leafDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      direction: e.clientX < window.innerWidth / 2 ? -1 : 1, // -1 = left page, 1 = right page
      moved: false,
    };
  };

  const handleLeafPointerMove = (e) => {
    const gesture = leafDragRef.current;
    if (!gesture || !isFullyOpen) return;

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
    if (!gesture || !isFullyOpen) {
      leafDragRef.current = null;
      return;
    }
    leafDragRef.current = null;

    if (!gesture.moved) {
      if (gesture.direction === 1) {
        advanceSpread(1);
      } else {
        advanceSpread(-1);
      }
    } else {
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
      // Swiped backward past Spread 1 -> close book and return to fan!
      if (onCloseRequest) onCloseRequest();
      return;
    }

    if (next <= totalSpreads) {
      setCurrentSpread(next);
    }
  };

  // Spread page numbering
  const spreadIndex = currentSpread - 1;
  const leftPageNum = spreadIndex * 2 + 1;
  const rightPageNum = spreadIndex * 2 + 2;

  const leftPageData = book.pages?.[leftPageNum - 1] || null;
  const rightPageData = book.pages?.[rightPageNum - 1] || null;

  // Progressive depth-of-field softening for background books
  let dofFilter = currentFilter || "none";
  if (isBackgroundBook) {
    dofFilter = currentFilter;
  }

  // Cover lifting shadow on top of right page stack
  // Smoothly fades as front cover angle rises past vertical (90°)
  const coverAngleRad = ((coverAngle || 0) * Math.PI) / 180;
  const liftingShadowOpacity =
    isTargetBook && openProgress < 0.65
      ? Math.max(0, Math.cos(coverAngleRad)) * (1 - openProgress)
      : 0;

  // Specular sheen on outer cover art adapting to rotational tilt
  const sheenIntensity =
    0.14 + 0.38 * Math.sin((Math.abs(coverAngle || 0) * Math.PI) / 180);

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
        transition: "none", // Driven smoothly at 60fps via requestAnimationFrame
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
        {/* Soft Contact Shadow on Surface — Expands naturally as the left wing opens */}
        <div
          className="persistent-contact-shadow"
          style={{
            left: `${-W * (isTargetBook ? openProgress : 0) * 0.95 + 6}px`,
            width: `${W + W * (isTargetBook ? openProgress : 0) * 0.95 - 12}px`,
            opacity: 0.38 + 0.12 * (1 - (isTargetBook ? openProgress : 0)),
          }}
          aria-hidden="true"
        />

        {/* 1. BACK HARDCOVER BOARD (Faces -Z) with interactive closing trigger when open */}
        <div
          className={`persistent-book-face persistent-back-cover ${
            isTargetBook && openProgress > 0.08 ? "is-back-cover-interactive" : ""
          }`}
          style={{
            width: `${W + (isTargetBook && openProgress > 0.08 ? 16 : 2)}px`,
            height: `${H + (isTargetBook && openProgress > 0.08 ? 12 : 2)}px`,
            left: `${isTargetBook && openProgress > 0.08 ? -2 : -1}px`,
            top: `${isTargetBook && openProgress > 0.08 ? -6 : -1}px`,
            backgroundColor: coverColor,
            borderColor: edgeColor,
            cursor: isFullyOpen ? "pointer" : "default",
          }}
          onClick={(e) => {
            if (isFullyOpen && onCloseRequest) {
              e.stopPropagation();
              onCloseRequest();
            }
          }}
          role={isFullyOpen ? "button" : undefined}
          tabIndex={isFullyOpen ? 0 : -1}
          aria-label={isFullyOpen ? "Close sketchbook (Back cover)" : undefined}
        >
          <div className="persistent-back-monogram">TTP</div>

          {/* Interactive Back Cover Touch Zone (Generous touch target for closing on mobile & desktop) */}
          {isFullyOpen && (
            <div
              className="persistent-back-cover-close-zone"
              onClick={(e) => {
                e.stopPropagation();
                if (onCloseRequest) onCloseRequest();
              }}
              title="Close sketchbook (Back cover)"
              role="button"
              tabIndex={0}
              aria-label="Close sketchbook (Back cover)"
            >
              <span className="back-cover-tab-indicator">
                <span aria-hidden="true">✕</span>
                <span>BACK COVER</span>
              </span>
            </div>
          )}
        </div>

        {/* 2. SPINAL CASING (Faces -X, on Left Edge) */}
        <div
          className="persistent-book-face persistent-spine-casing"
          style={{
            width: `${D}px`,
            height: `${H + 2}px`,
            left: `-${D / 2}px`,
            top: "-1px",
            backgroundColor: coverColor,
          }}
          aria-hidden="true"
        >
          <div className="persistent-spine-sheen" />
          <div className="persistent-spine-title">
            <span>{book.title}</span>
          </div>
        </div>

        {/* 3. FORE-EDGE PAPER BLOCK (Faces +X, on Right Edge of Page Stack) */}
        <div
          className="persistent-book-face persistent-fore-edge"
          style={{
            width: `${D - 2}px`,
            height: `${H - 4}px`,
            left: `${W - 1 - (D - 2) / 2}px`,
            top: "2px",
            backgroundColor: paperColor,
          }}
          aria-hidden="true"
        >
          <div className="persistent-paper-lines" />
        </div>

        {/* 4. INTERIOR SPREAD — Right Wing (Pages Stack) */}
        <div
          className="persistent-right-page-wing"
          style={{
            width: `${W}px`,
            height: `${H}px`,
            backgroundColor: paperColor,
            transform: "translateZ(9.5px)",
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

          {/* Dynamic Lifting Cover Cast Shadow across right page */}
          {liftingShadowOpacity > 0.01 && (
            <div
              className="persistent-cover-lift-shadow"
              style={{
                opacity: liftingShadowOpacity,
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* 5. Spine Center Gutter Ridge & Bookmark Ribbon (Visible when opening/open) */}
        {isTargetBook && openProgress > 0.12 && (
          <div
            className="persistent-spine-ridge"
            style={{
              opacity: Math.min(1, (openProgress - 0.12) / 0.35),
            }}
            aria-hidden="true"
          >
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
            transformOrigin: "0% 50% 11px",
            transition: "none",
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
            <div
              className="persistent-cover-sheen"
              style={{
                opacity: sheenIntensity,
              }}
              aria-hidden="true"
            />
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
