export function BookCover({
  className = "",
  side = "front",
  coverTitle = "LADAKH EXPEDITION JOURNAL",
  coverSubtitle = "Field Studies, Mineral Pigments & Monastic Murals",
  coverEyebrow = "TRANS-HIMALAYAN ATELIER · 2026",
  coverImage = null,
  coverColor = "#1a2421",
}) {
  const isBack = side === "back";

  return (
    <div
      className={`sketchbook-cover ${isBack ? "is-back-cover" : "is-front-cover"} ${className}`}
      style={{ backgroundColor: coverColor }}
      role="img"
      aria-label={isBack ? "Sketchbook Back Cover" : `Sketchbook Cover: ${coverTitle}`}
    >
      <img
        className="cover-stock-image"
        src="textures/charcoal-paper.png"
        alt=""
        draggable={false}
      />

      <div className="sketchbook-cover-foil-content">
        {!isBack ? (
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
        ) : (
          <div className="sketchbook-back-inner">
            <div className="back-monogram-symbol">TP</div>
            <div className="back-atelier-mark">THE TINTED PASS</div>
            <div className="back-edition-note">ARCHIVAL FIELD EXPEDITION DOSSIER</div>
          </div>
        )}
      </div>
    </div>
  );
}
