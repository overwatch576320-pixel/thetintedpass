import { useState, useRef } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useSiteContent } from "../../context/SiteContentContext";
import { defaultSketchbookConfig } from "../../data/defaultSketchbook";
import Sketchbook from "../sketchbook/Sketchbook";

const TEMPLATE_OPTIONS = [
  { id: "full_artwork", label: "Full-Page Artwork", desc: "Large visual study with archival caption" },
  { id: "photo_field_notes", label: "Photo & Field Notes", desc: "Photograph paired with observational memo" },
  { id: "sketch_annotation", label: "Sketch & Annotation", desc: "Drawing with callout pins and labels" },
  { id: "two_image_spread", label: "Two-Image Spread", desc: "Dual comparative photographs or studies" },
  { id: "map_route", label: "Map & Route Study", desc: "Topographic excerpt with waypoints & altitude" },
  { id: "material_study", label: "Material Study", desc: "Mineral pigment swatches and mulling notes" },
  { id: "editorial", label: "Editorial Folio", desc: "Chapter heading, pull quote, paragraph and study" },
];

export default function SketchbookAdmin({ triggerNotice }) {
  const { content, updateSketchbookSettings, updateSketchbookPages, saveSketchbook } =
    useSiteContent();

  const sketchbook = content.sketchbook || defaultSketchbookConfig;
  const pages = sketchbook.pages || [];

  const [activeSubTab, setActiveSubTab] = useState("pages"); // "pages" | "settings" | "backup"
  const [editingPage, setEditingPage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState(null);

  const fileInputRef = useRef(null);
  const secondaryFileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const jsonImportRef = useRef(null);

  // Settings local draft
  const [bookSettings, setBookSettings] = useState({
    enabled: sketchbook.enabled !== false,
    sectionEyebrow: sketchbook.sectionEyebrow || "FIELD NOTES FROM THE HIMALAYAS",
    sectionHeading: sketchbook.sectionHeading || "A Journal of Seeing",
    sectionIntro:
      sketchbook.sectionIntro ||
      "An interactive, tactile record of field sketches, mineral pigment washes, and high-altitude observations made along the passes.",
    bookTitle: sketchbook.bookTitle || "LADAKH EXPEDITION JOURNAL",
    bookSubtitle:
      sketchbook.bookSubtitle || "High-Altitude Plein Air Studies & Monastic Pigments",
    coverEyebrow: sketchbook.coverEyebrow || "TRANS-HIMALAYAN ATELIER · 2026",
    coverColor: sketchbook.coverColor || "#1a2522",
    coverImage: sketchbook.coverImage || null,
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSketchbookSettings(bookSettings);
    triggerNotice("Sketchbook settings updated and saved.");
  };

  // --- Page Operations ---
  const handleAddNewPage = (atIndex = null) => {
    const newPage = {
      id: "page-" + Date.now(),
      template: "full_artwork",
      title: "New Field Study",
      location: "Ladakh, Trans-Himalayas",
      date: "Atelier 2026",
      image: "/editorial/artidote-editorial.jpg",
      caption: "Natural mineral pigment wash on cotton rag.",
      description: "Field notes and observations recorded during the atelier.",
      published: true,
      annotations: [
        { text: "Mineral wash", x: "20%", y: "30%" },
        { text: "Lapis outline", x: "45%", y: "55%" },
      ],
      swatches: [
        { name: "Lapis Lazuli", color: "#1e3a8a", code: "Badakhshan" },
        { name: "Malachite", color: "#065f46", code: "Copper Vein" },
        { name: "Cinnabar", color: "#991b1b", code: "Cleft Red" },
        { name: "Apricot", color: "#c2410c", code: "Clay Wash" },
      ],
    };

    let updated;
    if (atIndex !== null && atIndex >= 0) {
      updated = [...pages];
      updated.splice(atIndex, 0, newPage);
    } else {
      updated = [...pages, newPage];
    }
    updateSketchbookPages(updated);
    setEditingPage(newPage);
    triggerNotice("New page created. Edit details below.");
  };

  const handleDeletePage = (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    const updated = pages.filter((p) => p.id !== id);
    updateSketchbookPages(updated);
    if (editingPage?.id === id) setEditingPage(null);
    triggerNotice("Page deleted.");
  };

  const handleDuplicatePage = (pageToDup) => {
    const idx = pages.findIndex((p) => p.id === pageToDup.id);
    const duplicated = {
      ...pageToDup,
      id: "page-" + Date.now(),
      title: `${pageToDup.title} (Copy)`,
    };
    const updated = [...pages];
    updated.splice(idx + 1, 0, duplicated);
    updateSketchbookPages(updated);
    triggerNotice("Page duplicated.");
  };

  const handleMovePage = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= pages.length) return;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateSketchbookPages(updated);
  };

  const handleTogglePublished = (id) => {
    const updated = pages.map((p) =>
      p.id === id ? { ...p, published: !p.published } : p
    );
    updateSketchbookPages(updated);
    if (editingPage?.id === id) {
      setEditingPage((prev) => ({ ...prev, published: !prev.published }));
    }
    triggerNotice("Page publication status toggled.");
  };

  const handleSavePageEdit = (e) => {
    e.preventDefault();
    if (!editingPage) return;
    const updated = pages.map((p) => (p.id === editingPage.id ? editingPage : p));
    updateSketchbookPages(updated);
    triggerNotice(`Saved: ${editingPage.title}`);
    setEditingPage(null);
  };

  // Image file uploads
  const handleImageUpload = (file, isSecondary = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (isSecondary) {
        setEditingPage((prev) => ({ ...prev, secondaryImage: dataUrl }));
      } else {
        setEditingPage((prev) => ({ ...prev, image: dataUrl }));
      }
      triggerNotice("Image loaded successfully.");
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setBookSettings((prev) => ({ ...prev, coverImage: dataUrl }));
      triggerNotice("Cover image loaded. Click 'Save Settings' to apply.");
    };
    reader.readAsDataURL(file);
  };

  // Export / Import JSON
  const handleExportJSON = () => {
    const exportData = {
      ...sketchbook,
      ...bookSettings,
      pages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-tinted-pass-sketchbook-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice("Sketchbook backup JSON exported.");
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.pages && Array.isArray(parsed.pages)) {
          saveSketchbook(parsed);
          setBookSettings({
            enabled: parsed.enabled !== false,
            sectionEyebrow: parsed.sectionEyebrow || "FIELD NOTES FROM THE HIMALAYAS",
            sectionHeading: parsed.sectionHeading || "A Journal of Seeing",
            sectionIntro: parsed.sectionIntro || "",
            bookTitle: parsed.bookTitle || "LADAKH EXPEDITION JOURNAL",
            bookSubtitle: parsed.bookSubtitle || "",
            coverEyebrow: parsed.coverEyebrow || "TRANS-HIMALAYAN ATELIER · 2026",
            coverColor: parsed.coverColor || "#1a2522",
            coverImage: parsed.coverImage || null,
          });
          triggerNotice("Sketchbook successfully imported from backup file!");
        } else {
          alert("Invalid sketchbook JSON structure: missing 'pages' array.");
        }
      } catch (err) {
        alert("Failed to parse JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (
      !window.confirm(
        "Reset sketchbook to curated Trans-Himalayan default pages? Any custom edits will be replaced."
      )
    )
      return;
    saveSketchbook(defaultSketchbookConfig);
    setBookSettings({
      enabled: true,
      sectionEyebrow: defaultSketchbookConfig.sectionEyebrow,
      sectionHeading: defaultSketchbookConfig.sectionHeading,
      sectionIntro: defaultSketchbookConfig.sectionIntro,
      bookTitle: defaultSketchbookConfig.bookTitle,
      bookSubtitle: defaultSketchbookConfig.bookSubtitle,
      coverEyebrow: defaultSketchbookConfig.coverEyebrow,
      coverColor: defaultSketchbookConfig.coverColor,
      coverImage: defaultSketchbookConfig.coverImage,
    });
    triggerNotice("Sketchbook reset to curated Trans-Himalayan defaults.");
  };

  return (
    <div className="sketchbook-admin-container">
      {/* Subnav Header */}
      <div className="admin-subnav-bar">
        <div className="admin-subnav-left">
          <button
            type="button"
            className={`admin-subtab-btn ${activeSubTab === "pages" ? "active" : ""}`}
            onClick={() => setActiveSubTab("pages")}
          >
            <Layers size={13} style={{ marginRight: "6px" }} />
            Page Management ({pages.length})
          </button>
          <button
            type="button"
            className={`admin-subtab-btn ${activeSubTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveSubTab("settings")}
          >
            <Settings size={13} style={{ marginRight: "6px" }} />
            Book &amp; Section Settings
          </button>
          <button
            type="button"
            className={`admin-subtab-btn ${activeSubTab === "backup" ? "active" : ""}`}
            onClick={() => setActiveSubTab("backup")}
          >
            <Download size={13} style={{ marginRight: "6px" }} />
            Backup &amp; Migration
          </button>
        </div>

        <div className="admin-subnav-right">
          <button
            type="button"
            className="admin-preview-btn"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye size={13} style={{ marginRight: "6px" }} />
            Live 3D Book Preview
          </button>
          <button
            type="button"
            className="admin-action-pill-btn primary"
            onClick={() => handleAddNewPage()}
          >
            <Plus size={13} style={{ marginRight: "5px" }} />
            Add Page
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: PAGES MANAGEMENT --- */}
      {activeSubTab === "pages" && (
        <div className="admin-pages-view">
          <div className="admin-section-intro-card">
            <h3 className="admin-intro-h3">Interactive 3D Sketchbook Folio</h3>
            <p className="admin-intro-p">
              Manage physical book spreads, artwork, captions, and layout templates. Drag or move pages to reorder the public sequence.
            </p>
          </div>

          <div className="admin-pages-grid">
            {pages.map((p, idx) => (
              <div
                key={p.id || idx}
                className={`admin-page-card ${p.published === false ? "is-draft" : ""}`}
              >
                <div className="admin-card-top-row">
                  <span className="admin-page-seq-badge">P. {idx + 1}</span>
                  <span className="admin-page-spread-badge">
                    Spread {Math.floor(idx / 2) + 1} · {idx % 2 === 0 ? "Left" : "Right"}
                  </span>
                  {p.isBlank ? (
                    <span className="admin-page-blank-badge">Blank Folio</span>
                  ) : (
                    <span className="admin-page-template-badge">
                      {TEMPLATE_OPTIONS.find((t) => t.id === p.template)?.label || p.template}
                    </span>
                  )}
                  <button
                    type="button"
                    className={`admin-status-pill ${p.published !== false ? "published" : "draft"}`}
                    onClick={() => handleTogglePublished(p.id)}
                    title={p.published !== false ? "Published (click to draft)" : "Draft (click to publish)"}
                  >
                    {p.published !== false ? "Published" : "Draft"}
                  </button>
                </div>

                <div
                  className="admin-card-thumbnail"
                  onClick={() => setEditingPage({ ...p })}
                  role="button"
                  tabIndex={0}
                >
                  {p.isBlank ? (
                    <div className="admin-thumb-blank-paper">
                      <span>📄 Blank Cotton Paper</span>
                    </div>
                  ) : p.image ? (
                    <img src={p.image} alt="" />
                  ) : (
                    <div className="admin-thumb-placeholder">No Image Assigned</div>
                  )}
                </div>

                <div className="admin-card-meta">
                  <h4 className="admin-card-title">{p.title || `Page ${idx + 1}`}</h4>
                  <p className="admin-card-loc">
                    {p.location || "Ladakh"} · {p.date || "2026"}
                  </p>
                </div>

                <div className="admin-card-actions">
                  <button
                    type="button"
                    className="admin-icon-tool"
                    disabled={idx === 0}
                    onClick={() => handleMovePage(idx, -1)}
                    title="Move earlier"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-tool"
                    disabled={idx === pages.length - 1}
                    onClick={() => handleMovePage(idx, 1)}
                    title="Move later"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-tool"
                    onClick={() => handleDuplicatePage(p)}
                    title="Duplicate Page"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-tool edit"
                    onClick={() => setEditingPage({ ...p })}
                    title="Edit Page"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-icon-tool danger"
                    onClick={() => handleDeletePage(p.id)}
                    title="Delete Page"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Add Card */}
            <div
              className="admin-add-page-card"
              onClick={() => handleAddNewPage()}
              role="button"
              tabIndex={0}
            >
              <Plus size={24} color="#38bdf8" />
              <span>Add New Page</span>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: BOOK & SECTION SETTINGS --- */}
      {activeSubTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="admin-form-view">
          <div className="admin-form-section">
            <h4 className="admin-form-section-title">Homepage Section Visibility &amp; Text</h4>
            <div className="admin-form-row">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={bookSettings.enabled}
                  onChange={(e) =>
                    setBookSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                />
                <span>Display 3D Sketchbook Section on Homepage</span>
              </label>
            </div>

            <div className="admin-input-group">
              <label>Section Eyebrow Label</label>
              <input
                type="text"
                value={bookSettings.sectionEyebrow}
                onChange={(e) =>
                  setBookSettings((prev) => ({ ...prev, sectionEyebrow: e.target.value }))
                }
              />
            </div>

            <div className="admin-input-group">
              <label>Section Heading</label>
              <input
                type="text"
                value={bookSettings.sectionHeading}
                onChange={(e) =>
                  setBookSettings((prev) => ({ ...prev, sectionHeading: e.target.value }))
                }
              />
            </div>

            <div className="admin-input-group">
              <label>Section Introductory Narrative</label>
              <textarea
                rows={3}
                value={bookSettings.sectionIntro}
                onChange={(e) =>
                  setBookSettings((prev) => ({ ...prev, sectionIntro: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="admin-form-section">
            <h4 className="admin-form-section-title">Physical Book Cover Aesthetics</h4>

            <div className="admin-input-group">
              <label>Cover Eyebrow Text</label>
              <input
                type="text"
                value={bookSettings.coverEyebrow}
                onChange={(e) =>
                  setBookSettings((prev) => ({ ...prev, coverEyebrow: e.target.value }))
                }
              />
            </div>

            <div className="admin-input-group">
              <label>Cover Main Title</label>
              <input
                type="text"
                value={bookSettings.bookTitle}
                onChange={(e) =>
                  setBookSettings((prev) => ({ ...prev, bookTitle: e.target.value }))
                }
              />
            </div>

            <div className="admin-input-group">
              <label>Cover Subtitle</label>
              <input
                type="text"
                value={bookSettings.bookSubtitle}
                onChange={(e) =>
                  setBookSettings((prev) => ({ ...prev, bookSubtitle: e.target.value }))
                }
              />
            </div>

            <div className="admin-input-group">
              <label>Cover Tint / Base Color</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="color"
                  value={bookSettings.coverColor}
                  onChange={(e) =>
                    setBookSettings((prev) => ({ ...prev, coverColor: e.target.value }))
                  }
                  style={{ width: "44px", height: "36px", padding: "0", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={bookSettings.coverColor}
                  onChange={(e) =>
                    setBookSettings((prev) => ({ ...prev, coverColor: e.target.value }))
                  }
                  style={{ width: "120px" }}
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Custom Cover Artwork (Optional Centered Vignette / Monogram)</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={coverFileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className="admin-action-pill-btn"
                  onClick={() => coverFileInputRef.current?.click()}
                >
                  <Upload size={13} style={{ marginRight: "5px" }} />
                  Upload Cover Art
                </button>
                {bookSettings.coverImage && (
                  <button
                    type="button"
                    className="admin-action-pill-btn danger"
                    onClick={() => setBookSettings((prev) => ({ ...prev, coverImage: null }))}
                  >
                    Remove
                  </button>
                )}
              </div>
              {bookSettings.coverImage && (
                <div style={{ marginTop: "10px", width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden" }}>
                  <img src={bookSettings.coverImage} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button type="submit" className="admin-action-pill-btn primary">
              <CheckCircle2 size={14} style={{ marginRight: "6px" }} />
              Save Settings &amp; Publish
            </button>
          </div>
        </form>
      )}

      {/* --- SUBTAB 3: BACKUP & MIGRATION --- */}
      {activeSubTab === "backup" && (
        <div className="admin-backup-view">
          <div className="admin-form-section">
            <h4 className="admin-form-section-title">Portable JSON Backup &amp; Cross-Device Sync</h4>
            <p className="admin-intro-p">
              Export your entire sketchbook configuration, images, and page layouts as a single portable JSON file. You can restore or transfer it to another browser at any time.
            </p>

            <div style={{ display: "flex", gap: "14px", marginTop: "16px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="admin-action-pill-btn primary"
                onClick={handleExportJSON}
              >
                <Download size={14} style={{ marginRight: "6px" }} />
                Export Sketchbook JSON
              </button>

              <input
                type="file"
                accept="application/json"
                ref={jsonImportRef}
                style={{ display: "none" }}
                onChange={handleImportJSON}
              />
              <button
                type="button"
                className="admin-action-pill-btn"
                onClick={() => jsonImportRef.current?.click()}
              >
                <Upload size={14} style={{ marginRight: "6px" }} />
                Import Sketchbook JSON
              </button>

              <button
                type="button"
                className="admin-action-pill-btn danger"
                onClick={handleResetDefaults}
              >
                <RotateCcw size={14} style={{ marginRight: "6px" }} />
                Reset to Curated Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT PAGE DETAILS --- */}
      {editingPage && (
        <div className="admin-modal-overlay">
          <div className="admin-edit-modal">
            <div className="admin-modal-header">
              <h3>Edit Sketchbook Page</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditingPage(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePageEdit} className="admin-modal-body">
              {/* Publication Status & Template */}
              <div className="admin-modal-row-split">
                <div className="admin-input-group">
                  <label>Page Title</label>
                  <input
                    type="text"
                    value={editingPage.title || ""}
                    onChange={(e) =>
                      setEditingPage((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label>Status</label>
                  <select
                    value={editingPage.published !== false ? "published" : "draft"}
                    onChange={(e) =>
                      setEditingPage((prev) => ({
                        ...prev,
                        published: e.target.value === "published",
                      }))
                    }
                  >
                    <option value="published">Published (Visible in Book)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Template Chooser */}
              <div className="admin-input-group">
                <label>Page Layout Template</label>
                <select
                  value={editingPage.template || "full_artwork"}
                  onChange={(e) =>
                    setEditingPage((prev) => ({ ...prev, template: e.target.value }))
                  }
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} — {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Geographical & Expedition Metadata */}
              <div className="admin-modal-row-split">
                <div className="admin-input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editingPage.location || ""}
                    onChange={(e) =>
                      setEditingPage((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="e.g. Alchi Precinct, Sham Valley"
                  />
                </div>
                <div className="admin-input-group">
                  <label>Date / Reference</label>
                  <input
                    type="text"
                    value={editingPage.date || ""}
                    onChange={(e) =>
                      setEditingPage((prev) => ({ ...prev, date: e.target.value }))
                    }
                    placeholder="e.g. Day 04 · 3,120 m"
                  />
                </div>
              </div>

              {/* Folio Type: Artwork vs Blank Paper */}
              <div className="admin-input-group">
                <label>Folio Type (Double-Page Spread Alignment)</label>
                <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#f1f5f9" }}>
                    <input
                      type="radio"
                      name="pageType"
                      checked={!editingPage.isBlank}
                      onChange={() => setEditingPage((prev) => ({ ...prev, isBlank: false }))}
                    />
                    <span>Artwork / Field Sketch</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#f1f5f9" }}>
                    <input
                      type="radio"
                      name="pageType"
                      checked={!!editingPage.isBlank}
                      onChange={() => setEditingPage((prev) => ({ ...prev, isBlank: true }))}
                    />
                    <span>Blank Cotton Paper Folio</span>
                  </label>
                </div>
                {editingPage.isBlank && (
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>
                    Renders archival Himalayan cotton rag paper with subtle folio numbering, perfect for spacing double-page spreads.
                  </p>
                )}
              </div>

              {/* Main Image Upload & Preview (for Artwork Folios) */}
              {!editingPage.isBlank && (
                <div className="admin-input-group">
                  <label>Primary Image (JPG, PNG, WebP)</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={(e) => handleImageUpload(e.target.files?.[0], false)}
                    />
                    <button
                      type="button"
                      className="admin-action-pill-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={13} style={{ marginRight: "5px" }} />
                      Upload Image
                    </button>
                    <input
                      type="text"
                      placeholder="or enter image path / URL"
                      value={editingPage.image || ""}
                      onChange={(e) =>
                        setEditingPage((prev) => ({ ...prev, image: e.target.value }))
                      }
                      style={{ flex: 1 }}
                    />
                  </div>
                  {editingPage.image && (
                    <div className="admin-image-preview-box">
                      <img src={editingPage.image} alt="Preview" />
                    </div>
                  )}
                </div>
              )}

              {/* Secondary Image if Two-Image Spread */}
              {editingPage.template === "two_image_spread" && (
                <div className="admin-input-group">
                  <label>Secondary Image (for Two-Image Spread)</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      ref={secondaryFileInputRef}
                      style={{ display: "none" }}
                      onChange={(e) => handleImageUpload(e.target.files?.[0], true)}
                    />
                    <button
                      type="button"
                      className="admin-action-pill-btn"
                      onClick={() => secondaryFileInputRef.current?.click()}
                    >
                      <Upload size={13} style={{ marginRight: "5px" }} />
                      Upload Secondary Image
                    </button>
                    <input
                      type="text"
                      placeholder="or enter image path"
                      value={editingPage.secondaryImage || ""}
                      onChange={(e) =>
                        setEditingPage((prev) => ({ ...prev, secondaryImage: e.target.value }))
                      }
                      style={{ flex: 1 }}
                    />
                  </div>
                  {editingPage.secondaryImage && (
                    <div className="admin-image-preview-box">
                      <img src={editingPage.secondaryImage} alt="Secondary Preview" />
                    </div>
                  )}
                </div>
              )}

              {/* Short Caption */}
              <div className="admin-input-group">
                <label>Short Caption / Archival Memo</label>
                <input
                  type="text"
                  value={editingPage.caption || ""}
                  onChange={(e) =>
                    setEditingPage((prev) => ({ ...prev, caption: e.target.value }))
                  }
                  placeholder="e.g. Grated Badakhshan lapis lazuli wash on 300gsm rag."
                />
              </div>

              {/* Description / Field Notes */}
              <div className="admin-input-group">
                <label>Observation &amp; Field Notes Description</label>
                <textarea
                  rows={3}
                  value={editingPage.description || ""}
                  onChange={(e) =>
                    setEditingPage((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Detailed studio notes or field observations..."
                />
              </div>

              {/* Template Specific: Annotations list */}
              {editingPage.template === "sketch_annotation" && (
                <div className="admin-input-group">
                  <label>Callout Annotations (Pins on Artwork)</label>
                  {(editingPage.annotations || []).map((ann, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                      <input
                        type="text"
                        value={ann.text || ann}
                        onChange={(e) => {
                          const updated = [...(editingPage.annotations || [])];
                          updated[i] = { ...(updated[i] || {}), text: e.target.value };
                          setEditingPage((prev) => ({ ...prev, annotations: updated }));
                        }}
                        placeholder="Callout text"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="admin-icon-tool danger"
                        onClick={() => {
                          const updated = (editingPage.annotations || []).filter(
                            (_, idx) => idx !== i
                          );
                          setEditingPage((prev) => ({ ...prev, annotations: updated }));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="admin-action-pill-btn"
                    style={{ fontSize: "11px", marginTop: "4px" }}
                    onClick={() => {
                      const updated = [
                        ...(editingPage.annotations || []),
                        { text: "New Annotation", x: "30%", y: "40%" },
                      ];
                      setEditingPage((prev) => ({ ...prev, annotations: updated }));
                    }}
                  >
                    + Add Annotation Callout
                  </button>
                </div>
              )}

              {/* Template Specific: Pull Quote */}
              {editingPage.template === "editorial" && (
                <div className="admin-input-group">
                  <label>Editorial Pull Quote</label>
                  <input
                    type="text"
                    value={editingPage.pullQuote || ""}
                    onChange={(e) =>
                      setEditingPage((prev) => ({ ...prev, pullQuote: e.target.value }))
                    }
                    placeholder="“The Trans-Himalayas are an altar of timeless quietude...”"
                  />
                </div>
              )}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-action-pill-btn"
                  onClick={() => setEditingPage(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-pill-btn primary">
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIVE 3D PREVIEW MODAL --- */}
      {isPreviewOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-preview-modal-box">
            <div className="admin-modal-header">
              <h3>Live 3D Sketchbook Preview</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Close Preview
              </button>
            </div>
            <div className="admin-modal-preview-stage">
              <Sketchbook
                bookSettings={bookSettings}
                pages={pages.filter((p) => p.published !== false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
