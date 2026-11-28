import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import { createDesktopPaperRenderer } from "./desktop-paper-renderer";
import { BookCover } from "./BookCover";
import { SketchPage } from "./SketchPage";
import "./physical-book-spread.css";

/**
 * PhysicalBookSpread Component
 * Unified 3D physical sketchbook for both Desktop and Mobile.
 *
 * Implements:
 * 1. Two-page spread centered around spine hinge
 * 2. Continuous gesture-driven opening, page curling, and closing
 * 3. Smooth cubic settling easing on release based on gesture direction & velocity
 * 4. Closing from front cover (spread 1) and back cover (final spread)
 * 5. Continuous background carousel blur callbacks
 */
export function PhysicalBookSpread({
  book = {},
  dimensions = { pageWidth: 280, pageHeight: 396, closedWidth: 280, closedHeight: 396 },
  onClose = () => {},
  onProgressChange = () => {},
  onPageChange = () => {},
}) {
  const containerRef = useRef(null);
  const hostRef = useRef(null);
  const sourcesRef = useRef(null);
  const engineRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0); // 0 = closed front, 1..last-1 = open spreads, last = closed back

  // Gesture tracking state
  const gestureRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    active: false,
    mode: null, // "opening" | "turning_forward" | "turning_backward" | "closing_back"
    currentProgress: 0,
  });

  const animFrameRef = useRef(null);
  const spreadRef = useRef(0);

  // Content Pages assembly: Minimum 6 content pages for rich spreads
  const contentPages = useMemo(() => {
    const list = book.pages && book.pages.length > 0 ? [...book.pages] : [
      { id: "p1", pageNumber: 1, title: "Alchi Monastery Study", image: "/editorial/sketch-placeholder-1.png", isBlank: false },
      { id: "p2", pageNumber: 2, title: "Lapis Lazuli Mineral Wash", image: "/editorial/sketch-placeholder-2.png", isBlank: false },
      { id: "p3", pageNumber: 3, title: "Courtyard Samovar", image: "/editorial/sketch-tea-stall.png", isBlank: false },
      { id: "p4", pageNumber: 4, title: "Monastic Window Herbs", image: "/editorial/sketch-window-plants.png", isBlank: false },
      { id: "p5", pageNumber: 5, title: "Village Dog Sunning", image: "/editorial/sketch-sleeping-dog.png", isBlank: false },
      { id: "p6", pageNumber: 6, title: "Archival Rag Folio", image: null, isBlank: true },
    ];

    while (list.length < 6) {
      const idx = list.length + 1;
      list.push({ id: `p${idx}`, pageNumber: idx, title: `Blank Folio ${idx}`, isBlank: true });
    }
    if (list.length % 2 !== 0) {
      const idx = list.length + 1;
      list.push({ id: `p${idx}`, pageNumber: idx, title: `Blank Folio ${idx}`, isBlank: true });
    }
    return list;
  }, [book]);

  // Total slots: 0 = front cover, 1 = inside front, 2..N+1 = content pages, N+2 = inside back, N+3 = back cover
  // Must be even count
  const lastSpread = Math.ceil(contentPages.length / 2) + 2;
  const lastTurn = lastSpread - 1;

  // Initialize Desktop/Unified Paper Renderer
  useEffect(() => {
    const host = hostRef.current;
    const sources = sourcesRef.current;
    if (!host || !sources) return;

    let disposed = false;

    const init = async () => {
      try {
        const elements = Array.from(sources.children);
        await Promise.all([
          document.fonts.ready,
          ...elements.flatMap((el) =>
            Array.from(el.querySelectorAll("img"), (img) => img.decode().catch(() => {}))
          ),
        ]);

        if (disposed || !hostRef.current) return;

        engineRef.current = createDesktopPaperRenderer(
          host,
          dimensions.pageWidth,
          dimensions.pageHeight,
          elements
        );

        setReady(true);
      } catch (err) {
        console.warn("Paper renderer initialization fallback:", err);
      }
    };

    void init();

    return () => {
      disposed = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      engineRef.current?.dispose();
      engineRef.current = null;
      setReady(false);
    };
  }, [dimensions.pageWidth, dimensions.pageHeight]);

  // Smooth settling animation loop using single requestAnimationFrame
  const settleProgress = useCallback(
    (startProgress, targetProgress, velocity, onDone) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      const distance = Math.abs(targetProgress - startProgress);
      if (distance < 0.001) {
        onDone?.();
        return;
      }

      const duration = Math.max(180, Math.min(420, (distance * 320) / Math.max(0.4, Math.abs(velocity))));
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // Smooth cubic ease-out
        const ease = 1 - Math.pow(1 - t, 3);
        const current = startProgress + (targetProgress - startProgress) * ease;

        const g = gestureRef.current;
        if (g.mode === "opening" || spreadRef.current === 0) {
          engineRef.current?.showTurn(0, current, 0);
          onProgressChange(current);
        } else if (g.mode === "turning_forward") {
          engineRef.current?.showTurn(spreadRef.current, current, 0);
        } else if (g.mode === "turning_backward") {
          engineRef.current?.showTurn(spreadRef.current - 1, 1 - current, 0);
        } else if (g.mode === "closing_front") {
          engineRef.current?.showTurn(0, current, 0);
          onProgressChange(current);
        } else if (g.mode === "closing_back") {
          engineRef.current?.showTurn(lastTurn, current, 0);
          onProgressChange(1 - current);
        }

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          animFrameRef.current = null;
          onDone?.();
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    },
    [onProgressChange, lastTurn]
  );

  // Automatically begin opening from closed front cover on mount
  useEffect(() => {
    if (!ready || !engineRef.current) return;

    spreadRef.current = 0;
    setCurrentSpread(0);
    gestureRef.current.mode = "opening";

    // Smoothly open front cover around spine hinge
    settleProgress(0, 1, 0.8, () => {
      spreadRef.current = 1;
      setCurrentSpread(1);
      gestureRef.current.mode = null;
      engineRef.current?.showRest(1);
      onProgressChange(1);
      onPageChange(1);
    });
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Gesture Handlers
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const now = performance.now();
    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: now,
      velocityX: 0,
      active: true,
      mode: null,
      currentProgress: 0,
    };

    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const g = gestureRef.current;
    if (!g.active || e.pointerId !== g.pointerId || !engineRef.current) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    const now = performance.now();
    const dt = now - g.lastTime;
    if (dt > 0) g.velocityX = (e.clientX - g.lastX) / dt;
    g.lastX = e.clientX;
    g.lastTime = now;

    // Movement threshold to engage page curl
    if (!g.mode && Math.abs(dx) > 8) {
      const spread = spreadRef.current;
      if (spread === 0) {
        if (dx < 0) g.mode = "opening";
      } else if (spread === 1 && dx > 0) {
        g.mode = "closing_front";
      } else if (spread === lastTurn && dx < 0) {
        g.mode = "closing_back";
      } else if (dx < 0 && spread < lastTurn) {
        g.mode = "turning_forward";
      } else if (dx > 0 && spread > 1) {
        g.mode = "turning_backward";
      }
    }

    if (!g.mode) return;

    e.preventDefault();
    const dragDistance = dimensions.pageWidth * 1.6;
    const rect = containerRef.current?.getBoundingClientRect();
    const grab = rect ? 1 - (2 * (e.clientY - rect.top)) / rect.height : 0;

    if (g.mode === "opening") {
      const p = Math.max(0, Math.min(1, -dx / dragDistance));
      g.currentProgress = p;
      engineRef.current.showTurn(0, p, grab);
      onProgressChange(p);
    } else if (g.mode === "closing_front") {
      const p = Math.max(0, Math.min(1, 1 - dx / dragDistance));
      g.currentProgress = p;
      engineRef.current.showTurn(0, p, grab);
      onProgressChange(p);
    } else if (g.mode === "closing_back") {
      const p = Math.max(0, Math.min(1, -dx / dragDistance));
      g.currentProgress = p;
      engineRef.current.showTurn(lastTurn, p, grab);
      onProgressChange(1 - p);
    } else if (g.mode === "turning_forward") {
      const p = Math.max(0, Math.min(1, -dx / dragDistance));
      g.currentProgress = p;
      engineRef.current.showTurn(spreadRef.current, p, grab);
    } else if (g.mode === "turning_backward") {
      const p = Math.max(0, Math.min(1, dx / dragDistance));
      g.currentProgress = p;
      engineRef.current.showTurn(spreadRef.current - 1, 1 - p, grab);
    }
  };

  const handlePointerUp = (e) => {
    const g = gestureRef.current;
    if (!g.active || e.pointerId !== g.pointerId) return;
    g.active = false;

    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    // Pure tap on open page does not turn page
    if (!g.mode) return;

    const mode = g.mode;
    const progress = g.currentProgress;
    const v = g.velocityX;

    if (mode === "opening") {
      const willOpen = progress > 0.35 || v < -0.3;
      settleProgress(progress, willOpen ? 1 : 0, v, () => {
        if (willOpen) {
          spreadRef.current = 1;
          setCurrentSpread(1);
          engineRef.current?.showRest(1);
          onProgressChange(1);
          onPageChange(1);
        } else {
          spreadRef.current = 0;
          setCurrentSpread(0);
          onProgressChange(0);
          onClose("front");
        }
      });
    } else if (mode === "closing_front") {
      const willClose = progress < 0.65 || v > 0.3;
      settleProgress(progress, willClose ? 0 : 1, v, () => {
        if (willClose) {
          spreadRef.current = 0;
          setCurrentSpread(0);
          onProgressChange(0);
          onClose("front");
        } else {
          spreadRef.current = 1;
          setCurrentSpread(1);
          engineRef.current?.showRest(1);
          onProgressChange(1);
        }
      });
    } else if (mode === "closing_back") {
      const willClose = progress > 0.35 || v < -0.3;
      settleProgress(progress, willClose ? 1 : 0, v, () => {
        if (willClose) {
          spreadRef.current = lastSpread;
          setCurrentSpread(lastSpread);
          onProgressChange(0);
          onClose("back");
        } else {
          engineRef.current?.showRest(spreadRef.current);
          onProgressChange(1);
        }
      });
    } else if (mode === "turning_forward") {
      const willAdvance = progress > 0.35 || v < -0.3;
      settleProgress(progress, willAdvance ? 1 : 0, v, () => {
        if (willAdvance) {
          const next = spreadRef.current + 1;
          spreadRef.current = next;
          setCurrentSpread(next);
          engineRef.current?.showRest(next);
          onPageChange(next);
        } else {
          engineRef.current?.showRest(spreadRef.current);
        }
      });
    } else if (mode === "turning_backward") {
      const willRevert = progress > 0.35 || v > 0.3;
      settleProgress(progress, willRevert ? 1 : 0, v, () => {
        if (willRevert) {
          const prev = spreadRef.current - 1;
          spreadRef.current = prev;
          setCurrentSpread(prev);
          engineRef.current?.showRest(prev);
          onPageChange(prev);
        } else {
          engineRef.current?.showRest(spreadRef.current);
        }
      });
    }
  };

  const handlePointerCancel = (e) => {
    if (gestureRef.current.active) handlePointerUp(e);
  };

  // Build the complete sources list matching Niyas spread architecture
  const renderSourceSlot = (index) => {
    // 0: Outside Front Cover
    if (index === 0) {
      return (
        <BookCover
          side="front"
          coverTitle={book.title || "LADAKH EXPEDITION JOURNAL"}
          coverSubtitle={book.subtitle || "Plein Air Field Studies"}
          coverImage={book.coverImage || null}
          coverColor={book.coverColor || "#1b3358"}
        />
      );
    }
    // 1: Inside Front Cover
    if (index === 1) {
      return (
        <BookCover
          side="inside-front"
          coverTitle={book.title || "LADAKH EXPEDITION JOURNAL"}
          coverColor={book.coverColor || "#1b3358"}
        />
      );
    }
    // N+2: Inside Back Cover
    if (index === contentPages.length + 2) {
      return (
        <BookCover
          side="inside-back"
          coverTitle={book.title || "LADAKH EXPEDITION JOURNAL"}
          coverColor={book.coverColor || "#1b3358"}
        />
      );
    }
    // N+3: Outside Back Cover
    if (index === contentPages.length + 3) {
      return (
        <BookCover
          side="back"
          coverTitle={book.title || "LADAKH EXPEDITION JOURNAL"}
          coverColor={book.coverColor || "#1b3358"}
        />
      );
    }
    // Content Page
    const pageData = contentPages[index - 2];
    const isLeft = (index - 2) % 2 === 0;
    return (
      <SketchPage
        page={index - 1}
        side={isLeft ? "left" : "right"}
        pageData={pageData}
      />
    );
  };

  const totalSourceSlots = contentPages.length + 4;

  return (
    <div
      ref={containerRef}
      className="physical-book-spread-root"
      style={{
        width: `${dimensions.openSpreadWidth}px`,
        height: `${dimensions.pageHeight}px`,
        "--sketchbook-cover": book.coverColor || "#1b3358",
        "--sketchbook-cover-edge": book.edgeColor || "#0f1e33",
        "--sketchbook-paper": book.paperColor || "#fbf8f0",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      role="region"
      aria-label={`${book.title || "Sketchbook"}. Two-page spread. Drag page to turn, drag cover to close.`}
      tabIndex={0}
    >
      {/* Three.js Canvas Container */}
      <div ref={hostRef} className="spread-canvas-host" aria-hidden="true" />

      {/* Hidden Source DOM Elements for WebGL Texture Generation */}
      <div ref={sourcesRef} className="spread-texture-sources" aria-hidden="true">
        {Array.from({ length: totalSourceSlots }, (_, idx) => (
          <div
            key={idx}
            className="spread-texture-page-source"
            style={{ width: `${dimensions.pageWidth}px`, height: `${dimensions.pageHeight}px` }}
          >
            {renderSourceSlot(idx)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhysicalBookSpread;
