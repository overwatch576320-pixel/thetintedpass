import DesktopSketchbook from "./DesktopSketchbook";
import "./sketchbook.css";

export default function Sketchbook({
  bookSettings = {},
  pages = [],
}) {
  return (
    <div
      className="tinted-sketchbook-root"
      aria-label="Interactive 3D Artist's Sketchbook"
    >
      <DesktopSketchbook
        bookSettings={bookSettings}
        pages={pages}
        initialPage={0}
      />
    </div>
  );
}
