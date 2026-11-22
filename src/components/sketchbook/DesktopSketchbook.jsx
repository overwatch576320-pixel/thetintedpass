import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SketchPage } from "./SketchPage";
import { PAGE_ASPECT } from "./geometry";
import { restingBookPose } from "./book-pose";
import { projectShadow } from "./lighting";

function dimensions() {
  if (typeof window === "undefined") {
    return { width: 185, height: Math.round(185 * PAGE_ASPECT) };
  }
  if (window.innerWidth < 1024) {
    // Mobile & tablet: double-page spread occupying approximately 94–96% of available content width
    // with approximately 2–3% breathing room on each side
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Target spread width = 94.8% of screen width (e.g. 356px on 375px, 370px on 390px, 408px on 430px)
    const targetSpreadW = Math.round(screenW * 0.948);
    let width = Math.floor(targetSpreadW / 2);

    // Ensure height allows full visibility within mobile screen without vertical scrolling
    // Budget: screenH - header (56px) - hero text (~125px) - nav buttons (~78px) - geo strip (28px) - padding (~20px)
    const maxBookH = Math.max(180, Math.floor((screenH - 310) * 0.92));
    if (width * PAGE_ASPECT > maxBookH) {
      width = Math.floor(maxBookH / PAGE_ASPECT);
    }
    const height = Math.round(width * PAGE_ASPECT);
    return { width, height };
  }
  // Desktop: sized for desktop editorial layout (COMPLETELY UNCHANGED)
  const maxW = Math.min(330, Math.floor((window.innerWidth - 480) / 2));
  const maxH = Math.min(420, Math.max(260, window.innerHeight - 320));
  const width = Math.max(200, Math.min(maxW, Math.floor(maxH / PAGE_ASPECT)));
  return { width, height: Math.round(width * PAGE_ASPECT) };
}

const ease = (p) => p * p * (3 - 2 * p);

export default function DesktopSketchbook({
  bookSettings = {},
  pages = [],
  initialPage = 0,
  onPageChange = null,
}) {
  const [size, setSize] = useState(dimensions);
  const [page, setPage] = useState(initialPage);
  const [presented, setPresented] = useState(false);
  const [webgl, setWebgl] = useState(false);

  const frame = useRef(null);
  const host = useRef(null);
  const sources = useRef(null);
  const nav = useRef(null);
  const dom = useRef(null);
  const ground = useRef(null);
  const engine = useRef(null);
  const current = useRef(initialPage);
  const desired = useRef(initialPage);
  const turn = useRef(null);
  const drag = useRef(null);
  const animation = useRef(0);
  const ready = useRef(false);
  const generation = useRef(0);
  const drive = useRef(() => {});

  // Ensure minimum 4 pages and even count
  const formattedPages = [...pages];
  while (formattedPages.length < 4) {
    const idx = formattedPages.length + 1;
    formattedPages.push({
      id: `page-${idx}`,
      pageNumber: idx,
      title: `Blank Folio ${idx}`,
      isBlank: true,
      image: null,
    });
  }
  if (formattedPages.length % 2 !== 0) {
    const idx = formattedPages.length + 1;
    formattedPages.push({
      id: `page-${idx}`,
      pageNumber: idx,
      title: `Blank Folio ${idx}`,
      isBlank: true,
      image: null,
    });
  }

  const totalContentPages = formattedPages.length;
  // Spreads: 0 (front cover), 1..(last-1) (interior spreads), last (back cover)
  // For 4 content pages: numInteriorSpreads = 2, last = 3 (back cover).
  // Total slots: exactly last * 2 = 6 slots (0: front cover, 1..4: interior pages, 5: back cover)
  const numInteriorSpreads = Math.ceil(totalContentPages / 2);
  const last = numInteriorSpreads + 1;
  const totalSlots = last * 2;

  const reduced = useReducedMotion();

  const pageIndex = useCallback(
    (spread) =>
      spread === 0
        ? 0
        : spread === last
        ? totalSlots - 1
        : spread * 2 - 1,
    [last, totalSlots]
  );

  const apply = useCallback(
    (pose) => {
      if (nav.current) nav.current.style.width = `${pose.width * size.width}px`;
      if (dom.current)
        dom.current.style.transform = `translateX(${pose.center * size.width}px)`;
      if (ground.current) {
        ground.current.style.transform = `translateX(${pose.center * size.width}px)`;
        const offset = projectShadow({ x: 0, y: 0, z: size.width * 0.025 });
        Array.from(ground.current.children).forEach((el, index) =>
          Object.assign(el.style, {
            opacity: String(index === 0 ? pose.leftContact : pose.rightContact),
            boxShadow: `${offset.x}px ${offset.y}px ${size.width * 0.018}px rgba(20,20,20,.08)`,
          })
        );
      }
    },
    [size.width]
  );

  const rest = useCallback(
    (spread) => {
      const pose =
        engine.current?.showRest(spread) ??
        restingBookPose(pageIndex(spread), totalSlots);
      apply(pose);
      nav.current?.classList.remove("is-cover-moving");
    },
    [apply, pageIndex, totalSlots]
  );

  function paint(active) {
    if (engine.current) {
      apply(engine.current.showTurn(active.lower, active.progress, active.grab));
    }
  }

  function animateTurn(active, end) {
    cancelAnimationFrame(animation.current);
    turn.current = active;
    const start = performance.now();
    const from = active.progress;
    const duration = Math.max(120, 950 * Math.abs(end - from));

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      active.progress = from + (end - from) * ease(t);
      paint(active);

      if (t < 1) {
        animation.current = requestAnimationFrame(step);
        return;
      }
      animation.current = 0;
      const destination = end === 1 ? active.lower + 1 : active.lower;
      current.current = destination;
      turn.current = null;
      rest(destination);
      setPage(destination);
      if (onPageChange) onPageChange(destination);
      drive.current();
    };
    animation.current = requestAnimationFrame(step);
  }

  function prepare(direction) {
    const from = current.current;
    const to = from + direction;
    if (to < 0 || to > last) return null;

    const active = {
      from,
      to,
      lower: Math.min(from, to),
      progress: direction === 1 ? 0 : 1,
      grab: 0,
    };
    turn.current = active;
    if (active.lower === 0 || active.lower === last - 1) {
      nav.current?.classList.add("is-cover-moving");
    }
    paint(active);
    return active;
  }

  drive.current = () => {
    if (!ready.current || turn.current || drag.current || desired.current === current.current) {
      return;
    }
    if (reduced || !engine.current) {
      current.current = desired.current;
      rest(current.current);
      setPage(current.current);
      if (onPageChange) onPageChange(current.current);
      return;
    }
    const direction = desired.current > current.current ? 1 : -1;
    const active = prepare(direction);
    if (active) animateTurn(active, direction === 1 ? 1 : 0);
  };

  const request = useCallback(
    (direction) => {
      if (!ready.current) return;
      desired.current = Math.max(0, Math.min(last, desired.current + direction));
      drive.current();
    },
    [last]
  );

  useEffect(() => {
    const resize = () => setSize(dimensions());
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target.closest("input,textarea,[contenteditable=true]")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        request(event.key === "ArrowRight" ? 1 : -1);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [request]);

  useLayoutEffect(() => {
    let disposed = false;
    const ticket = ++generation.current;
    ready.current = false;
    setPresented(false);
    setWebgl(false);
    cancelAnimationFrame(animation.current);
    turn.current = null;
    drag.current = null;
    desired.current = current.current;
    engine.current?.dispose();
    engine.current = null;
    rest(current.current);

    (async () => {
      const elements = Array.from(sources.current?.children ?? []);
      const modulePromise = !reduced
        ? import("./desktop-paper-renderer").catch(() => null)
        : Promise.resolve(null);

      // Pre-decode any images inside the page elements
      await Promise.all(
        elements.flatMap((el) =>
          Array.from(el.querySelectorAll("img"), (img) =>
            img.decode().catch(() => {})
          )
        )
      );

      if (disposed || ticket !== generation.current) return;

      try {
        const loaded = await modulePromise;
        if (disposed || ticket !== generation.current) return;
        if (loaded && host.current && elements.length > 0) {
          engine.current = loaded.createDesktopPaperRenderer(
            host.current,
            size.width,
            size.height,
            elements
          );
        }
      } catch (e) {
        console.warn("Desktop paper renderer init fallback:", e);
        engine.current?.dispose();
        engine.current = null;
      }

      if (disposed || ticket !== generation.current) {
        engine.current?.dispose();
        return;
      }
      rest(current.current);
      setWebgl(!!engine.current);
      ready.current = true;
      setPresented(true);
    })();

    const contextLost = (event) => {
      event.preventDefault();
      cancelAnimationFrame(animation.current);
      turn.current = null;
      drag.current = null;
      desired.current = current.current;
      engine.current?.dispose();
      engine.current = null;
      setWebgl(false);
      rest(current.current);
    };

    const canvasHost = host.current;
    canvasHost?.addEventListener("webglcontextlost", contextLost, true);

    return () => {
      disposed = true;
      ready.current = false;
      cancelAnimationFrame(animation.current);
      canvasHost?.removeEventListener("webglcontextlost", contextLost, true);
      engine.current?.dispose();
      engine.current = null;
    };
  }, [size.width, size.height, reduced, rest, totalSlots, pages]);

  function release(event, cancelled = false) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    if (frame.current?.hasPointerCapture(event.pointerId)) {
      frame.current.releasePointerCapture(event.pointerId);
    }
    const active = turn.current;
    if (!gesture.moved) {
      if (cancelled) return;
      if (active) {
        turn.current = null;
        rest(current.current);
      }
      request(gesture.direction);
      return;
    }
    if (!active) return;
    // Physical drag completion: if dragged past 28% of the spread, complete the turn.
    // If user dragged less or reversed direction midway back towards start, cleanly snap back to current page!
    const distance = gesture.direction === 1 ? active.progress : 1 - active.progress;
    const complete = !cancelled && distance > 0.28;
    desired.current = complete ? active.to : active.from;
    animateTurn(
      active,
      complete ? (gesture.direction === 1 ? 1 : 0) : (gesture.direction === 1 ? 0 : 1)
    );
  }

  const closed = page === 0 || page === last;
  const pose = restingBookPose(pageIndex(page), totalSlots);
  const left = page === 0 ? null : page === last ? totalSlots - 1 : page * 2 - 1;
  const right = page === last ? null : page === 0 ? 0 : page * 2;

  // Render a specific face index:
  // Slot 0: Front Cover
  // Slot 1: Page 1 (Spread 1 Left)
  // Slot 2: Page 2 (Spread 1 Right)
  // Slot 3: Page 3 (Spread 2 Left)
  // Slot 4: Page 4 (Spread 2 Right)
  // Slot totalSlots - 1: Back Cover
  const renderFace = (index) => {
    if (index === null) return null;
    if (index === 0) {
      return (
        <SketchPage
          cover
          coverSide="front"
          bookSettings={bookSettings}
        />
      );
    }
    if (index === totalSlots - 1) {
      return (
        <SketchPage
          cover
          coverSide="back"
          bookSettings={bookSettings}
        />
      );
    }
    if (index === 1) {
      return (
        <SketchPage
          page={1}
          side="left"
          pageData={formattedPages[0]}
          bookSettings={bookSettings}
        />
      );
    }
    if (index === 2) {
      return (
        <SketchPage
          page={2}
          side="right"
          pageData={formattedPages[1]}
          bookSettings={bookSettings}
        />
      );
    }
    if (index === 3) {
      return (
        <SketchPage
          page={3}
          side="left"
          pageData={formattedPages[2]}
          bookSettings={bookSettings}
        />
      );
    }
    if (index === 4) {
      return (
        <SketchPage
          page={4}
          side="right"
          pageData={formattedPages[3]}
          bookSettings={bookSettings}
        />
      );
    }
    if (index === totalSlots - 2) {
      return (
        <SketchPage
          cover
          coverSide="back"
          bookSettings={bookSettings}
        />
      );
    }

    const contentPageIdx = index - 1;
    const pageData = formattedPages[contentPageIdx] || null;
    return (
      <SketchPage
        page={contentPageIdx + 1}
        side={index % 2 === 0 ? "right" : "left"}
        pageData={pageData}
        bookSettings={bookSettings}
      />
    );
  };

  const announcement =
    page === 0
      ? "Front cover"
      : page === last
      ? "Back cover"
      : page === 1
      ? "Pages 1 & 2"
      : `Pages ${page * 2 - 1} & ${Math.min(page * 2, totalContentPages)}`;

  return (
    <div className={`sketch-desktop ${closed ? "is-closed" : ""}`}>
      <div
        ref={frame}
        className={`sketch-desktop-frame ${
          presented ? "is-presented" : "is-preparing"
        } ${webgl ? "has-desktop-paper" : ""}`}
        style={{ width: size.width * 2, height: size.height }}
        aria-busy={!presented}
        role="group"
        aria-label="3D Artist Sketchbook. Click or drag to turn pages."
        tabIndex={presented ? 0 : -1}
        onPointerDown={(event) => {
          if (
            !event.isPrimary ||
            event.button !== 0 ||
            !ready.current ||
            turn.current
          )
            return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const middle = size.width;

          // Seamless direction detection with ZERO dead zones across all pages:
          // - Front cover closed (page 0): taps/drags anywhere open the book forward
          // - Back cover closed (page last): taps/drags anywhere turn the page backward
          // - Open spread: right page turns forward, left page turns backward
          const direction =
            current.current === 0
              ? 1
              : current.current === last
              ? -1
              : x > middle
              ? 1
              : -1;
          drag.current = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            direction,
            moved: false,
            isCancelled: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const gesture = drag.current;
          if (!gesture || gesture.id !== event.pointerId || !engine.current || reduced || gesture.isCancelled)
            return;
          const dx = event.clientX - gesture.startX;
          const dy = event.clientY - gesture.startY;
          if (!gesture.moved) {
            // Detect vertical scroll on mobile to allow native page scroll
            if (Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dy) > 7) {
              gesture.isCancelled = true;
              if (frame.current?.hasPointerCapture(event.pointerId)) {
                frame.current.releasePointerCapture(event.pointerId);
              }
              return;
            }
            if (Math.abs(dx) < 6) return;
          }
          gesture.moved = true;
          const active = turn.current ?? prepare(gesture.direction);
          if (!active) return;
          const distance = Math.max(
            0,
            Math.min(1, (-dx * gesture.direction) / (size.width * 2))
          );
          active.progress = gesture.direction === 1 ? distance : 1 - distance;
          const rect = event.currentTarget.getBoundingClientRect();
          active.grab = 1 - (2 * (event.clientY - rect.top)) / size.height;
          paint(active);
        }}
        onPointerUp={(event) => release(event)}
        onPointerCancel={(event) => release(event, true)}
        onLostPointerCapture={(event) => {
          if (drag.current) release(event, true);
        }}
      >
        <div ref={ground} className="sketch-spread-ground" aria-hidden="true">
          <span />
          <span />
        </div>

        {/* DOM Fallback for accessibility & pre-WebGL render */}
        <div
          ref={dom}
          className="sketch-desktop-dom"
          style={{ transform: `translateX(${pose.center * size.width}px)` }}
        >
          <div className="sketch-dom-page">{renderFace(left)}</div>
          <div className="sketch-dom-page">{renderFace(right)}</div>
        </div>

        {/* Source elements baked to WebGL textures */}
        <div ref={sources} className="sketch-page-sources" aria-hidden="true">
          {Array.from({ length: totalSlots }, (_, index) => (
            <div
              key={index}
              className="sketch-page-source"
              style={{ width: size.width, height: size.height }}
            >
              {renderFace(index)}
            </div>
          ))}
        </div>

        {/* WebGL Canvas Host */}
        <div ref={host} className="sketch-desktop-canvas" aria-hidden="true" />

        {/* Hidden screen-reader announcement */}
        <nav ref={nav} className="sketch-side-navigation sr-only" aria-label="Sketchbook Navigation">
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
        </nav>
      </div>
    </div>
  );
}
