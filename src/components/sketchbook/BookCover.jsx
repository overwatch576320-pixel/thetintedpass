export function BookCover({
  className = "",
  side = "front",
  coverTitle = "LADAKH EXPEDITION JOURNAL",
  coverSubtitle = "Field Studies, Mineral Pigments & Monastic Murals",
  coverEyebrow = "TRANS-HIMALAYAN ATELIER · 2026",
  coverImage = null,
  coverColor = "#1a2522",
}) {
  const isBack = side === "back";
  const isInsideFront = side === "inside-front" || side === "inside";
  const isInsideBack = side === "inside-back";
  const isInside = isInsideFront || isInsideBack;

  return (
    <div
      className={`sketchbook-cover ${
        isBack
          ? "is-back-cover"
          : isInside
          ? "is-inside-cover"
          : "is-front-cover"
      } ${className}`}
      style={{ backgroundColor: coverColor }}
      role="img"
      aria-label={
        isBack
          ? "Sketchbook Back Cover"
          : isInsideFront
          ? "Sketchbook Inside Front Cover"
          : isInsideBack
          ? "Sketchbook Inside Back Cover"
          : `Sketchbook Cover: ${coverTitle}`
      }
    >
      <img
        className="cover-stock-image"
        src="/textures/charcoal-paper.png"
        alt=""
        draggable={false}
      />

      {isInsideFront ? (
        <div className="sketchbook-cover-foil-content sketch-inside-cover">
          <div className="inside-cover-plate">
            <div className="inside-cover-monogram">TP</div>
            <h3 className="inside-cover-heading">TRANS-HIMALAYAN ATELIER</h3>
            <p className="inside-cover-subtitle">ARCHIVAL EXPEDITION JOURNAL · 2026</p>
            <div className="inside-cover-rule" />
            <p className="inside-cover-text">
              Plein air graphite & natural mineral pigment studies recorded along the mountain sanctuaries and ancient passes of Ladakh.
            </p>
            <div className="inside-cover-edition">COHORT EDITION · 3,500M – 5,360M</div>
          </div>
        </div>
      ) : isInsideBack ? (
        <div className="sketchbook-cover-foil-content sketch-inside-cover">
          <div className="inside-cover-plate">
            <div className="inside-cover-monogram">✦</div>
            <h3 className="inside-cover-heading">THE TINTED PASS</h3>
            <p className="inside-cover-subtitle">LEH, LADAKH · FIELD DOSSIER</p>
            <div className="inside-cover-rule" />
            <p className="inside-cover-text">
              Hand-bound archival cotton rag paper. Preserved for monastic intimacy and personal studio contemplation.
            </p>
            <div className="inside-cover-footer">OLD TOWN LEH · TRANS-HIMALAYAS</div>
          </div>
        </div>
      ) : !isBack ? (
        <div className="sketchbook-cover-foil-content">
          <div className="sketchbook-cover-inner">
            <div className="cover-eyebrow-text">{coverEyebrow}</div>
            {coverImage && (
              <div className="cover-center-artwork">
                <img src={coverImage} alt="" draggable={false} />
              </div>
            )}
            <h2 className="cover-main-title">{coverTitle}</h2>
            <div className="cover-rule-divider" />
            <p className="cover-subtitle-text">{coverSubtitle}</p>
            <div className="cover-footer-brand">THE TINTED PASS · LEH</div>
          </div>
        </div>
      ) : (
        <div className="sketchbook-cover-foil-content">
          <div className="sketchbook-back-inner">
            <div className="back-monogram-symbol">TP</div>
            <div className="back-atelier-mark">THE TINTED PASS</div>
            <div className="back-edition-note">ARCHIVAL FIELD EXPEDITION DOSSIER</div>
          </div>
        </div>
      )}
    </div>
  );
}
