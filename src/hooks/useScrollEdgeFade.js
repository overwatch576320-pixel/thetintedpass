import { useEffect, useRef, useCallback } from "react";

/**
 * useScrollEdgeFade
 * High-performance, cross-browser dynamic edge-fade hook using CSS mask-image.
 *
 * Automatically tracks container scroll position, scrollWidth, and clientWidth,
 * applying subtle edge masks only when content overflows and more content is available.
 *
 * Supported features:
 * - Dynamic edge fade: Left fade disappears at scrollLeft = 0; right fade disappears at scrollEnd.
 * - Zero hardcoding: Works natively over any background (cyan, white, glass, dark) via alpha masking.
 * - Auto-centering: Smoothly scrolls the active item into the clear middle zone.
 * - Native browser scroll-into-view integration.
 * - Passive, non-blocking touch interaction.
 */
export function useScrollEdgeFade({
  externalRef = null,
  activeSelector = ".active",
  activeKey = null,
  autoCenterActive = true,
  fadeWidth = 28,
} = {}) {
  const internalRef = useRef(null);
  const containerRef = externalRef || internalRef;

  const updateFade = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Sub-pixel threshold for high-DPI and mobile displays
    const hasOverflow = scrollWidth > clientWidth + 3;
    const canLeft = hasOverflow && scrollLeft > 3;
    const canRight = hasOverflow && scrollWidth - (scrollLeft + clientWidth) > 3;

    el.classList.toggle("has-scroll-overflow", hasOverflow);
    el.classList.toggle("can-scroll-left", canLeft);
    el.classList.toggle("can-scroll-right", canRight);

    el.style.setProperty("--fade-width", `${fadeWidth}px`);
  }, [containerRef, fadeWidth]);

  // Centers the currently active element in the clear, non-faded area of the container
  const centerActiveElement = useCallback(
    (behavior = "smooth") => {
      const el = containerRef.current;
      if (!el) return;

      // Pure local container scrolling - NEVER touch ancestor containers or window.
      // If there is no overflow, ensure scrollLeft is 0 and exit.
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= 2) {
        if (el.scrollLeft !== 0) el.scrollLeft = 0;
        return;
      }

      const activeEl = el.querySelector(activeSelector);
      if (!activeEl) return;

      // Calculate the exact target scroll position within this local container ONLY
      const elRect = el.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const activeCenter = activeRect.left + activeRect.width / 2;
      const containerCenter = elRect.left + elRect.width / 2;
      const delta = activeCenter - containerCenter;
      const targetScrollLeft = Math.max(0, Math.min(el.scrollLeft + delta, maxScroll));

      if (typeof el.scrollTo === "function") {
        el.scrollTo({ left: targetScrollLeft, behavior });
      } else {
        el.scrollLeft = targetScrollLeft;
      }
    },
    [containerRef, activeSelector]
  );

  // Auto-center when activeKey changes (e.g. selected tab / day / filter)
  useEffect(() => {
    if (autoCenterActive && activeKey !== null && activeKey !== undefined) {
      // Execute after layout settles
      const timer = setTimeout(() => {
        centerActiveElement("smooth");
        updateFade();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [activeKey, autoCenterActive, centerActiveElement, updateFade]);

  // Setup scroll and resize observers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateFade();
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateFade();
      });
      resizeObserver.observe(el);
      Array.from(el.children).forEach((child) => resizeObserver.observe(child));
    } else {
      window.addEventListener("resize", updateFade, { passive: true });
    }

    // Initial calculation
    updateFade();

    // Initial center on mount
    if (autoCenterActive) {
      const timer = setTimeout(() => {
        centerActiveElement("instant");
        updateFade();
      }, 70);

      return () => {
        clearTimeout(timer);
        el.removeEventListener("scroll", onScroll);
        if (resizeObserver) resizeObserver.disconnect();
        window.removeEventListener("resize", updateFade);
      };
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateFade);
    };
  }, [containerRef, updateFade, autoCenterActive, centerActiveElement]);

  return { containerRef, updateFade, centerActiveElement };
}

export default useScrollEdgeFade;
