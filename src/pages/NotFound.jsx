import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ background: "#ffffff", borderRadius: "var(--radius-panel)", padding: "3rem", maxWidth: "480px", textAlign: "center", boxShadow: "var(--shadow-panel)" }}>
        <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
          <Compass size={26} />
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#dc2626", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          404 · OFF THE TRAIL
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: "900", color: "#0f172a", marginBottom: "1rem" }}>
          This pass is uncharted
        </h1>
        <p style={{ fontFamily: "var(--font-body)", color: "#64748b", lineHeight: "1.6", marginBottom: "2rem" }}>
          The path you requested does not exist on our Trans-Himalayan cartography. Return to the valley trail to continue exploring.
        </p>
        <Link to="/" className="dossier-action-btn" style={{ justifyContent: "center", margin: "0 auto" }}>
          <ArrowLeft size={16} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
