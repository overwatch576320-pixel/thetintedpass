import { useEffect } from "react";
import { X, Calendar, MapPin, Feather } from "lucide-react";

export default function StoryModal({ story, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  if (!story) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-sheet" style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
        {/* Sticky Header */}
        <div className="modal-sticky-header">
          <div>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--accent-amber)",
              display: "block",
              marginBottom: "0.25rem"
            }}>
              Field Dispatch {story.number} · {story.date}
            </span>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              color: "var(--accent-cyan)"
            }}>
              <MapPin size={13} /> {story.location}
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close dispatch">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content-body">
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--palette-glacial-light)",
            marginBottom: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <Feather size={14} color="var(--palette-ochre-light)" /> {story.category} · By {story.author}
          </div>

          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "var(--text-pure)",
            marginBottom: "1.5rem"
          }}>
            {story.title}
          </h2>

          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontStyle: "italic",
            lineHeight: 1.5,
            color: "var(--palette-ochre-light)",
            borderLeft: "2px solid var(--palette-crimson-dark)",
            paddingLeft: "1.25rem",
            marginBottom: "2rem"
          }}>
            “{story.excerpt}”
          </div>

          <div style={{
            fontSize: "1.05rem",
            lineHeight: 1.85,
            color: "var(--text-secondary)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem"
          }}>
            <p>{story.content}</p>
            <p>
              In our journeys through Ladakh, participants learn to maintain an attentive, unhurried dialogue
              between the pigment brush, the cotton rag paper, and the silence of the trans-Himalayan valleys.
              Every entry in your personal travel book becomes an act of seeing clearly.
            </p>
          </div>

          <div style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              The Tinted Pass · Archival Dispatch
            </span>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary-glow"
              style={{ padding: "0.6rem 1.4rem" }}
            >
              Back to Dispatches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
