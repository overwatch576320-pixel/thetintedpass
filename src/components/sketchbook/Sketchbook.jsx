import { useState, useEffect } from "react";
import DesktopSketchbook from "./DesktopSketchbook";
import MobileBookCollection from "./MobileBookCollection";
import { DEFAULT_BOOK_COLLECTION } from "../../data/defaultBookCollection";
import "./sketchbook.css";

export default function Sketchbook({
  bookSettings = {},
  pages = [],
}) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div
        className="tinted-sketchbook-root is-mobile-view"
        aria-label="Interactive 3D Artist Book Collection"
      >
        <MobileBookCollection
          books={bookSettings.bookCollection || DEFAULT_BOOK_COLLECTION}
        />
      </div>
    );
  }

  // Desktop: 100% untouched
  return (
    <div
      className="tinted-sketchbook-root is-desktop-view"
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
