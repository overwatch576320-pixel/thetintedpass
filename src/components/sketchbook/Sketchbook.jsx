import { InteractiveBookCollection } from "./v2/InteractiveBookCollection";
import { DEFAULT_BOOK_COLLECTION } from "../../data/defaultBookCollection";
import "./sketchbook.css";

/**
 * THE TINTED PASS — Homepage 3D Interactive Book Collection
 * Rebuilt using a clean dual-engine architecture:
 * 1. Swiper Coverflow Engine for carousel motion, perspective, 75% side-book scale,
 *    mirrored inward Y-axis rotation, and progressive depth-of-field blur.
 * 2. Physical Book Engine for authentic hardcover opening/closing around spine hinge,
 *    3D subdivided paper curl deformation, corner dragging, and closing from back cover.
 */
export default function Sketchbook({
  bookSettings = {},
  pages = [],
}) {
  const books = bookSettings.bookCollection || DEFAULT_BOOK_COLLECTION;

  return (
    <div
      className="tinted-sketchbook-root"
      aria-label="Interactive 3D Artist Book Collection"
    >
      <InteractiveBookCollection books={books} />
    </div>
  );
}
