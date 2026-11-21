import { useSiteContent } from "../context/SiteContentContext";

/**
 * Reusable Solid-Colour Image Placeholder
 * Conforms strictly to Requirement 4:
 * "Use only solid-colour image placeholders (pale aqua, turquoise, muted brown).
 * Exact same dimensions, positioning, corner radius and proportions as Photoshop references.
 * Central asset configuration to replace every placeholder later."
 */
export default function SolidPlaceholder({
  slotId,
  src = null,
  style = {},
  className = "",
  badge = null,
  footerLeft = null,
  footerRight = null,
  children
}) {
  const { content } = useSiteContent();
  const assetConfig = (content?.assets && content.assets[slotId]) || null;

  const bg = assetConfig?.placeholderColor || "#adefea";
  const radius = assetConfig?.borderRadius || "var(--radius-image)";
  const border = assetConfig?.placeholderBorder || "none";
  const customSrc = src || assetConfig?.src;

  if (customSrc) {
    return (
      <div
        className={`solid-placeholder-wrapper has-custom-image ${className}`}
        style={{
          borderRadius: radius,
          overflow: "hidden",
          position: "relative",
          ...style
        }}
      >
        <img
          src={customSrc}
          alt={assetConfig?.alt || "Expedition visual"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            zIndex: 1
          }}
        />
        {badge && <div className="placeholder-badge" style={{ position: "relative", zIndex: 2 }}>{badge}</div>}
        {(footerLeft || footerRight) && (
          <div className="placeholder-footer-strip" style={{ position: "relative", zIndex: 2 }}>
            {footerLeft && <span>{footerLeft}</span>}
            {footerRight && <span>{footerRight}</span>}
          </div>
        )}
        {children && <div style={{ position: "relative", zIndex: 2, display: "contents" }}>{children}</div>}
      </div>
    );
  }

  return (
    <div
      className={`solid-placeholder-box ${className}`}
      data-slot-id={slotId}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        border: border,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        ...style
      }}
      aria-label={assetConfig?.alt || `Image slot: ${slotId}`}
    >
      {badge && <div className="placeholder-badge">{badge}</div>}
      {children}
      {(footerLeft || footerRight) && (
        <div className="placeholder-footer-strip">
          {footerLeft && <span className="placeholder-footer-left">{footerLeft}</span>}
          {footerRight && <span className="placeholder-footer-right">{footerRight}</span>}
        </div>
      )}
    </div>
  );
}
