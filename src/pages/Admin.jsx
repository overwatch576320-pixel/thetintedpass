import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Unlock,
  Save,
  CheckCircle2,
  Trash2,
  LogOut,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  FileText,
  Compass,
  Inbox,
  BookOpen
} from "lucide-react";
import { useSiteContent } from "../context/SiteContentContext";
import { defaultAssetConfig } from "../data/assets";
import SketchbookAdmin from "../components/admin/SketchbookAdmin";

export default function Admin() {
  const {
    content,
    enquiries,
    updateContentItem,
    updateAsset,
    resetAsset,
    updateFullContent,
    resetContent,
    updateEnquiryStatus,
    deleteEnquiry
  } = useSiteContent();

  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem("tp_admin_auth") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState("assets");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Local state for editable text settings
  const [settings, setSettings] = useState({
    seasonalLabel: content.seasonalLabel || "ATELIER SEASON 2026",
    geoStrip: content.geoStrip || "LADAKH, TRANS-HIMALAYAS · 34°09′09″ N, 77°34′30″ E · 3,500M - 5,360M",
    heroHeading: content.heroHeading || "Beyond Generic Sightseeing",
    heroParagraph: content.heroParagraph || "",
    philosophyHeadline: content.philosophyHeadline || "Art is the Antidote for Life",
    philosophyIntro: content.philosophyIntro || "",
    manifestoHeading: content.manifestoHeading || "THE MANIFESTO",
    manifestoBody: content.manifestoBody || "",
    journeyHeading: content.journeyHeading || "Four Trans-Himalayan Journeys-",
    journeyIntro: content.journeyIntro || "",
    exploreHeading: content.exploreHeading || "Topography of the Trans-Himalayas",
    exploreIntro: content.exploreIntro || "",
    artHeading: content.artHeading || "The Art of Seeing: Himalayan Studio Practice",
    artIntro: content.artIntro || "",
    contactHeading: content.contactHeading || "Begin Your Journey",
    contactIntro: content.contactIntro || "",
    contactEmail: content.contactEmail || "hello@thetintedpass.com",
    contactPhone: content.contactPhone || "+91 98765 43210",
    contactAddress: content.contactAddress || "Old Town Heritage Precinct, Leh, Ladakh 194101"
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    // Check credentials (supports studio key or atelier2026)
    const validKey = import.meta.env.VITE_ADMIN_KEY || "atelier2026";
    if (passcode.trim() === validKey || passcode.trim() === "atelier2026") {
      setAuthenticated(true);
      sessionStorage.setItem("tp_admin_auth", "true");
    } else {
      setAuthError("Invalid studio authentication key.");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem("tp_admin_auth");
  };

  const triggerNotice = (msg) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  const handleSaveSettings = () => {
    updateFullContent(settings);
    triggerNotice("Site content successfully updated and published.");
  };

  // Image Asset file upload handler
  const handleFileUpload = (slotId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      updateAsset(slotId, { src: dataUrl });
      triggerNotice(`Custom image assigned to slot: ${slotId}`);
    };
    reader.readAsDataURL(file);
  };

  if (!authenticated) {
    return (
      <div className="admin-viewport-wrapper" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "360px", background: "#131f33", border: "1px solid #1e293b", borderRadius: "14px", padding: "28px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Lock size={32} color="#7fe2ff" style={{ margin: "0 auto 10px auto" }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "#ffffff", letterSpacing: "0.08em" }}>
              THE TINTED PASS
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              Authorized Studio Administrator Authentication
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="password"
              placeholder="Studio Access Passkey"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              style={{
                background: "#0b1320",
                border: "1px solid #243550",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#ffffff",
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                outline: "none"
              }}
            />
            {authError && (
              <span style={{ color: "#ef4444", fontSize: "11px" }}>{authError}</span>
            )}
            <button
              type="submit"
              className="journey-dossier-btn"
              style={{ width: "100%", justifyContent: "center", borderRadius: "8px", padding: "10px" }}
            >
              Authenticate &amp; Open Studio
            </button>
          </form>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link to="/" style={{ color: "#7fe2ff", fontSize: "11px", textDecoration: "none" }}>
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentAssets = content.assets || defaultAssetConfig;

  return (
    <div className="admin-viewport-wrapper">
      {/* Top Bar */}
      <header className="admin-top-bar">
        <div className="admin-brand-title">
          <img src="/figma/tp-easel-white.png" alt="" style={{ height: "24px" }} />
          <span>THE TINTED PASS · ATELIER CMS</span>
        </div>

        <nav className="admin-nav-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "assets" ? "active" : ""}`}
            onClick={() => setActiveTab("assets")}
          >
            <ImageIcon size={14} style={{ display: "inline", marginRight: "6px" }} />
            Image Assets
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <FileText size={14} style={{ display: "inline", marginRight: "6px" }} />
            Headings &amp; Text
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "enquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("enquiries")}
          >
            <Inbox size={14} style={{ display: "inline", marginRight: "6px" }} />
            Enquiries ({enquiries.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "sketchbook" ? "active" : ""}`}
            onClick={() => setActiveTab("sketchbook")}
          >
            <BookOpen size={14} style={{ display: "inline", marginRight: "6px" }} />
            3D Sketchbook
          </button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/" target="_blank" style={{ color: "#7fe2ff", fontSize: "11.5px", textDecoration: "none" }}>
            View Live Site ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-tab-btn"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={14} style={{ display: "inline", marginRight: "4px" }} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {saveSuccessMsg && (
        <div style={{ background: "#10b981", color: "#ffffff", padding: "8px 24px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} />
          {saveSuccessMsg}
        </div>
      )}

      {/* Main Admin Workspace */}
      <div className="admin-workspace-scroll">
        {/* TAB 1: IMAGE ASSET CONFIGURATION & UPLOADS */}
        {activeTab === "assets" && (
          <div>
            <div className="admin-card-panel">
              <h2 className="admin-panel-title">
                Image Slots &amp; Solid-Colour Placeholders Manager
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "16px", lineHeight: 1.5 }}>
                Requirement 4 compliance: Strictly solid-colour placeholders are displayed across the website by default. When you are ready to insert original photographs, maps, or illustrations, upload them below to replace any placeholder while preserving exact dimensions and layout.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {Object.keys(currentAssets).map((slotId) => {
                  const slot = currentAssets[slotId];
                  const hasCustom = !!slot?.src;

                  return (
                    <div
                      key={slotId}
                      style={{
                        background: "#0b1320",
                        border: "1px solid #243550",
                        borderRadius: "10px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>
                          {slot?.title || slotId}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9.5px", color: "#7fe2ff" }}>
                          {slot?.page}
                        </span>
                      </div>

                      {/* Preview Box */}
                      <div
                        style={{
                          height: "120px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          background: slot?.placeholderColor || "#adefea",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative"
                        }}
                      >
                        {hasCustom ? (
                          <img
                            src={slot.src}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#1e293b", background: "rgba(255,255,255,0.7)", padding: "4px 8px", borderRadius: "4px" }}>
                            Solid Placeholder: {slot?.placeholderColor}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <label
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            color: "#ffffff",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            cursor: "pointer",
                            textAlign: "center",
                            flex: 1
                          }}
                        >
                          Upload Custom Image
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileUpload(slotId, e.target.files[0])}
                          />
                        </label>

                        {hasCustom && (
                          <button
                            type="button"
                            onClick={() => resetAsset(slotId)}
                            style={{
                              background: "#ef4444",
                              color: "#ffffff",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              cursor: "pointer"
                            }}
                            title="Revert to Solid Placeholder"
                          >
                            <RotateCcw size={12} style={{ display: "inline", marginRight: "4px" }} />
                            Revert
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEADINGS & CONTENT EDITOR */}
        {activeTab === "content" && (
          <div>
            <div className="admin-card-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 className="admin-panel-title" style={{ margin: 0 }}>
                  Website Headings &amp; Descriptive Content
                </h2>
                <button
                  type="button"
                  className="journey-dossier-btn"
                  onClick={handleSaveSettings}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Save size={14} />
                  Save &amp; Publish All Changes
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Seasonal Header Label
                  </label>
                  <input
                    type="text"
                    className="contact-input-field"
                    value={settings.seasonalLabel}
                    onChange={(e) => setSettings({ ...settings, seasonalLabel: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Bottom Geographical Information Strip
                  </label>
                  <input
                    type="text"
                    className="contact-input-field"
                    value={settings.geoStrip}
                    onChange={(e) => setSettings({ ...settings, geoStrip: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Page 01 — Home Main Heading
                  </label>
                  <input
                    type="text"
                    className="contact-input-field"
                    value={settings.heroHeading}
                    onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Page 01 — Home Paragraph Description
                  </label>
                  <textarea
                    className="contact-textarea-field"
                    style={{ height: "64px" }}
                    value={settings.heroParagraph}
                    onChange={(e) => setSettings({ ...settings, heroParagraph: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Page 02 — Philosophy Heading
                  </label>
                  <input
                    type="text"
                    className="contact-input-field"
                    value={settings.philosophyHeadline}
                    onChange={(e) => setSettings({ ...settings, philosophyHeadline: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Page 02 — Manifesto Header
                  </label>
                  <input
                    type="text"
                    className="contact-input-field"
                    value={settings.manifestoHeading}
                    onChange={(e) => setSettings({ ...settings, manifestoHeading: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Page 02 — The Manifesto Body Text
                  </label>
                  <textarea
                    className="contact-textarea-field"
                    style={{ height: "64px" }}
                    value={settings.manifestoBody}
                    onChange={(e) => setSettings({ ...settings, manifestoBody: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Page 03 — Journey Main Heading
                  </label>
                  <input
                    type="text"
                    className="contact-input-field"
                    value={settings.journeyHeading}
                    onChange={(e) => setSettings({ ...settings, journeyHeading: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Page 04 — Explore Ladakh Heading
                  </label>
                  <input
                    type="text"
                    className="contact-input-field"
                    value={settings.exploreHeading}
                    onChange={(e) => setSettings({ ...settings, exploreHeading: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ENQUIRIES MANAGER */}
        {activeTab === "enquiries" && (
          <div className="admin-card-panel">
            <h2 className="admin-panel-title">
              Atelier Enquiries Received ({enquiries.length})
            </h2>

            {enquiries.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "12px" }}>No enquiries received yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    style={{
                      background: "#0b1320",
                      border: "1px solid #243550",
                      borderRadius: "8px",
                      padding: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                          {enq.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "#7fe2ff" }}>
                          {enq.email} · {enq.phone}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontFamily: "var(--font-mono)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: enq.status === "new" ? "#3d30fa" : "#10b981",
                            color: "#ffffff"
                          }}
                        >
                          {enq.status}
                        </span>
                      </div>

                      <div style={{ fontSize: "12px", color: "#e2e8f0", margin: "4px 0" }}>
                        <strong>Expedition:</strong> {enq.expedition} · <strong>Season:</strong> {enq.travelPeriod} · <strong>Cohort:</strong> {enq.participants}
                      </div>

                      {enq.message && (
                        <p style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginTop: "4px" }}>
                          “{enq.message}”
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {enq.status === "new" && (
                        <button
                          type="button"
                          onClick={() => updateEnquiryStatus(enq.id, "contacted")}
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            cursor: "pointer"
                          }}
                        >
                          Mark Contacted
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteEnquiry(enq.id)}
                        style={{
                          background: "transparent",
                          color: "#ef4444",
                          border: "none",
                          cursor: "pointer"
                        }}
                        title="Delete Enquiry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 3D SKETCHBOOK FOLIO CMS */}
        {activeTab === "sketchbook" && (
          <SketchbookAdmin triggerNotice={triggerNotice} />
        )}
      </div>
    </div>
  );
}
