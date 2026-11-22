import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PikaChevron } from "./PikaChevron";
import { SketchPage } from "./SketchPage";
import { PAGE_ASPECT } from "./geometry";
import { restingBookPose } from "./book-pose";
import { projectShadow } from "./lighting";

function dimensions() {
  if (typeof window === "undefined") return { width: 320, height: Math.round(320 * PAGE_ASPECT) };
  // Responsive sizing constrained within viewport and design panel
  const maxW = Math.min(360, Math.floor((window.innerWidth - 180) / 2));
  const maxH = Math.min(440, Math.max(280, window.innerHeight - 340));
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

  const totalContentPages = Math.max(2, pages.length);
  // Spreads: 0 (front cover), 1..(last-1) (interior spreads), last (back cover)
  const last = Math.ceil(totalContentPages / 2) + 1;
  const totalSlots = (last + 1) * 2;

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
  }, [size.width, size.height, reduced, rest, pages, totalSlots]);

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
    const distance = gesture.direction === 1 ? active.progress : 1 - active.progress;
    const complete = !cancelled && distance > 0.15;
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
  // index 0: front cover
  // index 1: inside front cover (Atelier colophon / bookplate)
  // index 2 to totalSlots - 3: content pages
  // index totalSlots - 2: inside back cover
  // index totalSlots - 1: back cover
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
      // Inside front cover
      return (
        <div className="sketch-page is-left sketch-inside-cover">
          <article className="mobile-book-paper sketch-paper inside-cover-plate">
            <div className="inside-cover-monogram">TP</div>
            <h4 className="inside-cover-heading">{bookSettings.bookTitle || "THE TINTED PASS"}</h4>
            <p className="inside-cover-subtitle">
              {bookSettings.bookSubtitle || "Trans-Himalayan Field Sketchbook & Atelier Portfolio"}
            </p>
            <div className="inside-cover-rule" />
            <p className="inside-cover-text">
              Hand-bound linen edition. Grated Badakhshan lapis, Alchi apricot tree gum, and natural mountain cinnabar ground on slate.
            </p>
            <div className="inside-cover-edition">COHORT ATELIER · 2026</div>
          </article>
        </div>
      );
    }
    if (index === totalSlots - 2) {
      // Inside back cover
      return (
        <div className="sketch-page is-right sketch-inside-cover">
          <article className="mobile-book-paper sketch-paper inside-cover-plate">
            <h4 className="inside-cover-heading">ATELIER COLOPHON</h4>
            <p className="inside-cover-text">
              Bound in the Old Town Precinct of Leh, Ladakh (3,524 m).
              Cold-pressed cotton rag, 300 gsm.
            </p>
            <div className="inside-cover-rule" />
            <p className="inside-cover-footer">THE TINTED PASS · TRANS-HIMALAYAS</p>
          </article>
        </div>
      );
    }

    const contentPageIdx = index - 2;
    const pageData = pages[contentPageIdx] || null;
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
      ? "Inside front cover · Page 1"
      : page === last - 1
      ? `Page ${totalContentPages} · Inside back cover`
      : `Pages ${page * 2 - 2}–${Math.min(page * 2 - 1, totalContentPages)}`;

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
        aria-label="3D Sketchbook. Use side arrows, drag page corners, or press keyboard arrow keys."
        tabIndex={presented ? 0 : -1}
        onPointerDown={(event) => {
          if (
            !event.isPrimary ||
            event.button !== 0 ||
            event.target.closest("button") ||
            !ready.current ||
            turn.current
          )
            return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const bounds = restingBookPose(pageIndex(current.current), totalSlots);
          const middle = size.width;
          if (Math.abs(x - middle) > (bounds.width * size.width) / 2) return;
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
            x: event.clientX,
            y: event.clientY,
            direction,
            moved: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const gesture = drag.current;
          if (!gesture || gesture.id !== event.pointerId || !engine.current || reduced)
            return;
          const dx = event.clientX - gesture.x;
          if (!gesture.moved && Math.abs(dx) < 6) return;
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

        {/* Accessible Side Chevrons */}
        <nav
          ref={nav}
          className="sketch-side-navigation"
          style={{ width: pose.width * size.width }}
          aria-label="Sketchbook Navigation"
        >
          <button
            type="button"
            aria-label={
              page === 1
                ? "Close the sketchbook"
                : page === last
                ? "Open the sketchbook"
                : "Previous pages"
            }
            disabled={!presented || page === 0}
            onClick={() => request(-1)}
          >
            <PikaChevron direction="left" />
          </button>
          <span className="sr-only" aria-live="polite">
            {announcement}
          </span>
          <button
            type="button"
            aria-label={
              page === 0
                ? "Open the sketchbook"
                : page === last - 1
                ? "Close the sketchbook"
                : "Next pages"
            }
            disabled={!presented || page === last}
            onClick={() => request(1)}
          >
            <PikaChevron direction="right" />
          </button>
        </nav>
      </div>
    </div>
  );
}
