import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import SolidPlaceholder from "../components/SolidPlaceholder";

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

  const pillRefs = useRef([]);
  const navStripRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const currentDay = days[selectedDayIdx] || days[0] || {
    day: 1,
    place: "Leh Arrival",
    altitude: "3,524 m",
    travelerLink: "Your own first impression",
    artExercise: "Altitude rest and introductory journal notes."
  };

  // Smooth back transition back to the expedition view in Journey
  const handleBackToJourney = (e) => {
    e.preventDefault();
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      navigate(`/journey?view=detail&exp=${expedition.id}`);
    }, 200);
  };

  // Smooth day crossfade transition
  const handleSelectDay = (idx) => {
    if (idx === selectedDayIdx || isSwitchingDay) return;
    setIsSwitchingDay(true);
    setTimeout(() => {
      setSelectedDayIdx(idx);
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
      if (typeof window !== "undefined" && (window.scrollX !== 0 || window.pageXOffset !== 0)) {
        window.scrollTo({ left: 0, top: window.scrollY });
      }
      setTimeout(() => {
        setIsSwitchingDay(false);
      }, 50);
    }, 140);
  };

  return (
    <div
      className={`expedition-dossier-container ${
        isEntering ? "is-entering" : ""
      } ${isExiting ? "is-exiting" : ""}`}
    >
      {/* Expedition Header Strip */}
      <div className="expedition-dossier-header">
        <div className="expedition-dossier-title-group">
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

      {/* Main Single-Viewport 2-Column Grid */}
      <div className={`expedition-dossier-grid ${isSwitchingDay ? "is-day-crossfading" : ""}`}>
        {/* Left Column: Visual Day Card */}
        <div className="expedition-dossier-left-card">
          <SolidPlaceholder
            slotId="journeyDetailCover"
            className="expedition-dossier-image-slot"
          >
            <div className="expedition-dossier-badge-row">
              <span className="expedition-dossier-day-badge">
                DAY 0{currentDay.day || selectedDayIdx + 1}
              </span>
              <span className="expedition-dossier-length-chip">
                {expedition.length}
              </span>
            </div>

            <div className="placeholder-footer-strip">
              <span className="placeholder-footer-left">
                {currentDay.place}
              </span>
              <span className="placeholder-footer-right">
                {currentDay.altitude}
              </span>
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
            <div
              ref={navStripRef}
              className="expedition-days-nav-strip"
              role="tablist"
              aria-label="Itinerary Days"
            >
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
            <div>
              <h2 className="expedition-day-title">
                Day {currentDay.day || selectedDayIdx + 1}: {currentDay.place}
              </h2>
              <div className="expedition-day-meta-row">
                <span>Altitude: {currentDay.altitude}</span>
                {currentDay.region && <span>Region: {currentDay.region}</span>}
                {currentDay.kind && <span>Focus: {currentDay.kind}</span>}
              </div>
            </div>

            {currentDay.travelerLink && currentDay.travelerLink !== "-" && (
              <div className="expedition-chronicler-block">
                <span className="expedition-chronicler-label">
                  HISTORIC CHRONICLER REFERENCE
                </span>
                <p className="expedition-chronicler-quote">
                  Following the traces of {currentDay.travelerLink}.
                </p>
              </div>
            )}

            <div className="expedition-day-art-box">
              <span className="expedition-day-art-label">STUDIO &amp; ART EXERCISE</span>
              <p className="expedition-day-art-desc">{currentDay.artExercise}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="expedition-enquire-btn-row">
            <Link
              to="/contact"
              className="journey-dossier-btn"
            >
              REQUEST FULL DOSSIER &amp; RESERVE PASS &nbsp;↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
