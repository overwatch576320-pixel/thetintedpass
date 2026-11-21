import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, X, Calendar, MapPin, User, Tag } from "lucide-react";
import { useSiteContent } from "../context/SiteContentContext";

export default function Journal() {
  const { content } = useSiteContent();
  const entries = content.journalEntries || [];

  const [activeCategory, setActiveCategory] = useState("All");
  const [readingEntry, setReadingEntry] = useState(null);

  const categories = ["All", "Landscape & Scale", "Mural Heritage", "Historical Travelers"];

  const filteredEntries =
    activeCategory === "All"
      ? entries
      : entries.filter((e) => e.category === activeCategory);

  return (
    <div className="journal-page-container">
      <div style={{ maxWidth: "750px", marginBottom: "2rem" }}>
        <h1 className="journal-headline">Journal & Field Notes</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "1.1rem", color: "rgba(255, 255, 255, 0.95)", lineHeight: "1.6" }}>
          Dispatches, historical reflections, and sketchbook observations recorded along the high passes and mudbrick sanctuaries of Ladakh.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="journal-category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`journal-tab-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Journal Dispatches */}
      <div className="journal-cards-grid">
        {filteredEntries.map((entry) => (
          <article key={entry.id} className="journal-entry-card">
            <div>
              <div className="journal-entry-meta">
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={13} /> {entry.date}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <MapPin size={13} /> {entry.location}
                </span>
              </div>

              <h2 className="journal-entry-title">{entry.title}</h2>
              <p className="journal-entry-excerpt">{entry.excerpt}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", background: "#f8fafc", padding: "0.25rem 0.65rem", borderRadius: "9999px", color: "#64748b" }}>
                {entry.category}
              </span>

              <button
                type="button"
                onClick={() => setReadingEntry(entry)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.88rem",
                  fontWeight: "700",
                  color: "#0284c7",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                Read Dispatch <ArrowUpRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Full Article Reading Modal */}
      {readingEntry && (
        <div className="modal-backdrop-overlay" role="dialog" aria-modal="true">
          <div className="modal-content-panel">
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setReadingEntry(null)}
              aria-label="Close article"
            >
              <X size={20} />
            </button>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
              {readingEntry.category} · {readingEntry.location} · {readingEntry.date}
            </div>

            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", fontWeight: "900", color: "#0f172a", lineHeight: "1.2", marginBottom: "1.25rem" }}>
              {readingEntry.title}
            </h2>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "#64748b", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <User size={14} /> By {readingEntry.author || "Expedition Chronicler"}
            </div>

            <div style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", color: "#334155", lineHeight: "1.8", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
              <p style={{ marginBottom: "1.5rem" }}>{readingEntry.content}</p>
              <p style={{ fontStyle: "italic", color: "#64748b", borderLeft: "3px solid #0284c7", paddingLeft: "1rem" }}>
                Recorded in the expedition field book during the annual Atelier Season in Ladakh.
              </p>
            </div>

            <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
              <Link
                to="/contact"
                className="dossier-action-btn"
                onClick={() => setReadingEntry(null)}
              >
                Inquire for Next Atelier <ArrowUpRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => setReadingEntry(null)}
                style={{ fontFamily: "var(--font-display)", fontWeight: "600", color: "#64748b" }}
              >
                Close Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
