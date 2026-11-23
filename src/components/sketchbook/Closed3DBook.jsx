import React from "react";
import "./sketchbook.css";

/**
 * Closed3DBook
 * Renders a physical 3D hardcover artist's sketchbook.
 * Proportions: ISO A4 standard (aspect ratio 1 : 1.414).
 * Minimalist, solid-colour cover respecting Himalayan mineral palette.
 * Includes layered paper fore-edge, top/bottom page block trim,
 * rounded outer corners, spine crease, and realistic contact shadows.
 */
export default function Closed3DBook({
  book,
  width = 164,
  height = 232,
  isActive = false,
  isOpening = false,
  style = {},
  onClick,
  ...props
}) {
  const coverColor = book.coverColor || "#1b3358";
  const edgeColor = book.edgeColor || "#0f1e33";
  const paperColor = book.paperColor || "#fbf8f0";

  return (
    <div
      className={`closed-3d-book-container ${isActive ? "is-active" : ""} ${
        isOpening ? "is-opening" : ""
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${book.title || "Artist Sketchbook"} - Tap to open`}
      {...props}
    >
      <div className="closed-3d-book-body">
        {/* Contact Shadow Underneath */}
        <div className="closed-book-ground-shadow" aria-hidden="true" />

        {/* Back Cover Plate */}
        <div
          className="closed-book-plate back-plate"
          style={{ backgroundColor: coverColor, borderColor: edgeColor }}
          aria-hidden="true"
        />

        {/* Fore-Edge Paper Block (Right side thickness) */}
        <div
          className="closed-book-fore-edge"
          style={{ backgroundColor: paperColor }}
          aria-hidden="true"
        >
          <div className="paper-layers-lines" />
        </div>

        {/* Top & Bottom Paper Trim */}
        <div
          className="closed-book-edge top-edge"
          style={{ backgroundColor: paperColor }}
          aria-hidden="true"
        />
        <div
          className="closed-book-edge bottom-edge"
          style={{ backgroundColor: paperColor }}
          aria-hidden="true"
        />

        {/* Spine Curvature & Left Hinge Crease */}
        <div
          className="closed-book-spine-hinge"
          style={{ backgroundColor: coverColor }}
          aria-hidden="true"
        >
          <div className="spine-fold-line" />
        </div>

        {/* Hardcover Front Plate */}
        <div
          className="closed-book-plate front-plate"
          style={{ backgroundColor: coverColor, borderColor: edgeColor }}
        >
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title || "Book Cover"}
              className="closed-cover-artwork"
            />
          ) : (
            <div className="closed-cover-solid-face">
              <div className="closed-cover-spacer" />
              <div className="closed-cover-title-group">
                <span className="closed-cover-title">{book.title}</span>
                {book.subtitle && (
                  <span className="closed-cover-subtitle">{book.subtitle}</span>
                )}
                {book.edition && (
                  <span className="closed-cover-edition">{book.edition}</span>
                )}
              </div>
              <div className="closed-cover-spacer" />
            </div>
          )}

          {/* Realistic cover sheen / ambient light gradient */}
          <div className="closed-cover-sheen" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
