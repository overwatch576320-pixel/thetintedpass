import { useState } from "react";
import { useSiteContent } from "../context/SiteContentContext";
import { CheckCircle2, Mail, Phone, MapPin, Compass } from "lucide-react";
import { countries } from "../data/countries";

const WhatsAppIcon = ({ size = 15, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-5.805 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const WHATSAPP_LINK =
  "https://wa.me/919876543210?text=Hello%20The%20Tinted%20Pass%2C%20I%20would%20like%20to%20enquire%20about%20your%20Ladakh%20journeys.";

export default function Contact() {
  const { content, addEnquiry } = useSiteContent();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addEnquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        message: formData.message
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const contactEmail = content.contactEmail || "hello@thetintedpass.com";
  const contactPhone = content.contactPhone || "+91 98765 43210";
  const cleanPhone = contactPhone.replace(/[^0-9+]/g, "");

  return (
    <div className="contact-container">
      {/* Left Column: Heading, Subhead & Studio Coordinates */}
      <div className="contact-left-col">
        <div className="contact-eyebrow contact-mobile-only">ATELIER LIAISON &amp; RESERVATIONS</div>
        <h1 className="contact-title animate-enter-1">
          {content.contactHeading || "Begin Your Journey"}
        </h1>
        <p className="contact-intro animate-enter-2">
          {content.contactIntro ||
            "Every journey begins with an open conversation. Cohorts are strictly limited to 6 to 10 participants to preserve monastic intimacy and individual studio mentoring."}
        </p>

        {/* Mobile Fast Action Contact Bar */}
        <div className="contact-mobile-fast-actions contact-mobile-only">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-action-pill whatsapp-pill"
          >
            <WhatsAppIcon size={16} />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href={`mailto:${contactEmail}`}
            className="mobile-action-pill"
          >
            <Mail size={15} />
            <span>Email Dispatch</span>
          </a>
          <a
            href={`tel:${cleanPhone}`}
            className="mobile-action-pill"
          >
            <Phone size={15} />
            <span>Call Studio</span>
          </a>
        </div>

        {/* Desktop Coordinates List (Exact Original bc6a98a) */}
        <div className="contact-coordinates-list animate-enter-3 contact-desktop-only">
          <div className="contact-coord-item">
            <span className="contact-coord-label">HERITAGE ATELIER PRECINCT</span>
            <span className="contact-coord-value">
              {content.contactAddress || "Old Town Heritage Precinct, Leh, Ladakh 194101"}
            </span>
          </div>

          <div className="contact-coord-item">
            <span className="contact-coord-label">STUDIO ENQUIRIES &amp; DISPATCH</span>
            <span className="contact-coord-value">
              {content.contactEmail || "hello@thetintedpass.com"}
            </span>
          </div>

          <div className="contact-coord-item">
            <span className="contact-coord-label">STUDIO DIRECT &amp; WHATSAPP</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
              <span className="contact-coord-value">
                {content.contactPhone || "+91 98765 43210"}
              </span>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-coord-wa-link"
                title="Direct chat on WhatsApp"
              >
                <WhatsAppIcon size={12} />
                <span>Chat</span>
              </a>
            </div>
          </div>

          <div className="contact-coord-item">
            <span className="contact-coord-label">CARTOGRAPHIC COORDINATES</span>
            <span className="contact-coord-value" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
              34°09′09″ N, 77°34′30″ E · 3,500M - 5,360M
            </span>
          </div>
        </div>

        {/* Mobile Coordinates List */}
        <div className="contact-coordinates-list animate-enter-3 contact-mobile-only">
          <div className="contact-coord-item">
            <span className="contact-coord-label">HERITAGE ATELIER PRECINCT</span>
            <span className="contact-coord-value">
              <MapPin size={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
              {content.contactAddress || "Old Town Heritage Precinct, Leh, Ladakh 194101"}
            </span>
          </div>

          <div className="contact-coord-item">
            <span className="contact-coord-label">STUDIO ENQUIRIES &amp; DISPATCH</span>
            <a
              href={`mailto:${contactEmail}`}
              className="contact-coord-value contact-link-clickable"
            >
              <Mail size={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
              {contactEmail}
            </a>
          </div>

          <div className="contact-coord-item">
            <span className="contact-coord-label">STUDIO DIRECT &amp; WHATSAPP</span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px", flexWrap: "wrap" }}>
              <a
                href={`tel:${cleanPhone}`}
                className="contact-coord-value contact-link-clickable"
              >
                <Phone size={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
                {contactPhone}
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-coord-wa-link"
                title="Direct chat on WhatsApp"
              >
                <WhatsAppIcon size={12} />
                <span>Chat</span>
              </a>
            </div>
          </div>

          <div className="contact-coord-item">
            <span className="contact-coord-label">CARTOGRAPHIC COORDINATES</span>
            <span className="contact-coord-value" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
              <Compass size={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
              34°09′09″ N, 77°34′30″ E · 3,500M - 5,360M
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Clean White Card with Get In Touch Form */}
      <div className="contact-right-panel animate-enter-3">
        <div className="contact-panel-header">
          <h2 className="contact-form-title">GET IN TOUCH</h2>
          <span className="contact-form-subtitle">Atelier Season 2026</span>
        </div>

        {submitted ? (
          <div className="contact-success-state" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
            <CheckCircle2 size={42} color="#10b981" style={{ marginBottom: "12px" }} />
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "18px", color: "#0f172a", marginBottom: "8px" }}>
              Enquiry Transmitted to the Atelier
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: "#475569", maxWidth: "380px", lineHeight: 1.5 }}>
              Thank you, {formData.name}. Our studio director will review your details and reply shortly with private cohort information.
            </p>
            <button
              type="button"
              className="journey-dossier-btn"
              style={{ marginTop: "16px" }}
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", phone: "", country: "", message: "" });
              }}
            >
              Submit Another Enquiry
            </button>
          </div>
        ) : (
          <form className="contact-form-grid" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <input
                type="text"
                placeholder="Full Name *"
                required
                className="contact-input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email Address *"
                required
                className="contact-input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="contact-form-row">
              <input
                type="tel"
                placeholder="Phone / WhatsApp Number"
                className="contact-input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <select
                className="contact-select-field"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              >
                <option value="">Select Country of Residence</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Tell us what draws you to Ladakh or any specific questions..."
              className="contact-textarea-field"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />

            <div className="contact-action-row">
              <button
                type="submit"
                disabled={submitting}
                className="contact-submit-btn"
              >
                {submitting ? "Transmitting..." : "SEND ENQUIRY  ↗"}
              </button>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-whatsapp-btn"
                title="Direct chat on WhatsApp"
              >
                <WhatsAppIcon size={16} />
                <span>CHAT ON WHATSAPP</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
