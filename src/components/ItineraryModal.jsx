import { useEffect } from "react";
import { X, Calendar, Mountain, Compass, CheckCircle, MessageCircle } from "lucide-react";
import { whatsappLink } from "../lib";

export default function ItineraryModal({ journey, onClose, onEnquire }) {
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

  if (!journey) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
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
              Curated Expedition Dossier · {journey.length}
            </span>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
              fontWeight: 700,
              color: "var(--text-pure)"
            }}>
              {journey.title}
            </h2>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close dossier">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="modal-content-body">
          <p style={{
            fontSize: "1.15rem",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            marginBottom: "1rem"
          }}>
            {journey.subtitle}
          </p>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: "1.75rem" }}>
            {journey.highlight}
          </p>

          {/* Route Strip */}
          <div style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            fontFamily: "var(--font-mono)",
            fontSize: "0.76rem"
          }}>
            <span style={{ color: "var(--palette-ochre-light)", fontWeight: 600 }}>ROUTE:</span>
            {journey.regions.map((reg, idx) => (
              <span key={reg} style={{ color: "var(--text-pure)" }}>
                {reg} {idx < journey.regions.length - 1 && <span style={{ color: "var(--palette-glacial-dark)", margin: "0 0.25rem" }}>→</span>}
              </span>
            ))}
            <span style={{ marginLeft: "auto", color: "var(--palette-glacial-light)", fontWeight: 600 }}>
              Max: {journey.maxAltitude}
            </span>
          </div>

          {/* Practical Acclimatisation Note */}
          {journey.practicalNotes && journey.practicalNotes.length > 0 && (
            <div style={{
              background: "rgba(180, 150, 60, 0.08)",
              borderLeft: "3px solid var(--palette-ochre-light)",
              padding: "1.25rem 1.5rem",
              borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
              marginBottom: "2.5rem"
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--palette-ochre-light)",
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 700
              }}>
                Acclimatisation Protocol & Field Logistics
              </span>
              <ul style={{ listStyle: "disc", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {journey.practicalNotes.map((note, i) => (
                  <li key={i} style={{ fontSize: "0.88rem", color: "var(--palette-linen-light)", lineHeight: 1.6 }}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Day-by-Day Timeline */}
          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "var(--text-pure)",
            marginBottom: "1.5rem"
          }}>
            Day-by-Day Field Itinerary & Creative Studies
          </h3>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
            position: "relative",
            borderLeft: "1px solid var(--border-subtle)",
            paddingLeft: "1.75rem",
            marginLeft: "0.5rem"
          }}>
            {(journey.days || []).map((day) => (
              <div key={day.day} style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: "-2.15rem",
                  top: "0.3rem",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--palette-crimson-dark)",
                  boxShadow: "0 0 10px var(--palette-crimson-dark)"
                }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.35rem" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.74rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--palette-ochre-light)",
                    fontWeight: 700
                  }}>
                    Day {day.day}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", color: "var(--palette-glacial-light)" }}>
                    · {day.altitude} · {day.region}
                  </span>
                </div>
                <h4 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "var(--text-pure)",
                  marginBottom: "0.4rem"
                }}>
                  {day.place}
                </h4>
                <p style={{ fontSize: "0.92rem", lineHeight: 1.65, color: "var(--palette-linen-light)" }}>
                  {day.artExercise}
                </p>
                {day.travelerLink && day.travelerLink !== "-" && (
                  <div style={{
                    marginTop: "0.6rem",
                    padding: "0.65rem 0.95rem",
                    background: "rgba(222, 195, 174, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.82rem",
                    color: "var(--palette-glacial-light)"
                  }}>
                    <strong style={{ color: "var(--palette-ochre-light)", marginRight: "6px" }}>Historical Context:</strong>
                    Linked with {day.travelerLink} ({day.kind})
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Included / Excluded Services */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border-subtle)"
          }}>
            <div style={{ background: "rgba(0, 0, 0, 0.4)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent-emerald)",
                display: "block",
                marginBottom: "0.75rem",
                fontWeight: 700
              }}>
                Included In Every Expedition
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {[
                  "Handbound Khadi 320gsm cotton rag journal & mineral pigments",
                  "Portable field easel, sable brushes & daily creative masterclasses",
                  "Boutique monastery & heritage village homestays across Ladakh",
                  "Dedicated 4x4 mountain vehicles with oxygen support & medical kit",
                  "All inner-line permits, wildlife sanctuary fees & cultural contributions",
                  "Resident artist curator & Ladakhi cultural translators throughout"
                ].map((inc, i) => (
                  <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span style={{ color: "var(--accent-emerald)" }}>✓</span> {inc}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "rgba(0, 0, 0, 0.4)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "0.75rem",
                fontWeight: 700
              }}>
                Traveler Responsibility
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {[
                  "Commercial flights to and from Leh (IXL Airport)",
                  "Personal comprehensive high-altitude travel insurance",
                  "Personal specialized art media (e.g. oil sticks, oversized canvases)"
                ].map((exc, i) => (
                  <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span>—</span> {exc}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Modal Action CTA */}
          <div style={{
            marginTop: "2.5rem",
            paddingTop: "1.75rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                EXPEDITION COHORTS STRICTLY CAPPED AT 8 PARTICIPANTS
              </span>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a
                href={whatsappLink(`Hello! I am reviewing the ${journey.title} (${journey.length}) and would like to inquire about dates.`)}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp-glow"
              >
                <MessageCircle size={15} /> WhatsApp Curator
              </a>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onEnquire) onEnquire(journey.title);
                }}
                className="btn-primary-glow"
                style={{ padding: "0.75rem 1.6rem" }}
              >
                Inquire For This Expedition
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
