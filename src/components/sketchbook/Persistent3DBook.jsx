import React, { useState, useRef, useEffect, useCallback } from "react";
import { getCoordinatedBookTransform } from "./bookCollisionAvoidance";
import CurvedPaperSheet from "./CurvedPaperSheet";
import "./sketchbook.css";

/**
 * Persistent3DBook
 * An authentic physical 3D hardcover artist sketchbook.
 *
 * It remains the EXACT SAME physical object across:
 * - Closed in collection fan (0.0): upright, mirrored inward yaw, 3D hardcover volume.
 * - Opening / Closing (0.0 < p < 1.0): front cover lifts naturally around the left spine hinge,
 *   smoothly revealing the page stack underneath with physical cast shadows and centering shift.
 * - Open spread (1.0): full double-page spread with realistic flexible 3D paper page-turning.
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
  const [turningState, setTurningState] = useState(null);
  // turningState: { direction: 1|-1, fromSpread: number, progress: number, grabY: number, isDragging: boolean }

  const turnAnimRef = useRef(null);
  const gestureRef = useRef(null);
  const turningStateRef = useRef(null);
  turningStateRef.current = turningState;

  const coverColor = book.coverColor || "#1c2328";
  const edgeColor = book.edgeColor || "#101417";
  const paperColor = book.paperColor || "#fbf8f0";

  const totalPages = book.pages?.length || 8;
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));

  // Reset spread and turning state when book closes
  useEffect(() => {
    if (openProgress === 0) {
      cancelAnimationFrame(turnAnimRef.current);
      setCurrentSpread(1);
      setTurningState(null);
      gestureRef.current = null;
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

  // --- SMOOTH ANIMATION FOR PAGE TURNING (TAP, FLICK, MID-FLIGHT REVERSAL) ---
  const animateTurnTo = useCallback(
    (targetProgress, duration = 520, onComplete) => {
      cancelAnimationFrame(turnAnimRef.current);
      const state = turningStateRef.current;
      if (!state) return;

      const startProgress = state.progress;
      const change = targetProgress - startProgress;
      if (Math.abs(change) < 0.001) {
        if (targetProgress >= 0.999) {
          setCurrentSpread((prev) =>
            Math.max(1, Math.min(totalSpreads, state.fromSpread + state.direction))
          );
        }
        setTurningState(null);
        if (onComplete) onComplete();
        return;
      }

      const actualDuration = Math.max(160, duration * Math.abs(change));
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / actualDuration);
        // Smoothstep polynomial S(t) = t * t * (3 - 2 * t)
        const eased = t * t * (3 - 2 * t);
        const current = startProgress + change * eased;

        setTurningState((prev) => (prev ? { ...prev, progress: current, isDragging: false } : null));

        if (t < 1) {
          turnAnimRef.current = requestAnimationFrame(step);
        } else {
          if (targetProgress >= 0.999) {
            setCurrentSpread((prev) =>
              Math.max(1, Math.min(totalSpreads, state.fromSpread + state.direction))
            );
          }
          setTurningState(null);
          if (onComplete) onComplete();
        }
      };

      turnAnimRef.current = requestAnimationFrame(step);
    },
    [totalSpreads]
  );

  // Trigger programmatic or tap page turn
  const triggerPageTurn = useCallback(
    (dir, grabY = 0) => {
      if (!isFullyOpen || turningStateRef.current) return;

      if (dir === 1 && currentSpread >= totalSpreads) return;
      if (dir === -1 && currentSpread <= 1) {
        // Turning backward past Spread 1 closes the book and returns to collection
        if (onCloseRequest) onCloseRequest();
        return;
      }

      setTurningState({
        direction: dir,
        fromSpread: currentSpread,
        progress: 0,
        grabY,
        isDragging: false,
      });

      // Animate smoothly to completion
      setTimeout(() => {
        animateTurnTo(1.0, 520);
      }, 16);
    },
    [isFullyOpen, currentSpread, totalSpreads, onCloseRequest, animateTurnTo]
  );

  // --- INTERACTIVE DRAG & TAP GESTURE RECOGNITION ---
  const handlePointerDown = (e) => {
    if (!isFullyOpen) return;
    // Do not intercept if interacting with the back cover close zone or header buttons
    if (
      e.target.closest(".persistent-back-cover-close-zone") ||
      e.target.closest(".open-book-header-bar")
    ) {
      return;
    }

    const chassisEl = e.currentTarget;
    const rect = chassisEl.getBoundingClientRect();
    const clickX = e.clientX - (rect.left + rect.width / 2); // Relative to spine center (x=0)
    const grabY = Math.max(-1, Math.min(1, ((e.clientY - (rect.top + rect.height / 2)) / (H / 2))));

    // Determine intended turn direction based on side clicked
    // Right wing (x > 0) -> Turn Forward (1)
    // Left wing (x < 0)  -> Turn Backward (-1)
    const dir = clickX >= 0 ? 1 : -1;

    // Check boundary conditions
    if (dir === 1 && currentSpread >= totalSpreads) return;
    if (dir === -1 && currentSpread <= 1) {
      // Tapping left wing on Spread 1 triggers gentle close request
      if (onCloseRequest) onCloseRequest();
      return;
    }

    try {
      chassisEl.setPointerCapture(e.pointerId);
    } catch (_) {}

    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      grabY,
      direction: dir,
      startTime: performance.now(),
      moved: false,
    };
  };

  const handlePointerMove = (e) => {
    const gesture = gestureRef.current;
    if (!gesture || !isFullyOpen) return;

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    if (!gesture.moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      gesture.moved = true;
      cancelAnimationFrame(turnAnimRef.current);
      setTurningState({
        direction: gesture.direction,
        fromSpread: currentSpread,
        progress: 0,
        grabY: gesture.grabY,
        isDragging: true,
      });
    }

    if (!gesture.moved) return;

    // Calculate drag progress along curling arc
    const dragDistance = W * 0.95;
    let progress = 0;
    if (gesture.direction === 1) {
      // Forward turn: dragging leftward increases progress
      progress = Math.max(0, Math.min(1, -dx / dragDistance));
    } else {
      // Backward turn: dragging rightward increases progress
      progress = Math.max(0, Math.min(1, dx / dragDistance));
    }

    setTurningState((prev) =>
      prev ? { ...prev, progress, isDragging: true } : {
        direction: gesture.direction,
        fromSpread: currentSpread,
        progress,
        grabY: gesture.grabY,
        isDragging: true,
      }
    );
  };

  const handlePointerUp = (e) => {
    const gesture = gestureRef.current;
    if (!gesture || !isFullyOpen) {
      gestureRef.current = null;
      return;
    }

    gestureRef.current = null;
    try {
      if (e?.currentTarget && gesture.pointerId) {
        e.currentTarget.releasePointerCapture(gesture.pointerId);
      }
    } catch (_) {}

    const dx = e.clientX - gesture.startX;
    const dt = Math.max(1, performance.now() - gesture.startTime);
    const velocity = Math.abs(dx) / dt;

    if (!gesture.moved) {
      // TAP / CLICK INTERACTION
      triggerPageTurn(gesture.direction, gesture.grabY);
      return;
    }

    // DRAG / FLICK INTERACTION
    const state = turningStateRef.current;
    if (!state) return;

    const shouldComplete =
      state.progress > 0.35 || (velocity > 0.3 && state.progress > 0.12);

    if (shouldComplete) {
      // Fling or pull completed: smoothly settle into opposite stack
      animateTurnTo(1.0, 380);
    } else {
      // Pull cancelled or released early: smoothly return to starting stack
      animateTurnTo(0.0, 320);
    }
  };

  // --- SPREAD PAGES DATA RESOLUTION ---
  const activeSpread = currentSpread;
  const spreadIndex = activeSpread - 1;
  const leftPageNum = spreadIndex * 2 + 1;
  const rightPageNum = spreadIndex * 2 + 2;

  const restingLeftPage = book.pages?.[leftPageNum - 1] || null;
  const restingRightPage = book.pages?.[rightPageNum - 1] || null;

  // Resolve pages visible under turning sheet
  let turningFrontPage = null;
  let turningBackPage = null;
  let displayedLeftPage = restingLeftPage;
  let displayedRightPage = restingRightPage;

  if (turningState) {
    const { direction, fromSpread } = turningState;
    if (direction === 1) {
      // Forward Turn: right page lifts, curls across, lands on left stack
      const liftingPageNum = fromSpread * 2;
      const landingPageNum = fromSpread * 2 + 1;
      const nextRightPageNum = fromSpread * 2 + 2;

      turningFrontPage = book.pages?.[liftingPageNum - 1] || { pageNumber: liftingPageNum };
      turningBackPage = book.pages?.[landingPageNum - 1] || { pageNumber: landingPageNum };

      // Underneath on the right stack is the next right page
      displayedRightPage = book.pages?.[nextRightPageNum - 1] || null;
      // Underneath on the left stack is the existing left page
      displayedLeftPage = book.pages?.[(fromSpread - 1) * 2] || null;
    } else {
      // Backward Turn: left page lifts, curls across, lands on right stack
      const liftingPageNum = (fromSpread - 1) * 2 + 1;
      const landingPageNum = (fromSpread - 1) * 2;
      const prevLeftPageNum = (fromSpread - 2) * 2 + 1;

      turningBackPage = book.pages?.[liftingPageNum - 1] || { pageNumber: liftingPageNum };
      turningFrontPage = book.pages?.[landingPageNum - 1] || { pageNumber: landingPageNum };

      // Underneath on the left stack is the previous left page
      displayedLeftPage = fromSpread > 1 ? book.pages?.[prevLeftPageNum - 1] || null : null;
      // Underneath on the right stack is the existing right page
      displayedRightPage = book.pages?.[fromSpread * 2 - 1] || null;
    }
  }

  // Realistic physical paper stack thickness
  // Left stack builds as pages turn; Right stack diminishes
  const leftStackThickness = Math.max(0, (currentSpread - 1) * 0.35);
  const rightStackThickness = Math.max(0, (totalSpreads - currentSpread) * 0.35);
  const leftStackZ = isFullyOpen ? 8.5 + leftStackThickness : 9.0;
  const rightStackZ = isFullyOpen ? 8.5 + rightStackThickness : 9.0;
  const foreEdgeWidth = Math.max(3, D - 4 - ((currentSpread - 1) / totalSpreads) * 8);

  // Progressive depth-of-field softening for background books
  const dofFilter = isBackgroundBook ? currentFilter : currentFilter || "none";

  // Cover lifting shadow on top of right page stack
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
          cursor: isFullyOpen ? "grab" : "pointer",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Soft Contact Shadow on Surface */}
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

          {/* Interactive Back Cover Touch Zone */}
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
            width: `${foreEdgeWidth}px`,
            height: `${H - 4}px`,
            left: `${W - 1 - foreEdgeWidth / 2}px`,
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
            transform: `translateZ(${rightStackZ.toFixed(2)}px)`,
            boxShadow:
              rightStackThickness > 0.5
                ? `1px 0 0 rgba(0,0,0,0.12), 2px 0 0 rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.15)`
                : "none",
          }}
        >
          <div className="persistent-folio-surface">
            {displayedRightPage?.image ? (
              <img
                src={displayedRightPage.image}
                alt={displayedRightPage.title || `Page ${rightPageNum}`}
                className="persistent-folio-img"
              />
            ) : (
              <div className="persistent-folio-blank">
                <span className="persistent-folio-num right-num">
                  {String(
                    displayedRightPage?.pageNumber ||
                      (turningState && turningState.direction === 1
                        ? rightPageNum + 2
                        : rightPageNum)
                  ).padStart(2, "0")}
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

        {/* 5. Spine Center Gutter Ridge & Bookmark Ribbon */}
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
              boxShadow:
                leftStackThickness > 0.5
                  ? `-1px 0 0 rgba(0,0,0,0.12), -2px 0 0 rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.15)`
                  : "none",
            }}
          >
            <div className="persistent-folio-surface">
              {displayedLeftPage?.image ? (
                <img
                  src={displayedLeftPage.image}
                  alt={displayedLeftPage.title || `Page ${leftPageNum}`}
                  className="persistent-folio-img"
                />
              ) : (
                <div className="persistent-folio-blank">
                  <span className="persistent-folio-num left-num">
                    {String(
                      displayedLeftPage?.pageNumber ||
                        (turningState && turningState.direction === 1
                          ? leftPageNum
                          : leftPageNum)
                    ).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
            <div className="persistent-gutter-shade left-gutter" />
          </div>
        </div>

        {/* 7. REALISTIC FLEXIBLE 3D PAPER SHEET (Subdivided developable conical paper curl) */}
        {turningState && turningState.progress > 0.001 && turningState.progress < 0.999 && (
          <CurvedPaperSheet
            progress={turningState.progress}
            direction={turningState.direction}
            grabY={turningState.grabY}
            frontPage={turningFrontPage}
            backPage={turningBackPage}
            width={W}
            height={H}
            paperColor={paperColor}
            baseZ={Math.max(leftStackZ, rightStackZ) + 0.5}
          />
        )}
      </div>
    </div>
  );
}
