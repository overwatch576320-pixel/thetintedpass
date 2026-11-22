import { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { MobileFoldedBook } from "./MobileFoldedBook";
import { SketchPage } from "./SketchPage";
import "./sketchbook.css";

const DesktopSketchbook = lazy(() => import("./DesktopSketchbook"));

export default function Sketchbook({
  bookSettings = {},
  pages = [],
}) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [mobilePage, setMobilePage] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter to published pages only for public view (or all if in preview/admin)
  const publishedPages = useMemo(() => {
    return (pages || []).filter((p) => p.published !== false);
  }, [pages]);

  // Construct mobile page stack: Front Cover -> Content Pages -> Back Cover
  const mobilePagesList = useMemo(() => {
    return [
      <SketchPage
        cover
        coverSide="front"
        key="front-cover"
        bookSettings={bookSettings}
      />,
      ...publishedPages.map((p, idx) => (
        <SketchPage
          key={p.id || idx}
          page={idx + 1}
          pageData={p}
          bookSettings={bookSettings}
        />
      )),
      <SketchPage
        cover
        coverSide="back"
        key="back-cover"
        bookSettings={bookSettings}
      />,
    ];
  }, [publishedPages, bookSettings]);

  return (
    <div
      className={`tinted-sketchbook-root sketchbook-shell ${
        isMobile ? "sketchbook-mobile is-mobile" : "is-desktop"
      }`}
      aria-label="Interactive Himalayan 3D Sketchbook"
    >
      {isMobile ? (
        <section
          className="sketch-mobile-content"
          aria-label="Mobile Sketchbook Reader"
        >
          <MobileFoldedBook
            pages={mobilePagesList}
            page={mobilePage}
            onPageChange={setMobilePage}
          />
        </section>
      ) : (
        <Suspense
          fallback={
            <div className="sketch-loading-notice" role="status">
              Opening the atelier sketchbook…
            </div>
          }
        >
          <DesktopSketchbook
            bookSettings={bookSettings}
            pages={publishedPages}
            onPageChange={() => {}}
          />
        </Suspense>
      )}

      {/* Credit and Attribution in accord with MIT License */}
      <footer className="sketchbook-credit-bar">
        <span className="credit-text">
          3D Book Engine based on open-source project by{" "}
          <a
            href="https://github.com/niyamax/sketchbook"
            target="_blank"
            rel="noopener noreferrer"
            className="credit-link"
          >
            Niyas (niyamax)
          </a>
        </span>
      </footer>
    </div>
  );
}
