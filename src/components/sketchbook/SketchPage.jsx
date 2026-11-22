import { forwardRef } from "react";
import { BookCover } from "./BookCover";

/**
 * SketchPage Component
 * Supports 7 carefully designed Trans-Himalayan editorial page templates:
 * 1. full_artwork: One large image occupying most of the page
 * 2. photo_field_notes: Image accompanied by written observation
 * 3. sketch_annotation: Artwork with handwritten-style labels and notes
 * 4. two_image_spread: Two related photographs or illustrations
 * 5. map_route: Topographic map with route markings & coordinates
 * 6. material_study: Mineral pigments, color swatches & grinding notes
 * 7. editorial: Combination of heading, pull quote, paragraph and thumbnail
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
            "Field Studies, Mineral Pigments & Monastic Murals"
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

  // Fallback if no specific pageData provided
  const data = pageData || {
    template: "full_artwork",
    title: `Field Study 0${page}`,
    location: "Ladakh, Trans-Himalayas",
    date: "Summer Atelier 2026",
    image: "/editorial/artidote-editorial.jpg",
    caption: "Plein air mineral wash on 300gsm cold-pressed cotton rag.",
  };

  const template = data.template || "full_artwork";

  return (
    <div
      ref={ref}
      className={`sketch-page ${isLeft ? "is-left" : "is-right"}`}
      data-page-num={page}
    >
      <article
        className="mobile-book-paper sketch-paper"
        aria-label={`Sketchbook page ${page}: ${data.title || ""}`}
      >
        {/* Top Header Strip */}
        <div className="sketch-page-header">
          <span className="sketch-page-location">
            {data.location || "TRANS-HIMALAYAS"}
          </span>
          <span className="sketch-page-number">
            P. {page < 10 ? `0${page}` : page}
          </span>
        </div>

        {/* Template 1: Full-Page Artwork */}
        {template === "full_artwork" && (
          <div className="template-full-artwork">
            <div className="sketch-artwork-frame">
              {data.image && (
                <img
                  className="sketch-illustration"
                  src={data.image}
                  alt={data.title || "Field Artwork"}
                  draggable={false}
                  decoding="async"
                />
              )}
            </div>
            <div className="sketch-artwork-caption-block">
              <h3 className="sketch-artwork-title">{data.title}</h3>
              {data.caption && (
                <p className="sketch-artwork-caption">{data.caption}</p>
              )}
              <div className="sketch-artwork-meta">
                {data.date && <span>{data.date}</span>}
                {data.credit && <span> · {data.credit}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Template 2: Photograph with Field Notes */}
        {template === "photo_field_notes" && (
          <div className="template-photo-notes">
            <div className="sketch-photo-frame">
              {data.image && (
                <img
                  className="sketch-illustration"
                  src={data.image}
                  alt={data.title}
                  draggable={false}
                  decoding="async"
                />
              )}
            </div>
            <div className="sketch-notes-body">
              <h3 className="sketch-notes-title">{data.title}</h3>
              {data.description && (
                <p className="sketch-notes-p">{data.description}</p>
              )}
              {data.caption && (
                <div className="sketch-notes-field-memo">
                  <span className="memo-marker">Obs:</span> {data.caption}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Template 3: Sketch and Annotation */}
        {template === "sketch_annotation" && (
          <div className="template-sketch-annotation">
            <div className="sketch-annotated-canvas">
              {data.image && (
                <img
                  className="sketch-illustration"
                  src={data.image}
                  alt={data.title}
                  draggable={false}
                  decoding="async"
                />
              )}
              {(data.annotations || []).map((ann, i) => (
                <div
                  key={i}
                  className={`sketch-annotation-pin pin-${(i % 3) + 1}`}
                  style={{
                    top: ann.y || `${25 + i * 25}%`,
                    left: ann.x || `${20 + (i % 2) * 45}%`,
                  }}
                >
                  <span className="pin-dot">●</span>
                  <span className="pin-text">{ann.text || ann}</span>
                </div>
              ))}
            </div>
            <div className="sketch-annotation-footer">
              <h3 className="sketch-notes-title">{data.title}</h3>
              {data.caption && <p className="sketch-notes-p">{data.caption}</p>}
            </div>
          </div>
        )}

        {/* Template 4: Two-Image Spread */}
        {template === "two_image_spread" && (
          <div className="template-two-image">
            <h3 className="sketch-notes-title-small">{data.title}</h3>
            <div className="two-image-grid">
              <div className="dual-image-card">
                {data.image && (
                  <img
                    className="sketch-illustration"
                    src={data.image}
                    alt={data.caption || "Study A"}
                    draggable={false}
                    decoding="async"
                  />
                )}
                <span className="dual-image-caption">
                  {data.imageLabel || "Study I · Morning Light"}
                </span>
              </div>
              <div className="dual-image-card">
                {data.secondaryImage && (
                  <img
                    className="sketch-illustration"
                    src={data.secondaryImage}
                    alt={data.secondaryCaption || "Study B"}
                    draggable={false}
                    decoding="async"
                  />
                )}
                <span className="dual-image-caption">
                  {data.secondaryCaption || "Study II · Mineral Wash"}
                </span>
              </div>
            </div>
            {data.description && (
              <p className="sketch-notes-p-small">{data.description}</p>
            )}
          </div>
        )}

        {/* Template 5: Map and Route Study */}
        {template === "map_route" && (
          <div className="template-map-route">
            <div className="sketch-map-frame">
              {data.image && (
                <img
                  className="sketch-illustration"
                  src={data.image}
                  alt={data.title}
                  draggable={false}
                  decoding="async"
                />
              )}
              <div className="map-compass-mark">✦ 34°09′N · 77°34′E</div>
            </div>
            <div className="map-dossier-notes">
              <div className="map-station-badge">
                {data.routeStation || "Khardung La Pass · 5,360 m"}
              </div>
              <h3 className="sketch-notes-title">{data.title}</h3>
              {data.description && (
                <p className="sketch-notes-p">{data.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Template 6: Material Study */}
        {template === "material_study" && (
          <div className="template-material-study">
            <div className="material-study-header">
              <span className="material-eyebrow">MINERAL PIGMENT DOSSIER</span>
              <h3 className="sketch-notes-title">{data.title}</h3>
            </div>
            <div className="material-swatches-row">
              {(data.swatches || [
                { name: "Lapis Lazuli", color: "#1e3a8a", code: "Badakhshan" },
                { name: "Malachite", color: "#065f46", code: "Copper Ore" },
                { name: "Cinnabar", color: "#991b1b", code: "Mountain Cleft" },
                { name: "Apricot Wash", color: "#c2410c", code: "Alchi Clay" },
              ]).map((sw, i) => (
                <div key={i} className="swatch-item">
                  <div
                    className="swatch-circle"
                    style={{ backgroundColor: sw.color }}
                  />
                  <span className="swatch-name">{sw.name}</span>
                  <span className="swatch-code">{sw.code}</span>
                </div>
              ))}
            </div>
            {data.image && (
              <div className="material-specimen-photo">
                <img
                  className="sketch-illustration"
                  src={data.image}
                  alt={data.title}
                  draggable={false}
                  decoding="async"
                />
              </div>
            )}
            {data.description && (
              <p className="sketch-notes-p-small">{data.description}</p>
            )}
          </div>
        )}

        {/* Template 7: Editorial Page */}
        {template === "editorial" && (
          <div className="template-editorial">
            <div className="editorial-chapter-number">
              {data.chapter || "ATELIER CHAPTER I"}
            </div>
            <h2 className="editorial-main-title">{data.title}</h2>
            {data.pullQuote && (
              <blockquote className="editorial-pull-quote">
                “{data.pullQuote}”
              </blockquote>
            )}
            <div className="editorial-body-wrap">
              {data.image && (
                <div className="editorial-inset-image">
                  <img
                    className="sketch-illustration"
                    src={data.image}
                    alt=""
                    draggable={false}
                    decoding="async"
                  />
                </div>
              )}
              {data.description && (
                <p className="editorial-body-p">{data.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Page Footer */}
        <div className="sketch-page-footer">
          <span className="sketch-footer-brand">THE TINTED PASS</span>
          <span className="sketch-footer-seal">ATELIER ARCHIVES</span>
        </div>
      </article>
    </div>
  );
});
