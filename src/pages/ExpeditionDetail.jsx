import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import SolidPlaceholder from "../components/SolidPlaceholder";
import useScrollEdgeFade from "../hooks/useScrollEdgeFade";
import useTouchSwipe from "../hooks/useTouchSwipe";

export default function ExpeditionDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { content } = useSiteContent();
  const expeditions = content.expeditions || [];

  // Match by slug or id
  const expedition =
    expeditions.find(
      (e) =>
        e.slug === slug ||
        e.id === slug ||
        slug?.includes(e.slug) ||
        e.slug?.includes(slug)
    ) || expeditions[1] || expeditions[0];

  const days = expedition?.days || [];
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Smooth entrance & exit transition state
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isSwitchingDay, setIsSwitchingDay] = useState(false);

  // Progressive disclosure states: collapsed initially on mobile as requested by Apple design guidelines
  const [showChronicler, setShowChronicler] = useState(false);
  const [showArtExercise, setShowArtExercise] = useState(false);

  const pillRefs = useRef([]);
  const mobilePillRefs = useRef([]);
  const navStripRef = useRef(null);
  const mobileNavStripRef = useRef(null);

  // Reusable horizontal edge fade with auto-centering
  useScrollEdgeFade({
    externalRef: mobileNavStripRef,
    activeKey: selectedDayIdx,
    activeSelector: ".dossier-mobile-day-pill.active",
  });

  useScrollEdgeFade({
    externalRef: navStripRef,
    activeKey: selectedDayIdx,
    activeSelector: ".expedition-day-pill.active",
  });

  // Fluid touch swipe between itinerary days on mobile
  const { swipeHandlers: dayCardSwipeHandlers } = useTouchSwipe({
    onSwipeLeft: () => handleSelectDay(selectedDayIdx + 1),
    onSwipeRight: () => handleSelectDay(selectedDayIdx - 1),
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const currentDay = days[selectedDayIdx] || days[0] || {
    day: 1,
    place: "Leh Arrival",
    altitude: "3,524 m",
    travelerLink: "Your own first impression",
    artExercise: "Altitude rest and introductory journal notes.",
    kind: "Acclimatisation & Rest",
    region: "Central Ladakh"
  };

  const travelerDisplayText =
    currentDay.travelerLink && currentDay.travelerLink !== "-"
      ? `Following the traces of ${currentDay.travelerLink} across this Himalayan passage.`
      : "Arrival and acclimatisation day — recording your own first impressions and quiet sketchbook notes across the Leh valley.";

  // Smooth back transition back to the expedition view in Journey
  const handleBackToJourney = (e) => {
    if (e) e.preventDefault();
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      navigate(`/journey?view=detail&exp=${expedition.id}`);
    }, 180);
  };

  // Smooth day crossfade transition with local strip scroll (zero window scroll shift)
  const handleSelectDay = (idx) => {
    if (idx < 0 || idx >= days.length) return;
    if (idx === selectedDayIdx || isSwitchingDay) return;
    setIsSwitchingDay(true);

    setTimeout(() => {
      setSelectedDayIdx(idx);

      // Desktop strip auto-center
      const strip = navStripRef.current;
      const pill = pillRefs.current[idx];
      if (strip && pill) {
        const pillLeft = pill.offsetLeft;
        const pillWidth = pill.offsetWidth;
        const stripWidth = strip.clientWidth;
        strip.scrollTo({
          left: pillLeft - stripWidth / 2 + pillWidth / 2,
          behavior: "smooth"
        });
      }

      // Mobile strip auto-center
      const mStrip = mobileNavStripRef.current;
      const mPill = mobilePillRefs.current[idx];
      if (mStrip && mPill) {
        const pillLeft = mPill.offsetLeft;
        const pillWidth = mPill.offsetWidth;
        const stripWidth = mStrip.clientWidth;
        mStrip.scrollTo({
          left: pillLeft - stripWidth / 2 + pillWidth / 2,
          behavior: "smooth"
        });
      }

      // Guard against accidental horizontal window scroll
      if (typeof window !== "undefined" && (window.scrollX !== 0 || window.pageXOffset !== 0)) {
        window.scrollTo({ left: 0, top: window.scrollY });
      }

      setTimeout(() => {
        setIsSwitchingDay(false);
      }, 50);
    }, 120);
  };

  return (
    <div
      className={`expedition-dossier-container ${
        isEntering ? "is-entering" : ""
      } ${isExiting ? "is-exiting" : ""}`}
    >
      {/* =========================================================================
          DESKTOP VIEW (>= 1024px, Exact Approved Single-Viewport Side-by-Side Layout)
          ========================================================================= */}
      <div className="expedition-dossier-desktop-view expedition-dossier-desktop-only">
        {/* Expedition Header Strip */}
        <div className="expedition-dossier-header">
          <div className="expedition-dossier-title-group">
            <div className="expedition-dossier-eyebrow">FIELD EXPEDITION DOSSIER</div>
            <h1 className="expedition-dossier-title">{expedition.title}</h1>
            <span className="expedition-dossier-meta">
              {expedition.length} · Max {expedition.maxAltitude} · Cohort 6-10
            </span>
          </div>

          <a
            href={`/journey?view=detail&exp=${expedition.id}`}
            onClick={handleBackToJourney}
            className="expedition-back-btn"
            aria-label="Back to Journeys Overview"
          >
            ← Back to Journeys Overview
          </a>
        </div>

        {/* Main 2-Column Grid */}
        <div className={`expedition-dossier-grid ${isSwitchingDay ? "is-day-crossfading" : ""}`}>
          {/* Left Column: Visual Day Card */}
          <div className="expedition-dossier-left-card">
            <SolidPlaceholder slotId="journeyDetailCover" className="expedition-dossier-image-slot">
              <div className="expedition-dossier-badge-row">
                <span className="expedition-dossier-day-badge">
                  DAY 0{currentDay.day || selectedDayIdx + 1}
                </span>
                <span className="expedition-dossier-length-chip">{expedition.length}</span>
              </div>

              <div className="placeholder-footer-strip">
                <span className="placeholder-footer-left">{currentDay.place}</span>
                <span className="placeholder-footer-right">{currentDay.altitude}</span>
              </div>
            </SolidPlaceholder>
          </div>

          {/* Right Column: Interactive Day Selector & Dossier Day Details */}
          <div className="expedition-dossier-right-content">
            {/* Day Selector Strip with Chevrons */}
            <div className="expedition-day-nav-wrapper">
              <div className="expedition-day-nav-header">
                <span className="expedition-day-nav-label">
                  ITINERARY DAY SELECTION · DAY {selectedDayIdx + 1} OF {days.length}
                </span>
                <div className="expedition-day-arrows">
                  <button
                    type="button"
                    className="expedition-nav-arrow-btn"
                    onClick={() => handleSelectDay(Math.max(0, selectedDayIdx - 1))}
                    disabled={selectedDayIdx === 0}
                    aria-label="Previous Day"
                    title="Previous Day"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="expedition-nav-arrow-btn"
                    onClick={() => handleSelectDay(Math.min(days.length - 1, selectedDayIdx + 1))}
                    disabled={selectedDayIdx === days.length - 1}
                    aria-label="Next Day"
                    title="Next Day"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div ref={navStripRef} className="expedition-days-nav-strip scroll-edge-fade" role="tablist" aria-label="Itinerary Days">
                {days.map((d, idx) => (
                  <button
                    key={idx}
                    ref={(el) => (pillRefs.current[idx] = el)}
                    type="button"
                    className={`expedition-day-pill ${idx === selectedDayIdx ? "active" : ""}`}
                    onClick={() => handleSelectDay(idx)}
                    role="tab"
                    aria-selected={idx === selectedDayIdx}
                  >
                    Day {d.day || idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Details Pane */}
            <div className="expedition-day-details-pane">
              <div className="expedition-day-intro-block">
                <h2 className="expedition-day-title">
                  Day {currentDay.day || selectedDayIdx + 1}: {currentDay.place}
                </h2>
                <div className="expedition-day-meta-row">
                  <span className="expedition-meta-chip">Elevation: {currentDay.altitude}</span>
                  {currentDay.region && <span className="expedition-meta-chip">Region: {currentDay.region}</span>}
                  {currentDay.kind && <span className="expedition-meta-chip">Focus: {currentDay.kind}</span>}
                </div>
              </div>

              {/* Historic Chronicler Reference */}
              <div className="expedition-disclosure-card">
                <button
                  type="button"
                  className="expedition-disclosure-header"
                  onClick={() => setShowChronicler(!showChronicler)}
                  aria-expanded={showChronicler}
                >
                  <span className="expedition-disclosure-title">
                    🏛 HISTORIC CHRONICLER REFERENCE
                  </span>
                  <span className="disclosure-toggle-icon" aria-hidden="true">
                    {showChronicler ? "−" : "+"}
                  </span>
                </button>
                {showChronicler && (
                  <div className="expedition-disclosure-body">
                    <p className="expedition-chronicler-quote">
                      {travelerDisplayText}
                    </p>
                  </div>
                )}
              </div>

              {/* Studio & Art Exercise */}
              {currentDay.artExercise && (
                <div className="expedition-disclosure-card art-exercise-card">
                  <button
                    type="button"
                    className="expedition-disclosure-header"
                    onClick={() => setShowArtExercise(!showArtExercise)}
                    aria-expanded={showArtExercise}
                  >
                    <span className="expedition-disclosure-title">
                      🎨 STUDIO &amp; ART EXERCISE
                    </span>
                    <span className="disclosure-toggle-icon" aria-hidden="true">
                      {showArtExercise ? "−" : "+"}
                    </span>
                  </button>
                  {showArtExercise && (
                    <div className="expedition-disclosure-body">
                      <p className="expedition-day-art-desc">{currentDay.artExercise}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Row */}
            <div className="expedition-enquire-btn-row">
              <Link to="/contact" className="journey-dossier-btn">
                <span>REQUEST FULL DOSSIER &amp; RESERVE PASS</span>
                <span className="btn-icon" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (< 1024px, Dedicated Apple-Inspired Vertical Itinerary Flow)
          ========================================================================= */}
      <div className={`expedition-dossier-mobile-view expedition-dossier-mobile-only ${isSwitchingDay ? "is-day-crossfading" : ""}`}>
        {/* A. Mobile Dossier Header */}
        <div className="dossier-mobile-header-card animate-enter-1">
          <div className="dossier-mobile-back-wrap">
            <button
              type="button"
              className="dossier-mobile-back-btn"
              onClick={handleBackToJourney}
              aria-label="Back to Journeys Overview"
            >
              <span className="back-arrow" aria-hidden="true">←</span>
              <span>Back to Journeys Overview</span>
            </button>
          </div>

          <div className="dossier-mobile-eyebrow">FIELD EXPEDITION DOSSIER</div>
          <h1 className="dossier-mobile-title">{expedition.title}</h1>

          {/* Compact Metadata Chips */}
          <div className="dossier-mobile-meta-chips">
            <span className="dossier-meta-chip">
              <span className="chip-symbol" aria-hidden="true">⏱</span>
              {expedition.length}
            </span>
            <span className="dossier-meta-chip">
              <span className="chip-symbol" aria-hidden="true">▲</span>
              Max {expedition.maxAltitude}
            </span>
            <span className="dossier-meta-chip">
              <span className="chip-symbol" aria-hidden="true">👥</span>
              Cohort 6–10
            </span>
          </div>
        </div>

        {/* B. Horizontally Scrollable Day Selection Strip */}
        <div className="dossier-mobile-day-selector animate-enter-2">
          <div className="dossier-mobile-selector-header">
            <span className="selector-caption">
              ITINERARY SCHEDULE · DAY {selectedDayIdx + 1} OF {days.length}
            </span>
            <div className="selector-chevron-controls">
              <button
                type="button"
                className="dossier-chevron-btn"
                onClick={() => handleSelectDay(selectedDayIdx - 1)}
                disabled={selectedDayIdx === 0}
                aria-label="Previous Itinerary Day"
              >
                ‹
              </button>
              <button
                type="button"
                className="dossier-chevron-btn"
                onClick={() => handleSelectDay(selectedDayIdx + 1)}
                disabled={selectedDayIdx === days.length - 1}
                aria-label="Next Itinerary Day"
              >
                ›
              </button>
            </div>
          </div>

          <div
            ref={mobileNavStripRef}
            className="dossier-mobile-pills-strip scroll-edge-fade"
            role="tablist"
            aria-label="Itinerary Day Selector"
          >
            {days.map((d, idx) => {
              const dayNum = d.day || idx + 1;
              const isSelected = idx === selectedDayIdx;
              const dayPillLabel = `Day ${dayNum < 10 ? `0${dayNum}` : dayNum}`;

              return (
                <button
                  key={idx}
                  ref={(el) => (mobilePillRefs.current[idx] = el)}
                  type="button"
                  className={`dossier-mobile-day-pill ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectDay(idx)}
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={dayPillLabel}
                >
                  {dayPillLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* C. Daily Information Primary Card with Horizontal Swipe */}
        <div className="dossier-mobile-day-card animate-enter-2" {...dayCardSwipeHandlers}>
          {/* Day Headline & Metadata */}
          <div className="dossier-mobile-day-header">
            <div className="dossier-mobile-day-tag">
              DAY 0{currentDay.day || selectedDayIdx + 1}
            </div>
            <h2 className="dossier-mobile-day-place">{currentDay.place}</h2>

            <div className="dossier-mobile-day-chips-row">
              <span className="day-meta-tag altitude-tag">
                <span className="tag-icon" aria-hidden="true">▲</span>
                {currentDay.altitude}
              </span>
              {currentDay.region && (
                <span className="day-meta-tag region-tag">
                  <span className="tag-icon" aria-hidden="true">📍</span>
                  {currentDay.region}
                </span>
              )}
              {currentDay.kind && (
                <span className="day-meta-tag focus-tag">
                  <span className="tag-icon" aria-hidden="true">🎨</span>
                  {currentDay.kind}
                </span>
              )}
            </div>
          </div>

          {/* Integrated 16:9 Visual Placeholder */}
          <div className="dossier-mobile-media-slot">
            <SolidPlaceholder slotId="journeyDetailCover" className="dossier-mobile-day-visual">
              <div className="dossier-mobile-visual-footer">
                <span className="footer-place">{currentDay.place}</span>
                <span className="footer-elevation">{currentDay.altitude}</span>
              </div>
            </SolidPlaceholder>
          </div>

          {/* D. Progressive Disclosure Accordions */}
          <div className="dossier-mobile-disclosures-wrap">
            {/* Accordion 1: Historic Chronicler Reference */}
            <div className="dossier-mobile-accordion">
              <button
                type="button"
                className={`dossier-accordion-header ${showChronicler ? "is-expanded" : ""}`}
                onClick={() => setShowChronicler(!showChronicler)}
                aria-expanded={showChronicler}
              >
                <div className="accordion-header-text">
                  <span className="accordion-primary-title">🏛 Historic Chronicler Reference</span>
                  <span className="accordion-hint-text">
                    {showChronicler ? "Tap to collapse historical notes" : "Explore historical references and field notes."}
                  </span>
                </div>
                <span className="accordion-action-badge">
                  {showChronicler ? "Collapse ↑" : "Expand ↓"}
                </span>
              </button>

              {showChronicler && (
                <div className="dossier-accordion-body">
                  <p className="dossier-chronicler-text">
                    {travelerDisplayText}
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Studio & Art Exercise */}
            {currentDay.artExercise && (
              <div className="dossier-mobile-accordion art-accordion">
                <button
                  type="button"
                  className={`dossier-accordion-header ${showArtExercise ? "is-expanded" : ""}`}
                  onClick={() => setShowArtExercise(!showArtExercise)}
                  aria-expanded={showArtExercise}
                >
                  <div className="accordion-header-text">
                    <span className="accordion-primary-title">🎨 Studio &amp; Art Exercise</span>
                    <span className="accordion-hint-text">
                      {showArtExercise ? "Tap to collapse exercise notes" : "Discover today's creative assignment."}
                    </span>
                  </div>
                  <span className="accordion-action-badge">
                    {showArtExercise ? "Collapse ↑" : "Expand ↓"}
                  </span>
                </button>

                {showArtExercise && (
                  <div className="dossier-accordion-body">
                    <p className="dossier-art-desc">{currentDay.artExercise}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* E. One-Handed Day Navigation Controls */}
          <div className="dossier-mobile-day-nav-buttons">
            <button
              type="button"
              className="dossier-step-btn prev-btn"
              onClick={() => handleSelectDay(selectedDayIdx - 1)}
              disabled={selectedDayIdx === 0}
              aria-label="Previous Itinerary Day"
            >
              <span className="nav-arrow" aria-hidden="true">←</span>
              <span>Previous Day</span>
            </button>

            <button
              type="button"
              className="dossier-step-btn next-btn"
              onClick={() => handleSelectDay(selectedDayIdx + 1)}
              disabled={selectedDayIdx === days.length - 1}
              aria-label="Next Itinerary Day"
            >
              <span>Next Day</span>
              <span className="nav-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* F. Primary Reservation Action Card */}
        <div className="dossier-mobile-reserve-card animate-enter-3">
          <Link to="/contact" className="dossier-mobile-reserve-btn">
            <span>REQUEST FULL DOSSIER &amp; RESERVE PASS</span>
            <span className="reserve-arrow" aria-hidden="true">→</span>
          </Link>
          <span className="dossier-mobile-reserve-caption">
            Limited atelier cohorts · 6 to 10 artists per expedition
          </span>
        </div>
      </div>
    </div>
  );
}
