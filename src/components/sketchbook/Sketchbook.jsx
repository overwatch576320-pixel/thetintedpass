import { SwiperCoverflowCarousel } from "./SwiperCoverflowCarousel";
import "./sketchbook.css";

/**
 * THE TINTED PASS — Homepage Carousel Stage
 * Temporarily isolated to pure Swiper Coverflow with simple image cards.
 * Reproduces the user-supplied Swiper Coverflow reference directly:
 * - Center card facing viewer
 * - Perspective rotation on sides
 * - 3D depth and shadows
 * - Fluid dragging and momentum
 * - Zero 3D book geometry or opening/closing animations
 */
export default function Sketchbook({
  bookSettings = {},
  pages = [],
}) {
  return (
    <div
      className="tinted-sketchbook-root"
      aria-label="Interactive 3D Carousel Stage"
    >
      <SwiperCoverflowCarousel />
    </div>
  );
}
