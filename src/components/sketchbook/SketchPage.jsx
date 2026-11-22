import { forwardRef } from "react";
import { BookCover } from "./BookCover";

/**
 * SketchPage Component
 * Faithfully recreates the authentic Niyas sketchbook paper leaf:
 * Pure cotton rag paper, natural ink multiply blend, subtle folio numbering.
 */
export const SketchPage = forwardRef(function SketchPage(
  {
    cover = false,
    page = 0,
    coverSide = "front",
    side = null,
    pageData = null,
    bookSettings = null,
  },
  ref
) {
  const isLeft = side ? side === "left" : page % 2 !== 0;

  if (cover) {
    const isBackCover = coverSide === "back";
    return (
      <div
        ref={ref}
        className={`sketch-page is-cover ${
          isBackCover ? "is-back-cover" : "is-front-cover"
        }`}
      >
        <BookCover
          side={coverSide}
          coverTitle={bookSettings?.bookTitle || "LADAKH EXPEDITION JOURNAL"}
          coverSubtitle={
            bookSettings?.bookSubtitle ||
            "Plein Air Field Studies & Monastic Pigments"
          }
          coverEyebrow={
            bookSettings?.coverEyebrow || "TRANS-HIMALAYAN ATELIER · 2026"
          }
          coverImage={bookSettings?.coverImage || null}
          coverColor={bookSettings?.coverColor || "#1b2522"}
          className="mobile-book-cover"
        />
      </div>
    );
  }

  const data = pageData || {
    isBlank: true,
    title: `Blank Folio ${page}`,
  };

  const imageSrc =
    data.image && !data.isBlank
      ? data.image.startsWith("http") ||
        data.image.startsWith("data:") ||
        data.image.startsWith("/")
        ? data.image
        : `/${data.image}`
      : null;

  return (
    <div
      ref={ref}
      className={`sketch-page ${isLeft ? "is-left" : "is-right"}`}
      data-page-num={page}
    >
      <article
        className="mobile-book-paper sketch-paper"
        aria-label={`Sketchbook page ${page}`}
      >
        {imageSrc ? (
          <div className="sketch-artwork-viewport">
            <img
              className="sketch-illustration"
              src={imageSrc}
              alt={data.title || `Sketchbook page ${page}`}
              draggable={false}
              decoding="async"
            />
          </div>
        ) : (
          <div className="sketch-blank-folio-surface" />
        )}

        {/* Minimal Archival Folio Number in corner */}
        <span
          className={`sketch-page-folio-num ${
            isLeft ? "folio-left" : "folio-right"
          }`}
        >
          {String(page).padStart(2, "0")}
        </span>
      </article>
    </div>
  );
});
