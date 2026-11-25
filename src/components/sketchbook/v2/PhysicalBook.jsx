import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { SketchPage } from "../SketchPage";
import {
  pageTurnDuration,
  RAPID_TURN_SECONDS,
  HOLD_START_DELAY_MS,
  HOLD_REPEAT_DELAY_MS,
  RAPID_CLICK_WINDOW_MS,
  packetTarget,
} from "../mobile-book-motion";
import "./physical-book.css";

/**
 * PhysicalBook Component (v2 Engine)
 * Standalone 3D interactive hardcover sketchbook matching:
 * https://niyamax.github.io/sketchbook/
 *
 * Provides:
 * - Genuine spine hinge opening and closing
 * - 3D subdivided geometry for authentic paper curl deformation
 * - Corner and edge dragging that follows pointer/finger in real time
 * - Forward, backward, and rapid consecutive turns
 * - Natural closing from back cover and front cover
 * - Smooth mid-animation reversal without snapping
 */
export function PhysicalBook({
  book = {},
  currentPage = 0,
  onPageChange = null,
  onOpen = null,
  onClose = null,
  interactive = true,
  className = "",
  style = {},
}) {
  const reduced = useReducedMotion();
  const bookElement = useRef(null);
  const canvasHost = useRef(null);
  const frontPageRef = useRef(null);
  const underPageRef = useRef(null);
  const coverSourceRef = useRef(null);
  const renderer = useRef(null);

  const [ready, setReady] = useState(false);
  const [presented, setPresented] = useState(false);
  const [ground, setGround] = useState(null);
  const [revision, setRevision] = useState(0);

  // Turn state
  const [turn, setTurn] = useState(null);
  const activeTurn = useRef(null);
  const preparedTurn = useRef(null);
  const acceleratedTurn = useRef(null);
  const gatheringPacket = useRef(null);
  const packetTimer = useRef(null);
  const animation = useRef(null);
  const progress = useMotionValue(0);
  const settling = useRef(false);

  // Gesture state
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const holdTimer = useRef(null);
  const heldDirection = useRef(null);
  const queuedTurns = useRef([]);
  const latestGo = useRef(() => {});

  // Page structure assembly:
  // Slot 0: Front Cover
  // Slot 1..N: Content Folios
  // Slot N+1: Back Cover
  const bookPages = useMemo(() => {
    const content = book.pages && book.pages.length > 0 ? book.pages : [
      { id: "p1", pageNumber: 1, title: "Field Study I", isBlank: false },
      { id: "p2", pageNumber: 2, title: "Field Study II", isBlank: false },
      { id: "p3", pageNumber: 3, title: "Field Study III", isBlank: false },
      { id: "p4", pageNumber: 4, title: "Field Study IV", isBlank: false },
      { id: "p5", pageNumber: 5, title: "Field Study V", isBlank: false },
      { id: "p6", pageNumber: 6, title: "Field Study VI", isBlank: false },
      { id: "p7", pageNumber: 7, title: "Field Study VII", isBlank: false },
      { id: "p8", pageNumber: 8, title: "Blank Folio", isBlank: true },
    ];

    const slots = [];
    // Slot 0: Front Cover
    slots.push(
      <SketchPage
        key="cover-front"
        cover={true}
        coverSide="front"
        bookSettings={{
          bookTitle: book.title || "LADAKH EXPEDITION JOURNAL",
          bookSubtitle: book.subtitle || "Plein Air Field Studies",
          coverColor: book.coverColor || "#1c2328",
          coverImage: book.coverImage || null,
        }}
      />
    );

    // Interior Pages
    content.forEach((pageData, idx) => {
      slots.push(
        <SketchPage
          key={`page-${idx + 1}`}
          page={idx + 1}
          side={idx % 2 === 0 ? "left" : "right"}
          pageData={pageData}
        />
      );
    });

    // Final Slot: Back Cover
    slots.push(
      <SketchPage
        key="cover-back"
        cover={true}
        coverSide="back"
        bookSettings={{
          bookTitle: book.title || "LADAKH EXPEDITION JOURNAL",
          coverColor: book.coverColor || "#1c2328",
        }}
      />
    );

    return slots;
  }, [book]);

  const totalSlots = bookPages.length;
  const current = Math.max(0, Math.min(currentPage, totalSlots - 1));

  function stopGathering() {
    if (packetTimer.current) clearTimeout(packetTimer.current);
    packetTimer.current = null;
    gatheringPacket.current = null;
  }

  function stopHolding() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    heldDirection.current = null;
  }

  // Force repaint when images inside the book finish loading
  useEffect(() => {
    const el = bookElement.current;
    const repaint = () => setRevision((v) => v + 1);
    el?.addEventListener("load", repaint, true);
    return () => el?.removeEventListener("load", repaint, true);
  }, []);

  // Sync motion progress value to WebGL paper renderer
  useEffect(() => {
    return progress.on("change", (value) => {
      if (preparedTurn.current === activeTurn.current) {
        renderer.current?.render(value);
      }
    });
  }, [progress]);

  // WebGL paper renderer lifecycle
  useEffect(() => {
    const element = bookElement.current;
    const host = canvasHost.current;
    if (!element || !host) {
      setReady(false);
      return;
    }

    let disposed = false;
    let generation = 0;
    let lastSize = "";

    const resize = async () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const sizeKey = `${width}:${height}`;
      if (!width || !height || sizeKey === lastSize) return;
      lastSize = sizeKey;

      if (reduced) {
        setReady(false);
        setPresented(true);
        return;
      }

      const ticket = ++generation;
      animation.current?.stop();
      queuedTurns.current = [];
      stopGathering();
      stopHolding();
      activeTurn.current = null;
      settling.current = false;
      setTurn(null);
      setReady(false);
      setPresented(false);
      renderer.current?.dispose();
      renderer.current = null;

      try {
        const [module] = await Promise.all([
          import("../mobile-paper-renderer"),
          document.fonts.ready,
          ...Array.from(element.querySelectorAll("img"), (img) =>
            img.decode().catch(() => {})
          ),
        ]);

        if (disposed || ticket !== generation) return;

        renderer.current = module.createPaperRenderer(host, width, height);
        setGround(renderer.current.groundFootprint);
        setRevision((v) => v + 1);
      } catch (err) {
        if (!disposed && ticket === generation) {
          console.warn("Paper renderer initialization fallback", err);
          setReady(false);
          setPresented(true);
        }
      }
    };

    const contextLost = (e) => {
      e.preventDefault();
      if (disposed) return;
      cancel();
      renderer.current?.dispose();
      renderer.current = null;
      setReady(false);
      setPresented(true);
    };

    host.addEventListener("webglcontextlost", contextLost, true);
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    void resize();

    return () => {
      disposed = true;
      observer.disconnect();
      host.removeEventListener("webglcontextlost", contextLost, true);
      stopHolding();
      stopGathering();
      queuedTurns.current = [];
      animation.current?.stop();
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [reduced]);

  // Set pages onto WebGL renderer
  useLayoutEffect(() => {
    const engine = renderer.current;
    if (!engine || !frontPageRef.current) return;

    engine.setPages(
      frontPageRef.current,
      underPageRef.current || undefined,
      turn ? Math.min(turn.from, turn.to) : current,
      coverSourceRef.current || undefined,
      totalSlots,
      turn ? Math.abs(turn.to - turn.from) : 1
    );

    preparedTurn.current = turn;
    engine.render(turn ? progress.get() : 0);
    setReady(true);
    setPresented(true);
  }, [turn, current, bookPages, revision, progress, totalSlots]);

  function cancel() {
    stopHolding();
    stopGathering();
    queuedTurns.current = [];
    animation.current?.stop();
    activeTurn.current = null;
    settling.current = false;
    gesture.current = null;
    setTurn(null);
    setRevision((v) => v + 1);
  }

  useEffect(() => {
    window.addEventListener("blur", cancel);
    return () => window.removeEventListener("blur", cancel);
  }, []);

  // Initiate turn
  function begin(direction, count = 1) {
    if (activeTurn.current || settling.current) return null;
    const to = packetTarget(current, direction, count, totalSlots - 1);
    if (to === current) return null;

    const next = {
      from: current,
      to,
      direction,
      front: bookPages[direction === 1 ? current : to],
      under: bookPages[direction === 1 ? to : current],
    };

    activeTurn.current = next;
    progress.set(direction === 1 ? 0 : 1);
    setTurn(next);
    return next;
  }

  // Queue consecutive rapid turns
  useEffect(() => {
    if (turn || activeTurn.current || !queuedTurns.current.length) return;
    const frame = requestAnimationFrame(() => {
      if (activeTurn.current || settling.current) return;
      const queue = queuedTurns.current;
      const direction = queue[0];
      if (!direction) return;

      let count = 1;
      while (queue[count] === direction) count++;

      const to = packetTarget(current, direction, count, totalSlots - 1);
      const consumed = Math.abs(to - current);
      queue.splice(0, consumed || count);
      if (consumed) latestGo.current(direction, true, consumed);
    });
    return () => cancelAnimationFrame(frame);
  }, [turn, current, totalSlots]);

  // Settle turn animation
  function settle(next, complete, quick = false) {
    stopGathering();
    settling.current = true;
    animation.current?.stop();
    acceleratedTurn.current = quick ? next : null;

    const target = complete === (next.direction === 1) ? 1 : 0;
    const duration = quick
      ? RAPID_TURN_SECONDS
      : pageTurnDuration(Math.min(next.from, next.to));

    animation.current = animate(progress, target, {
      duration: Math.max(
        quick ? 0.18 : 0.32,
        duration * Math.sqrt(Math.abs(target - progress.get()))
      ),
      ease: quick ? [0.2, 0, 0.3, 1] : [0.42, 0, 0.35, 1],
      onComplete: () => {
        if (complete) {
          const destination = next.to;
          if (onPageChange) onPageChange(destination);

          // Opening callback: when leaving closed cover (page 0)
          if (next.from === 0 && destination > 0 && onOpen) {
            onOpen();
          }

          // Closing callback: when returning to closed cover (page 0) or arriving at back cover
          if (destination === 0 && onClose) {
            onClose("front");
          } else if (destination === totalSlots - 1 && onClose) {
            onClose("back");
          }
        }

        activeTurn.current = null;
        settling.current = false;
        setTurn(null);

        if (heldDirection.current && gesture.current) {
          holdTimer.current = setTimeout(() => {
            if (heldDirection.current && gesture.current) {
              latestGo.current(heldDirection.current);
            }
          }, HOLD_REPEAT_DELAY_MS);
        }
      },
    });
  }

  // Execute turn action
  function go(direction, quick = false, count = 1) {
    if (!presented || !interactive) return;

    const active = activeTurn.current;
    if (active || settling.current) {
      if (!active || !settling.current) return;
      const requested =
        active.to + queuedTurns.current.reduce((sum, step) => sum + step, 0);
      if (requested + direction < 0 || requested + direction >= totalSlots) return;

      const travelled =
        active.direction === 1 ? progress.get() : 1 - progress.get();
      if (
        direction === active.direction &&
        !queuedTurns.current.length &&
        Math.min(active.from, active.to) > 0 &&
        (gatheringPacket.current === active || travelled < 0.22)
      ) {
        const to2 = packetTarget(
          active.from,
          direction,
          Math.abs(active.to - active.from) + 1,
          totalSlots - 1
        );
        if (to2 !== active.to) {
          animation.current?.stop();
          stopGathering();
          const packet = {
            ...active,
            to: to2,
            front: bookPages[direction === 1 ? active.from : to2],
            under: bookPages[direction === 1 ? to2 : active.from],
          };
          activeTurn.current = packet;
          gatheringPacket.current = packet;
          acceleratedTurn.current = null;
          setTurn(packet);
          packetTimer.current = setTimeout(() => {
            if (activeTurn.current === packet) settle(packet, true, true);
          }, RAPID_CLICK_WINDOW_MS);
          return;
        }
      }
      queuedTurns.current.push(direction);
      if (acceleratedTurn.current !== active) settle(active, true, true);
      return;
    }

    const to = packetTarget(current, direction, count, totalSlots - 1);
    if (reduced || !renderer.current) {
      if (onPageChange) onPageChange(to);
      return;
    }

    if (!gesture.current) renderer.current.setGrab(0);
    const next = begin(direction, count);
    if (next) settle(next, true, quick);
  }
  latestGo.current = go;

  // Release pointer / gesture
  function release(event, cancelled = false) {
    stopHolding();
    const drag = gesture.current;
    if (!drag || drag.id !== event.pointerId) return;
    gesture.current = null;

    if (bookElement.current?.hasPointerCapture(event.pointerId)) {
      bookElement.current.releasePointerCapture(event.pointerId);
    }
    suppressClick.current = drag.moved;

    const next = activeTurn.current;
    if (next && !settling.current) {
      const distance =
        next.direction === 1 ? progress.get() : 1 - progress.get();
      settle(
        next,
        !cancelled &&
          (distance > 0.15 ||
            (-drag.velocity * next.direction > 0.45 &&
              Math.abs(event.clientX - drag.x) > 32))
      );
    } else if (
      !cancelled &&
      drag.axis === "x" &&
      Math.abs(event.clientX - drag.x) > 40
    ) {
      go(event.clientX < drag.x ? 1 : -1);
    }
  }

  // CSS variables for styling
  const customStyles = {
    "--sketchbook-cover": book.coverColor || "#1c2328",
    "--sketchbook-cover-edge": book.edgeColor || "#101417",
    "--sketchbook-paper": book.paperColor || "#fbf8f0",
    ...style,
  };

  return (
    <div
      className={`physical-book-reader ${
        presented ? "is-presented" : "is-preparing"
      } ${className}`}
      style={customStyles}
    >
      <div
        ref={bookElement}
        className={`physical-book-container ${
          ready ? "has-paper-renderer" : ""
        } ${turn ? "is-turning" : ""}`}
        tabIndex={presented && interactive ? 0 : -1}
        role="region"
        aria-label={`${book.title || "Sketchbook"}. Tap right edge to open or turn page. Tap left edge to go back.`}
        onPointerDown={(event) => {
          if (!interactive) return;
          if (
            !event.isPrimary ||
            (event.pointerType === "mouse" && event.button !== 0)
          )
            return;
          suppressClick.current = false;
          if (settling.current) return;

          const bounds = event.currentTarget.getBoundingClientRect();
          // Dynamic grab modulation along Y axis: top corner (+1) to bottom corner (-1)
          const grabModulation =
            1 - (2 * (event.clientY - bounds.top)) / bounds.height;
          renderer.current?.setGrab(grabModulation);

          gesture.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            lastX: event.clientX,
            time: event.timeStamp,
            velocity: 0,
            axis: null,
            moved: false,
          };

          holdTimer.current = setTimeout(() => {
            const drag = gesture.current;
            if (!drag || drag.moved) return;
            heldDirection.current =
              event.clientX - bounds.left < bounds.width * 0.25 && current > 0
                ? -1
                : 1;
            drag.moved = true;
            bookElement.current?.setPointerCapture(drag.id);
            suppressClick.current = true;
            latestGo.current(heldDirection.current);
          }, HOLD_START_DELAY_MS);
        }}
        onPointerMove={(event) => {
          if (!interactive) return;
          const drag = gesture.current;
          if (!drag || event.pointerId !== drag.id) return;

          if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 7) {
            stopHolding();
          }
          if (settling.current) return;

          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 7) drag.moved = true;

          if (!drag.axis && drag.moved) {
            drag.axis = Math.abs(dx) > Math.abs(dy) * 1.1 ? "x" : "y";
          }
          if (drag.axis !== "x") return;

          event.preventDefault();
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.setPointerCapture(event.pointerId);
          }

          const dt = event.timeStamp - drag.time;
          if (dt > 0) drag.velocity = (event.clientX - drag.lastX) / dt;
          drag.lastX = event.clientX;
          drag.time = event.timeStamp;

          if (reduced || !renderer.current) return;

          const next = activeTurn.current || begin(dx < 0 ? 1 : -1);
          if (!next) return;

          const distance = Math.max(
            0,
            Math.min(
              1,
              (-dx * next.direction) / (event.currentTarget.clientWidth * 1.15)
            )
          );
          progress.set(next.direction === 1 ? distance : 1 - distance);
        }}
        onPointerUp={(event) => release(event)}
        onPointerCancel={(event) => release(event, true)}
        onLostPointerCapture={(event) => {
          if (gesture.current) release(event, true);
        }}
        onClick={(event) => {
          if (!interactive || suppressClick.current) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const isLeft = event.clientX - rect.left < rect.width * 0.35;

          // If on final page / back cover, clicking right closes the book!
          if (current >= totalSlots - 1 && !isLeft && onClose) {
            onClose("back");
            return;
          }

          go(isLeft && current > 0 ? -1 : 1);
        }}
        onKeyDown={(event) => {
          if (!interactive || event.target !== event.currentTarget) return;
          if (["ArrowRight", "ArrowLeft", "Enter", " "].includes(event.key)) {
            event.preventDefault();
            go(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {/* Ground shadow projection */}
        <span
          className="physical-book-ground"
          aria-hidden="true"
          style={
            ground
              ? {
                  left: `${ground.left * 100}%`,
                  top: `${ground.top * 100}%`,
                  width: `${ground.width * 100}%`,
                  height: `${ground.height * 100}%`,
                  borderRadius: `0 ${ground.radius}px ${ground.radius}px 0`,
                  boxShadow: `${ground.offsetX}px ${ground.offsetY}px ${ground.blur}px rgba(20,20,20,0.08)`,
                }
              : undefined
          }
        />

        {/* Fallback spine binding & paper edges for pre-WebGL mount */}
        <span className="physical-book-binding" aria-hidden="true" />
        <span className="physical-book-paper-edges" aria-hidden="true" />

        {/* Source elements for Three.js texture generation */}
        <div
          className="physical-book-under-source"
          aria-hidden="true"
          ref={(el) => {
            coverSourceRef.current = el;
            if (el) el.inert = true;
          }}
        >
          {bookPages[0]}
        </div>

        <div
          className="physical-book-under-source"
          aria-hidden="true"
          ref={(el) => {
            underPageRef.current = el;
            if (el) el.inert = true;
          }}
        >
          {turn?.under ?? bookPages[Math.min(current + 1, totalSlots - 1)]}
        </div>

        <div
          ref={frontPageRef}
          className="physical-book-resting-page"
          aria-hidden={turn ? true : undefined}
        >
          {turn ? turn.front : bookPages[current]}
        </div>

        {/* Three.js Paper Canvas Container */}
        <div ref={canvasHost} className="physical-book-canvas" aria-hidden="true" />

        {/* Edge Click Target Buttons */}
        <button
          type="button"
          className="physical-book-edge physical-book-edge-left"
          aria-label="Previous page / Close cover"
          disabled={!presented || !interactive || (turn?.to ?? current) === 0}
          onClick={(e) => {
            if (e.detail === 0 || !suppressClick.current) go(-1);
          }}
        />

        <button
          type="button"
          className="physical-book-edge physical-book-edge-right"
          aria-label={
            current === 0
              ? "Open sketchbook"
              : current >= totalSlots - 2
              ? "Close book to back cover"
              : "Turn page"
          }
          disabled={
            !presented ||
            !interactive ||
            (turn?.to ?? current) >= totalSlots - 1
          }
          onClick={(e) => {
            if (e.detail === 0 || !suppressClick.current) go(1);
          }}
        />
      </div>
    </div>
  );
}
export default PhysicalBook;
