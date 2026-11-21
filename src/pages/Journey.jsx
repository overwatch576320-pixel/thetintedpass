import { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import SolidPlaceholder from "../components/SolidPlaceholder";

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
  "Nyoma": "4,180 m"
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

  const currentExp = expeditions.find((e) => e.id === selectedExpId) || expeditions[1] || expeditions[0];
  const currentExpIndex = expeditions.findIndex((e) => e.id === currentExp?.id);
  const expNumberLabel = `Expedition 0${currentExpIndex >= 0 ? currentExpIndex + 1 : 2}`;

  const currentRoute = useMemo(() => {
    return EXPEDITION_ROUTES[currentExp?.id] || EXPEDITION_ROUTES["itinerary-13-day"];
  }, [currentExp?.id]);

  // Handle clicking a card in the overview -> smooth transition into detail view
  const handleSelectCard = (exp) => {
    if (transitionState !== "idle") return;
    setClickedCardId(exp.id);
    setTransitionState("exiting-overview");

    setTimeout(() => {
      setSelectedExpId(exp.id);
      setViewMode("detail");
      setSearchParams({ view: "detail", exp: exp.id });
      setTransitionState("entering-detail");

      setTimeout(() => {
        setTransitionState("idle");
        setClickedCardId(null);
      }, 420);
    }, 220);
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
      setTimeout(() => {
        setIsCrossfadingExp(false);
      }, 60);
    }, 160);
  };

  return (
    <div className={`journey-container view-${viewMode} transition-${transitionState}`}>
      {/* Journey Header Area */}
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
  );
}
