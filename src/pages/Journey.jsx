import { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import SolidPlaceholder from "../components/SolidPlaceholder";
import HorizontalScrollStrip from "../components/HorizontalScrollStrip";

const STATION_ALTITUDES = {
  "Leh": "3,524 m",
  "Alchi (Sham Valley)": "3,120 m",
  "Sham Valley (Alchi, Likir)": "3,120 m",
  "Sham Valley": "3,120 m",
  "Alchi Village": "3,120 m",
  "Alchi": "3,120 m",
  "Nubra Valley": "3,100 m",
  "Diskit & Hunder": "3,100 m",
  "Pangong Tso": "4,250 m",
  "Hanle": "4,500 m",
  "Tso Moriri": "4,530 m",
  "Tso Kar": "4,530 m",
  "Lamayuru": "3,510 m",
  "Nyoma": "4,180 m",
  "Chumathang": "4,050 m"
};

const EXPEDITION_ROUTES = {
  "itinerary-10-day": {
    path: "M 15 50 Q 45 60, 75 40 T 115 22 T 145 32",
    waypoints: [
      { x: 15, y: 50, label: "Leh" },
      { x: 75, y: 40, label: "Alchi" },
      { x: 115, y: 22, label: "Nubra" },
      { x: 145, y: 32, label: "Pangong" }
    ]
  },
  "itinerary-13-day": {
    path: "M 15 52 Q 45 62, 75 42 T 115 20 T 148 30",
    waypoints: [
      { x: 15, y: 52, label: "Leh" },
      { x: 75, y: 42, label: "Sham" },
      { x: 115, y: 20, label: "Nubra" },
      { x: 148, y: 30, label: "Pangong" }
    ]
  },
  "itinerary-14-day": {
    path: "M 15 48 Q 50 62, 85 45 T 120 26 T 148 48",
    waypoints: [
      { x: 15, y: 48, label: "Leh" },
      { x: 85, y: 45, label: "Alchi" },
      { x: 120, y: 26, label: "Pangong" },
      { x: 148, y: 48, label: "Nyoma" }
    ]
  },
  "itinerary-15-day": {
    path: "M 15 54 Q 45 32, 75 22 T 115 42 T 148 34",
    waypoints: [
      { x: 15, y: 54, label: "Leh" },
      { x: 75, y: 22, label: "Lamayuru" },
      { x: 115, y: 42, label: "Alchi" },
      { x: 148, y: 34, label: "Changthang" }
    ]
  }
};

export default function Journey() {
  const { content } = useSiteContent();
  const navigate = useNavigate();
  const expeditions = content.expeditions || [];
  const [searchParams, setSearchParams] = useSearchParams();

  const urlView = searchParams.get("view");
  const urlExp = searchParams.get("exp");

  // State: "overview" (4-card grid) | "detail" (selected journey inspector)
  const [viewMode, setViewMode] = useState(() => (urlView === "detail" ? "detail" : "overview"));
  // Transition orchestrator: "idle" | "exiting-overview" | "entering-detail" | "exiting-detail" | "entering-overview"
  const [transitionState, setTransitionState] = useState("idle");
  const [selectedExpId, setSelectedExpId] = useState(() => (urlExp || "itinerary-13-day"));
  const [clickedCardId, setClickedCardId] = useState(null);
  const [isCrossfadingExp, setIsCrossfadingExp] = useState(false);
  const [filterDuration, setFilterDuration] = useState("all");

  // Mobile detail progressive disclosure states
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [selectedStationIdx, setSelectedStationIdx] = useState(null);
  const [expandedHighlights, setExpandedHighlights] = useState({
    pleinAir: false,
    frescoes: false,
    lakes: false
  });

  const toggleHighlight = (key) => {
    setExpandedHighlights((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentExp = expeditions.find((e) => e.id === selectedExpId) || expeditions[1] || expeditions[0];
  const currentExpIndex = expeditions.findIndex((e) => e.id === currentExp?.id);
  const expNumberLabel = `Expedition 0${currentExpIndex >= 0 ? currentExpIndex + 1 : 2}`;

  const currentRoute = useMemo(() => {
    return EXPEDITION_ROUTES[currentExp?.id] || EXPEDITION_ROUTES["itinerary-13-day"];
  }, [currentExp?.id]);

  // Handle clicking a card in the overview -> smooth transition into detail view
  const handleSelectExpedition = (expId) => {
    if (transitionState !== "idle") return;
    setClickedCardId(expId);
    setTransitionState("exiting-overview");

    setTimeout(() => {
      setSelectedExpId(expId);
      setViewMode("detail");
      setSearchParams({ view: "detail", exp: expId });
      setTransitionState("entering-detail");

      setTimeout(() => {
        setTransitionState("idle");
        setClickedCardId(null);
      }, 420);
    }, 220);
  };

  // Mobile card select handler
  const handleSelectCard = (exp) => {
    handleSelectExpedition(exp.id);
  };

  // Handle opening full dossier page -> smooth transition
  const handleOpenDossier = (e, slug) => {
    e.preventDefault();
    if (transitionState !== "idle") return;
    setTransitionState("exiting-detail");
    setTimeout(() => {
      navigate(`/journey/${slug}`);
    }, 200);
  };

  // Handle back to overview button -> smooth transition back to 4 cards
  const handleBackToOverview = () => {
    if (transitionState !== "idle") return;
    setTransitionState("exiting-detail");

    setTimeout(() => {
      setViewMode("overview");
      setSearchParams({});
      setTransitionState("entering-overview");

      setTimeout(() => {
        setTransitionState("idle");
      }, 360);
    }, 200);
  };

  // Handle switching between expeditions inside detail view -> soft crossfade
  const handleSwitchExpedition = (expId) => {
    if (expId === selectedExpId || isCrossfadingExp) return;
    setIsCrossfadingExp(true);
    setTimeout(() => {
      setSelectedExpId(expId);
      setSearchParams({ view: "detail", exp: expId });
      setSelectedStationIdx(null);
      setTimeout(() => {
        setIsCrossfadingExp(false);
      }, 160);
    }, 140);
  };

  const handlePrevExpedition = () => {
    const prevIdx = (currentExpIndex - 1 + 4) % 4;
    if (expeditions[prevIdx]) {
      handleSwitchExpedition(expeditions[prevIdx].id);
    }
  };

  const handleNextExpedition = () => {
    const nextIdx = (currentExpIndex + 1) % 4;
    if (expeditions[nextIdx]) {
      handleSwitchExpedition(expeditions[nextIdx].id);
    }
  };

  return (
    <div className={`journey-container view-${viewMode} transition-${transitionState}`}>
      {/* =========================================================================
          DESKTOP VIEW (>= 1024px, Exact Original bc6a98a Layout & Proportions)
          ========================================================================= */}
      <div className="journey-desktop-only">
        <div className="journey-header-area">
        <div className="journey-header-text">
          <h1 className="journey-heading animate-enter-1">
            {content.journeyHeading || "Four Trans-Himalayan Journeys-"}
          </h1>
          <p className="journey-intro animate-enter-2">
            {content.journeyIntro ||
              "Carefully paced itineraries with authentic monastic access, low-altitude village stays, and dedicated daily creative hours. Capped at 6 to 10 participants per cohort."}
          </p>
        </div>

        {viewMode === "detail" && (
          <button
            type="button"
            className="journey-toggle-btn animate-enter-2"
            onClick={handleBackToOverview}
            aria-label="View all journeys overview"
          >
            ← View All 4 Journeys
          </button>
        )}
      </div>

      {/* Interactive Filter Pills Strip (Features) */}
      {viewMode === "overview" && (
        <div
          className={`journey-filters-row animate-enter-3 ${transitionState === "exiting-overview" ? "is-exiting" : ""}`}
          role="tablist"
          aria-label="Filter Expeditions"
        >
          <button
            type="button"
            className={`journey-filter-pill ${filterDuration === "all" ? "active" : ""}`}
            onClick={() => setFilterDuration("all")}
          >
            All Expeditions (4)
          </button>
          <button
            type="button"
            className={`journey-filter-pill ${filterDuration === "10" ? "active" : ""}`}
            onClick={() => setFilterDuration("10")}
          >
            10 Days · Essential
          </button>
          <button
            type="button"
            className={`journey-filter-pill ${filterDuration === "13" ? "active" : ""}`}
            onClick={() => setFilterDuration("13")}
          >
            13 Days · Heartland
          </button>
          <button
            type="button"
            className={`journey-filter-pill ${filterDuration === "14" ? "active" : ""}`}
            onClick={() => setFilterDuration("14")}
          >
            14 Days · High Lakes
          </button>
          <button
            type="button"
            className={`journey-filter-pill ${filterDuration === "15" ? "active" : ""}`}
            onClick={() => setFilterDuration("15")}
          >
            15 Days · Grand Traverse
          </button>
        </div>
      )}

      {/* VIEW 1: Four-Expedition Card Layout (Sharper Corners + Mid-Lower Placement) */}
      {viewMode === "overview" && (
        <div
          className={`journey-4cards-grid ${
            transitionState === "exiting-overview"
              ? "is-exiting"
              : transitionState === "entering-overview"
              ? "is-entering"
              : ""
          }`}
          role="region"
          aria-label="Expedition Cards Overview"
        >
          {expeditions.slice(0, 4).map((exp, idx) => {
            const expNum = `Expedition 0${idx + 1}`;
            const slotId = `journeyExp${idx + 1}`;
            const isMatch =
              filterDuration === "all" ||
              (filterDuration === "10" && exp.length?.includes("10")) ||
              (filterDuration === "13" && exp.length?.includes("13")) ||
              (filterDuration === "14" && exp.length?.includes("14")) ||
              (filterDuration === "15" && exp.length?.includes("15"));

            const isClicked = clickedCardId === exp.id;

            return (
              <div
                key={exp.id}
                className={`journey-overview-card ${isMatch ? "focused" : "dimmed"} ${
                  isClicked ? "clicked-active" : ""
                }`}
                onClick={() => handleSelectCard(exp)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelectCard(exp);
                }}
                aria-label={`Select ${expNum} - ${exp.title}`}
              >
                <SolidPlaceholder
                  slotId={slotId}
                  className="journey-card-slot"
                >
                  <div className="journey-card-top-bar">
                    <span className="journey-card-exp-number">{expNum}</span>
                    <span className="journey-card-length-badge">{exp.length || "10 Days"}</span>
                  </div>

                  <div className="journey-card-bottom-info">
                    <span className="journey-card-alt-badge">{exp.maxAltitude || "4,250 m"}</span>
                    <h3 className="journey-card-title">{exp.title}</h3>
                    <span className="journey-card-region-summary">
                      {(exp.regions || []).slice(0, 3).join(" · ")}
                    </span>
                    <span className="journey-card-inspect-cta">Inspect Route &amp; Dossier →</span>
                  </div>
                </SolidPlaceholder>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Selected Expedition Layout (Smooth Detail Inspector with Sharper Corners) */}
      {viewMode === "detail" && currentExp && (
        <div
          className={`journey-detail-view-layout ${
            transitionState === "entering-detail"
              ? "is-entering"
              : transitionState === "exiting-detail"
              ? "is-exiting"
              : ""
          }`}
        >
          <div className={`journey-detail-main-row ${isCrossfadingExp ? "is-crossfading" : ""}`}>
            {/* White Panel on Left with Sharper Corners */}
            <div className="journey-detail-white-panel">
              {/* Left Solid Visual Slot */}
              <SolidPlaceholder
                slotId="journeyDetailCover"
                className="journey-detail-cover-slot"
              >
                <div className="journey-detail-cover-top-bar">
                  <span className="journey-detail-alt-tag">
                    {currentExp.maxAltitude ? `Max ${currentExp.maxAltitude}` : "Max 4,250 m (Pangong Tso)"}
                  </span>
                  <span className="journey-detail-length-tag">
                    {currentExp.length ? `${currentExp.length} Itinerary` : "13 Days Itinerary"}
                  </span>
                </div>

                <div className="journey-detail-cover-bottom-bar">
                  <span className="journey-detail-slot-label">
                    {expNumberLabel} · {currentExp.title}
                  </span>
                </div>
              </SolidPlaceholder>

              {/* Transit Stations Column */}
              <div className="journey-detail-stations-col">
                <div>
                  <h3 className="journey-stations-heading">TRANSIT STATIONS</h3>
                  <ul className="journey-station-list">
                    {(currentExp.regions || ["Leh", "Sham Valley", "Nubra Valley", "Pangong Tso"]).map((reg, i) => {
                      const alt = STATION_ALTITUDES[reg] || "3,200 m";
                      const displayReg = reg === "Sham Valley (Alchi, Likir)" ? "Sham Valley (Alchi)" : reg;
                      return (
                        <li key={i} className="journey-station-item">
                          <span className="journey-station-name">{displayReg}</span>
                          <span className="journey-station-alt">{alt}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Animated Route Illustration SVG */}
                <div className="journey-route-trail-box">
                  <svg
                    className="journey-route-trail-svg"
                    viewBox="0 0 160 70"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Route waypoints"
                  >
                    <path
                      d={currentRoute.path}
                      stroke="#f15a24"
                      strokeWidth="2.5"
                      className="animated-route-path"
                    />
                    {currentRoute.waypoints.map((pt, i) => (
                      <g key={i} className="route-waypoint-group">
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#f15a24" fillOpacity="0.25" className="waypoint-pulse" />
                        <circle cx={pt.x} cy={pt.y} r="2.8" fill="#f15a24" />
                        <text
                          x={pt.x}
                          y={pt.y - 7}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize="7"
                          fontFamily="var(--font-mono)"
                          fontWeight="700"
                        >
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Titles, Premise & Dossier Button */}
            <div className="journey-detail-right-col">
              <div className="journey-detail-badge-row">
                <span className="journey-detail-subhead">{expNumberLabel}</span>
                <span className="journey-detail-duration-tag">
                  {currentExp.length || "13 Days"} · {currentExp.nights || "12 Nights"}
                </span>
              </div>

              <h2 className="journey-detail-title">{currentExp.title}</h2>

              <div className="journey-premise-block">
                <h4 className="journey-premise-heading">ARTISTIC PREMISE &amp; HIGHLIGHTS</h4>
                <p className="journey-premise-text">
                  {currentExp.focus || "Monasteries, Silk Road history, sand dunes and the high lake"}
                </p>
                <p className="journey-premise-quote">
                  “{currentExp.highlight || "Focused on the Ladakh heartland with no Changthang leg, allowing more breathing room and village immersion."}”
                </p>
              </div>

              <div className="journey-detail-action-row">
                <a
                  href={`/journey/${currentExp.slug || "heartland"}`}
                  onClick={(e) => handleOpenDossier(e, currentExp.slug || "heartland")}
                  className="journey-dossier-btn"
                  id="journey-dossier-cta-btn"
                >
                  EXAMINE FULL DAY-BY-DAY DOSSIER &nbsp;↗
                </a>
                <span className="journey-detail-cohort-tag">Cohort of 6–10 artists</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: 4 Mini Expedition Selectors (Stable Order, Active Highlight) */}
          <div className="journey-detail-bottom-row" role="tablist" aria-label="Expedition Switcher">
            <span className="journey-switcher-label">EXPEDITIONS:</span>
            {expeditions.slice(0, 4).map((exp, idx) => {
              const expNum = `Expedition 0${idx + 1}`;
              const isActive = exp.id === currentExp.id;

              return (
                <button
                  key={exp.id}
                  type="button"
                  className={`journey-mini-card ${isActive ? "active" : ""}`}
                  onClick={() => handleSwitchExpedition(exp.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Switch to ${expNum} - ${exp.title}`}
                >
                  <div className="journey-mini-card-slot">
                    <div className="journey-mini-card-top">
                      <span className="journey-mini-exp-label">{expNum}</span>
                      <span className="journey-mini-length-label">{exp.length}</span>
                    </div>
                    <span className="journey-mini-title-label">{exp.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    
      </div>

      {/* =========================================================================
          MOBILE VIEW (<= 1023px, Dedicated Mobile-First Design System)
          ========================================================================= */}
      <div className="journey-mobile-only">
        {viewMode === "overview" && (
          <>
            <div className="journey-header-area">
            <div className="journey-header-text">
              <div className="journey-header-eyebrow animate-enter-1">
                FOUR TRANS-HIMALAYAN JOURNEYS
              </div>
              <h1 className="journey-heading animate-enter-1">
                {content.journeyHeading ? content.journeyHeading.replace(/-$/, "") : "Four Trans-Himalayan Journeys"}
              </h1>
              <p className="journey-intro animate-enter-2">
                {content.journeyIntro ||
                  "Carefully paced itineraries with authentic monastic access, low-altitude village stays, and dedicated daily creative hours. Capped at 6 to 10 participants per cohort."}
              </p>
            </div>
          </div>

          {/* Horizontally Scrollable Filter Strip with Dynamic Edge Fade */}
          <HorizontalScrollStrip
            className={`journey-filters-row animate-enter-3 ${transitionState === "exiting-overview" ? "is-exiting" : ""}`}
            role="tablist"
            aria-label="Filter Expeditions by Duration"
            activeKey={filterDuration}
          >
            <button
              type="button"
              className={`journey-filter-pill ${filterDuration === "all" ? "active" : ""}`}
              onClick={() => setFilterDuration("all")}
              role="tab"
              aria-selected={filterDuration === "all"}
            >
              All Journeys
            </button>
            <button
              type="button"
              className={`journey-filter-pill ${filterDuration === "10" ? "active" : ""}`}
              onClick={() => setFilterDuration("10")}
              role="tab"
              aria-selected={filterDuration === "10"}
            >
              10 Days
            </button>
            <button
              type="button"
              className={`journey-filter-pill ${filterDuration === "13" ? "active" : ""}`}
              onClick={() => setFilterDuration("13")}
              role="tab"
              aria-selected={filterDuration === "13"}
            >
              13 Days
            </button>
            <button
              type="button"
              className={`journey-filter-pill ${filterDuration === "14" ? "active" : ""}`}
              onClick={() => setFilterDuration("14")}
              role="tab"
              aria-selected={filterDuration === "14"}
            >
              14 Days
            </button>
            <button
              type="button"
              className={`journey-filter-pill ${filterDuration === "15" ? "active" : ""}`}
              onClick={() => setFilterDuration("15")}
              role="tab"
              aria-selected={filterDuration === "15"}
            >
              15 Days
            </button>
          </HorizontalScrollStrip>
            <div
            className={`journey-mobile-cards-list journey-mobile-only ${
              transitionState === "exiting-overview" ? "is-exiting" : ""
            }`}
            role="region"
            aria-label="Expedition Cards Mobile List"
          >
            {expeditions.slice(0, 4).map((exp, idx) => {
              const expNum = `Expedition 0${idx + 1}`;
              const slotId = `journeyExp${idx + 1}`;
              const isMatch =
                filterDuration === "all" ||
                (filterDuration === "10" && exp.length?.includes("10")) ||
                (filterDuration === "13" && exp.length?.includes("13")) ||
                (filterDuration === "14" && exp.length?.includes("14")) ||
                (filterDuration === "15" && exp.length?.includes("15"));

              if (!isMatch && filterDuration !== "all") return null;

              return (
                <div
                  key={exp.id}
                  className="journey-mobile-card animate-enter-2"
                  onClick={() => handleSelectCard(exp)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleSelectCard(exp);
                  }}
                  aria-label={`Explore ${expNum} - ${exp.title}`}
                >
                  {/* Top Row: Expedition Number & Duration Badge */}
                  <div className="journey-mobile-card-top-row">
                    <span className="journey-mobile-card-exp-num">{expNum}</span>
                    <span className="journey-mobile-card-duration-badge">{exp.length || "10 Days"}</span>
                  </div>

                  {/* Middle: Edge-to-Edge Consistent 16:9 Landscape Imagery */}
                  <div className="journey-mobile-card-media-wrap">
                    <SolidPlaceholder slotId={slotId} className="journey-mobile-card-slot" />
                  </div>

                  {/* Bottom: Title, Regional Route, Max Altitude, Explore Action */}
                  <div className="journey-mobile-card-bottom-info">
                    <h3 className="journey-mobile-card-title">{exp.title}</h3>
                    <p className="journey-mobile-card-route">
                      {(exp.regions || []).join(" · ")}
                    </p>

                    <div className="journey-mobile-card-meta-bar">
                      <span className="journey-mobile-card-alt">
                        <span className="alt-label">Maximum altitude:</span> {exp.maxAltitude || "4,250 m"}
                      </span>
                    </div>

                    <div className="journey-mobile-card-cta-row">
                      <span className="journey-mobile-card-cta-text">Explore Journey</span>
                      <span className="journey-mobile-card-cta-arrow" aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        
          </>
        )}

        {viewMode === "detail" && currentExp && (
          <div
            className={`journey-mobile-detail-view journey-mobile-only ${
              isCrossfadingExp ? "is-crossfading" : ""
            }`}
          >
            {/* 1. Back Navigation Button */}
            <div className="journey-mobile-detail-nav-bar">
              <button
                type="button"
                className="journey-mobile-back-btn"
                onClick={handleBackToOverview}
                aria-label="Back to all journeys"
              >
                <span className="back-arrow" aria-hidden="true">←</span>
                <span>All Journeys</span>
              </button>

              <div className="journey-mobile-pagination-arrows">
                <button
                  type="button"
                  className="mobile-pager-btn"
                  onClick={handlePrevExpedition}
                  aria-label="Previous Expedition"
                >
                  ‹
                </button>
                <span className="mobile-pager-label">{currentExpIndex + 1} / 4</span>
                <button
                  type="button"
                  className="mobile-pager-btn"
                  onClick={handleNextExpedition}
                  aria-label="Next Expedition"
                >
                  ›
                </button>
              </div>
            </div>

            {/* 2. Expedition Identity Block */}
            <div className="journey-mobile-detail-identity-card animate-enter-1">
              <span className="journey-mobile-identity-eyebrow">{expNumberLabel}</span>
              <h1 className="journey-mobile-detail-title">{currentExp.title}</h1>

              {/* Compact Metadata Chips */}
              <div className="journey-mobile-meta-chips-row">
                <span className="journey-mobile-chip">
                  <span className="chip-icon" aria-hidden="true">⏱</span>
                  {currentExp.length || "13 Days"} · {currentExp.nights || "12 Nights"}
                </span>
                <span className="journey-mobile-chip">
                  <span className="chip-icon" aria-hidden="true">▲</span>
                  {currentExp.maxAltitude ? `Max ${currentExp.maxAltitude}` : "Max 4,250 m"}
                </span>
                <span className="journey-mobile-chip">
                  <span className="chip-icon" aria-hidden="true">👥</span>
                  Cohort 6–10 Artists
                </span>
              </div>
            </div>

            {/* 3. Main Prominent Landscape Image */}
            <div className="journey-mobile-cover-wrap animate-enter-2">
              <SolidPlaceholder
                slotId="journeyDetailCover"
                className="journey-mobile-detail-cover"
              >
                <div className="journey-mobile-cover-badge">
                  <span>{currentExp.title}</span>
                </div>
              </SolidPlaceholder>
            </div>

            {/* 4. About This Journey (Artistic Premise & Curatorial Highlights) */}
            <div className="journey-mobile-section-card animate-enter-2">
              <h3 className="journey-mobile-section-title">ABOUT THIS JOURNEY</h3>
              <p className="journey-mobile-about-text">
                {currentExp.focus || "Curated monastic studies, village life, sand dunes and alpine high lakes."}
              </p>
              <blockquote className="journey-mobile-about-quote">
                “{currentExp.highlight || "Focused on the Ladakh heartland, allowing generous breathing room and deep immersion."}”
              </blockquote>

              {currentExp.practicalNotes && currentExp.practicalNotes.length > 0 && (
                <div className="journey-mobile-notes-disclosure">
                  <button
                    type="button"
                    className="journey-mobile-notes-toggle"
                    onClick={() => setExpandedAbout(!expandedAbout)}
                    aria-expanded={expandedAbout}
                  >
                    <span>{expandedAbout ? "Hide Expedition Notes ↑" : "Read Expedition Notes ↓"}</span>
                  </button>
                  {expandedAbout && (
                    <ul className="journey-mobile-notes-list">
                      {currentExp.practicalNotes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 5. Simplified Vertical Route Timeline */}
            <div className="journey-mobile-section-card animate-enter-3">
              <div className="journey-mobile-section-header">
                <h3 className="journey-mobile-section-title">ROUTE OVERVIEW</h3>
                <span className="journey-mobile-section-sub">Transit stations &amp; elevations</span>
              </div>

              <div className="journey-mobile-timeline">
                {(currentExp.regions || ["Leh", "Sham Valley", "Nubra Valley", "Pangong Tso"]).map((reg, idx, arr) => {
                  const alt = STATION_ALTITUDES[reg] || "3,200 m";
                  const displayReg = reg === "Sham Valley (Alchi, Likir)" ? "Sham Valley (Alchi)" : reg;
                  const isSelected = selectedStationIdx === idx;
                  const isLast = idx === arr.length - 1;

                  return (
                    <div
                      key={idx}
                      className={`journey-mobile-timeline-node ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setSelectedStationIdx(isSelected ? null : idx)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="timeline-node-spine">
                        <span className="timeline-node-bullet" />
                        {!isLast && <span className="timeline-spine-line" />}
                      </div>

                      <div className="timeline-node-body">
                        <div className="timeline-station-row">
                          <span className="timeline-station-name">{displayReg}</span>
                          <span className="timeline-station-alt">{alt}</span>
                        </div>
                        {isSelected && (
                          <div className="timeline-station-detail-callout">
                            <span>Stage 0{idx + 1} · Dedicated plein-air studio hours and field sketching.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Artistic Highlights with Progressive Disclosure Accordions */}
            <div className="journey-mobile-section-card animate-enter-3">
              <h3 className="journey-mobile-section-title">ARTISTIC HIGHLIGHTS</h3>

              {/* Highlight 1 */}
              <div className="journey-mobile-highlight-item">
                <button
                  type="button"
                  className="journey-mobile-highlight-header"
                  onClick={() => toggleHighlight("pleinAir")}
                  aria-expanded={expandedHighlights.pleinAir}
                >
                  <div className="highlight-header-text">
                    <span className="highlight-title">🎨 Atelier En Plein Air</span>
                    <span className="highlight-subtitle">Daily dedicated creative hours &amp; natural mineral pigments</span>
                  </div>
                  <span className="highlight-toggle-icon" aria-hidden="true">
                    {expandedHighlights.pleinAir ? "−" : "+"}
                  </span>
                </button>
                {expandedHighlights.pleinAir && (
                  <div className="journey-mobile-highlight-body">
                    <p>
                      Artists work with handmade accordion journals, pure sable brushes, and authentic mineral pigments ground from local lapis, cinnabar, and mountain ochres under the guidance of our expedition master artist.
                    </p>
                  </div>
                )}
              </div>

              {/* Highlight 2 */}
              <div className="journey-mobile-highlight-item">
                <button
                  type="button"
                  className="journey-mobile-highlight-header"
                  onClick={() => toggleHighlight("frescoes")}
                  aria-expanded={expandedHighlights.frescoes}
                >
                  <div className="highlight-header-text">
                    <span className="highlight-title">🏛 Monastic Fresco Immersion</span>
                    <span className="highlight-subtitle">Exclusive access to 1,000-year-old sanctuary murals</span>
                  </div>
                  <span className="highlight-toggle-icon" aria-hidden="true">
                    {expandedHighlights.frescoes ? "−" : "+"}
                  </span>
                </button>
                {expandedHighlights.frescoes && (
                  <div className="journey-mobile-highlight-body">
                    <p>
                      Private access to ancient mud-brick sanctuaries including Alchi, Basgo, and Likir. Spend uninterrupted quiet hours studying Kashmiri-Tibetan mural lineages preserved since the 11th century.
                    </p>
                  </div>
                )}
              </div>

              {/* Highlight 3 */}
              <div className="journey-mobile-highlight-item">
                <button
                  type="button"
                  className="journey-mobile-highlight-header"
                  onClick={() => toggleHighlight("lakes")}
                  aria-expanded={expandedHighlights.lakes}
                >
                  <div className="highlight-header-text">
                    <span className="highlight-title">🌊 High-Altitude Light Studies</span>
                    <span className="highlight-subtitle">Dawn and twilight palette studies beside alpine waters</span>
                  </div>
                  <span className="highlight-toggle-icon" aria-hidden="true">
                    {expandedHighlights.lakes ? "−" : "+"}
                  </span>
                </button>
                {expandedHighlights.lakes && (
                  <div className="journey-mobile-highlight-body">
                    <p>
                      Experience the extraordinary shifting light across ultramarine salt lakes and stark granite screes. Special sessions dedicated to capturing cold atmospheric gradients and twilight reflections.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 7. Primary Action Button */}
            <div className="journey-mobile-primary-action-wrap animate-enter-3">
              <a
                href={`/journey/${currentExp.slug || "heartland"}`}
                onClick={(e) => handleOpenDossier(e, currentExp.slug || "heartland")}
                className="journey-mobile-primary-action-btn"
                id="journey-mobile-examine-dossier-btn"
              >
                <span>EXAMINE DAY-BY-DAY ITINERARY</span>
                <span className="action-arrow" aria-hidden="true">→</span>
              </a>
              <span className="journey-mobile-action-caption">
                Detailed day schedule, historic traveler links &amp; studio exercises
              </span>
            </div>

            {/* 8. Compact Horizontal Expedition Switcher */}
            <div className="journey-mobile-switcher-container animate-enter-3" role="tablist" aria-label="Expedition Switcher">
              <div className="journey-mobile-switcher-header">
                <span className="switcher-caption">SWITCH EXPEDITION:</span>
              </div>
              <div className="journey-mobile-switcher-tabs">
                {expeditions.slice(0, 4).map((exp, idx) => {
                  const isActive = exp.id === currentExp.id;
                  const expNum = `0${idx + 1}`;
                  const durationShort = exp.length ? exp.length.replace(" Days", "D") : "10D";

                  return (
                    <button
                      key={exp.id}
                      type="button"
                      className={`journey-mobile-switcher-tab ${isActive ? "active" : ""}`}
                      onClick={() => handleSwitchExpedition(exp.id)}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Switch to Expedition 0${idx + 1} - ${exp.title}`}
                    >
                      <span className="tab-num">Exp {expNum}</span>
                      <span className="tab-duration">{durationShort}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        
        )}
      </div>
    </div>
  );
}
