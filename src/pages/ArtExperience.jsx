import { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import SolidPlaceholder from "../components/SolidPlaceholder";
import HorizontalScrollStrip from "../components/HorizontalScrollStrip";
import useTouchSwipe from "../hooks/useTouchSwipe";

const practices = [
  {
    id: "pigments",
    num: "01",
    shortLabel: "01 Pigments",
    title: "Natural Mineral Pigments & Grinding",
    summary: "Lapis Lazuli, Malachite, Yellow Ochre, Slate & Cinnabar",
    desc: "Extract, grind, and mull pure raw minerals sourced from high Trans-Himalayan valleys with gum arabic and organic walnut oil binders on marble slabs.",
    badge: "ATELIER DISCIPLINE 01",
    supplies: "Porphyry muller, cold-pressed walnut oil, distilled snowmelt water, raw lapis and azurite rocks.",
    timing: "Morning studio hours (08:30 – 11:30) beside ancient apricot orchards in Alchi."
  },
  {
    id: "murals",
    num: "02",
    shortLabel: "02 Frescoes",
    title: "Monastic Fresco & Tempera Studies",
    summary: "11th-Century Kashmiri-Buddhist Wall Frescoes at Alchi & Basgo",
    desc: "Analytical drawing and tonal copies of 1,000-year-old mud-brick wall paintings. Examine miniature floral motifs, gold leaf embellishments and iconographic geometry.",
    badge: "ATELIER DISCIPLINE 02",
    supplies: "Handmade wasli rag paper, ox gall wetting agent, natural sable liners #00 through #2.",
    timing: "Quiet hours inside the Sumtsek three-tiered temple under monastic permission."
  },
  {
    id: "plein-air",
    num: "03",
    shortLabel: "03 Plein Air",
    title: "Plein Air High-Altitude Gouache & Watercolor",
    summary: "Fast-Drying Atmosphere Studies on Granite Passes & Dunes",
    desc: "Learn to handle rapidly evaporating washes in thin, arid mountain air. Capture shifting shadow angles across cold-desert sand dunes and glacier crests.",
    badge: "ATELIER DISCIPLINE 03",
    supplies: "Plein-air lightweight pochade box, 300gsm cold-pressed cotton paper blocks, portable ceramic wash wells.",
    timing: "Late afternoon light (16:00 – 18:30) over the Hunder sand dunes and Khardung La crest."
  },
  {
    id: "journal",
    num: "04",
    shortLabel: "04 Journals",
    title: "Handbound Expedition Journals & Cartography",
    summary: "The Art of Seeing: Bound Field Dossiers & Topographic Notes",
    desc: "Every cohort member binds their own field book in goat leather and archival cotton paper. Combine written impressions, pressed alpine flora, compass bearings and elevation sketches.",
    badge: "ATELIER DISCIPLINE 04",
    supplies: "Linen binding thread, bone folder, bookbinder's awl, sumi ink, vintage topographic grid stamps.",
    timing: "Evening salon readings and sketchbook reviews around the wood stove in Leh."
  }
];

export default function ArtExperience() {
  const { content } = useSiteContent();
  const [activePracticeId, setActivePracticeId] = useState("pigments");
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const currentPractice = practices.find((p) => p.id === activePracticeId) || practices[0];
  const currentIdx = practices.findIndex((p) => p.id === activePracticeId);

  const handleNextPractice = () => {
    const nextIdx = (currentIdx + 1) % practices.length;
    setActivePracticeId(practices[nextIdx].id);
  };

  const handlePrevPractice = () => {
    const prevIdx = (currentIdx - 1 + practices.length) % practices.length;
    setActivePracticeId(practices[prevIdx].id);
  };

  // Fluid touch swipe between art practices on mobile
  const { swipeHandlers } = useTouchSwipe({
    onSwipeLeft: handleNextPractice,
    onSwipeRight: handlePrevPractice,
  });

  return (
    <div className="art-exp-container">
      {/* =========================================================================
          DESKTOP 2-COLUMN VIEW (Preserved for Desktop Single-Viewport Layout)
          ========================================================================= */}
      <div className="art-exp-desktop-only">
        <div className="art-exp-left-col">
          <div className="art-exp-eyebrow">STUDIO MENTORSHIP &amp; PRACTICE</div>
          <h1 className="art-exp-heading animate-enter-1">
            {content.artHeading || "The Art of Seeing: Himalayan Studio Practice"}
          </h1>
          <p className="art-exp-intro animate-enter-2">
            {content.artIntro ||
              "An expedition is not only a passage through landscapes. It is an opportunity to slow down, observe, interpret and create with mineral pigments and sable brushes."}
          </p>

          <div className="art-exp-discipline-list animate-enter-3" role="tablist" aria-label="Studio Practices">
            {practices.map((practice) => (
              <div
                key={practice.id}
                className={`art-exp-discipline-item ${practice.id === activePracticeId ? "active" : ""}`}
                onClick={() => setActivePracticeId(practice.id)}
                role="tab"
                tabIndex={0}
                aria-selected={practice.id === activePracticeId}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActivePracticeId(practice.id);
                }}
              >
                <div className="art-exp-discipline-title">
                  {practice.num} · {practice.title}
                </div>
                <div className="art-exp-discipline-desc">{practice.summary}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="art-exp-right-card animate-enter-3">
          <div key={currentPractice.id} className="discipline-crossfade" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <SolidPlaceholder
              slotId="artExperienceHero"
              className="art-exp-image-slot"
              badge={currentPractice.badge}
            />

            <div className="art-exp-card-body">
              <h2 className="art-exp-card-title">T  H  E    P  R  A  C  T  I  C  E</h2>
              <p className="art-exp-card-desc">{currentPractice.desc}</p>
              <p className="art-exp-card-desc" style={{ fontSize: "10.5px", color: "#64748b" }}>
                <strong>Materials:</strong> {currentPractice.supplies}
              </p>
              <p className="art-exp-card-desc" style={{ fontSize: "10.5px", color: "#64748b" }}>
                <strong>Session Rhythm:</strong> {currentPractice.timing}
              </p>

              <div className="art-exp-action-row">
                <Link to="/contact" className="journey-dossier-btn">
                  <span>RESERVE ATELIER PASS</span>
                  <span className="btn-icon" aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE-FIRST PROGRESSIVE DISCLOSURE ARCHITECTURE (<= 767px)
          ========================================================================= */}
      <div className="art-exp-mobile-only">
        {/* Mobile Header */}
        <div className="art-mobile-header">
          <div className="art-mobile-eyebrow">STUDIO DISCIPLINES</div>
          <h1 className="art-mobile-title">
            {content.artHeading || "The Art of Seeing: Himalayan Studio Practice"}
          </h1>
          <p className="art-mobile-intro">
            {content.artIntro ||
              "An expedition is an opportunity to slow down, observe, and create with hand-mull mineral pigments and sable brushes."}
          </p>
        </div>

        {/* 4 Selectable Discipline Chips / Segmented Control with Dynamic Edge Fade */}
        <HorizontalScrollStrip
          className="art-mobile-chips-row"
          role="tablist"
          aria-label="Atelier Disciplines"
          activeKey={activePracticeId}
        >
          {practices.map((practice) => (
            <button
              key={practice.id}
              type="button"
              className={`art-mobile-chip-btn ${practice.id === activePracticeId ? "active" : ""}`}
              onClick={() => {
                setActivePracticeId(practice.id);
                setShowMobileDetails(false);
              }}
              role="tab"
              aria-selected={practice.id === activePracticeId}
            >
              <span>{practice.shortLabel}</span>
            </button>
          ))}
        </HorizontalScrollStrip>

        {/* Active Discipline Card with Horizontal Touch Swipe */}
        <div className="art-mobile-card" {...swipeHandlers}>
          <SolidPlaceholder
            slotId="artExperienceHero"
            className="art-mobile-image-slot"
            badge={currentPractice.badge}
          />

          <div className="art-mobile-card-body">
            <div className="art-mobile-badge-row">
              <span className="art-mobile-badge">{currentPractice.badge}</span>
              <span className="art-mobile-stepper">{currentPractice.num} / 04</span>
            </div>

            <h2 className="art-mobile-card-title">{currentPractice.title}</h2>
            <p className="art-mobile-summary">{currentPractice.summary}</p>
            <p className="art-mobile-desc">{currentPractice.desc}</p>

            {/* Progressive Disclosure Section: Materials & Schedule */}
            <div className="art-mobile-accordion">
              <button
                type="button"
                className="art-mobile-accordion-toggle"
                onClick={() => setShowMobileDetails(!showMobileDetails)}
                aria-expanded={showMobileDetails}
              >
                <span>{showMobileDetails ? "Hide Materials & Studio Schedule" : "View Materials & Studio Schedule"}</span>
                <span className="toggle-chevron" aria-hidden="true">{showMobileDetails ? "↑" : "↓"}</span>
              </button>

              {showMobileDetails && (
                <div className="art-mobile-drawer-content">
                  <div className="art-drawer-item">
                    <span className="art-drawer-label">✦ MATERIALS &amp; STUDIO KIT</span>
                    <p className="art-drawer-text">{currentPractice.supplies}</p>
                  </div>

                  <div className="art-drawer-item" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                    <span className="art-drawer-label">✦ SESSION RHYTHM &amp; TIMING</span>
                    <p className="art-drawer-text">{currentPractice.timing}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Reservation CTA */}
            <div className="art-mobile-action-row">
              <Link to="/contact" className="art-mobile-reserve-btn">
                <span>RESERVE ATELIER PASS</span>
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
