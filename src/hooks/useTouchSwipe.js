import { useRef } from "react";

/**
 * useTouchSwipe
 * High-precision, fluid touch swipe detector for horizontal mobile carousels & cards.
 *
 * Prevents accidental triggering during natural vertical page scrolling by strictly
 * verifying the horizontal-to-vertical movement ratio.
 */
export function useTouchSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 36,
  maxVerticalRatio = 0.65,
  maxTimeMs = 650,
} = {}) {
  const touchDataRef = useRef(null);

  const onTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchDataRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTime: Date.now(),
      };
    }
  };

  const onTouchEnd = (e) => {
    if (!touchDataRef.current) return;
    const touch = e.changedTouches ? e.changedTouches[0] : null;
    if (!touch) return;

    const deltaX = touch.clientX - touchDataRef.current.startX;
    const deltaY = touch.clientY - touchDataRef.current.startY;
    const deltaTime = Date.now() - touchDataRef.current.startTime;

    touchDataRef.current = null;

    // Conditions:
    // 1. Gesture completed within max time (avoid drag & hold triggering)
    // 2. Traveled more than threshold pixels horizontally
    // 3. Movement was distinctly horizontal, not vertical scrolling
    if (
      deltaTime < maxTimeMs &&
      Math.abs(deltaX) >= threshold &&
      Math.abs(deltaY) <= Math.abs(deltaX) * maxVerticalRatio
    ) {
      if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  };

  return {
    onTouchStart,
    onTouchEnd,
    swipeHandlers: { onTouchStart, onTouchEnd },
  };
}

export default useTouchSwipe;
