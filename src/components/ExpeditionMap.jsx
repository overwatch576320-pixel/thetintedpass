import { useState } from "react";
import { expeditionLandmarks, journeyItineraries } from "../data/siteData";
import { Mountain, Compass, Sparkles, User, Layers, ArrowUpRight, Check, Eye } from "lucide-react";

// Georeferenced coordinate layout for Ladakh geography onto 1000x620 canvas
const mapNodes = {
  leh: { x: 420, y: 260, id: "leh", label: "Leh Old Town", alt: "3,524 m" },
  alchi: { x: 250, y: 250, id: "alchi", label: "Alchi & Basgo", alt: "3,120 m" },
  diskit: { x: 440, y: 120, id: "diskit", label: "Diskit / Nubra", alt: "3,100 m" },
  pangong: { x: 740, y: 300, id: "pangong", label: "Pangong Tso", alt: "4,250 m" },
  nyoma: { x: 770, y: 450, id: "nyoma", label: "Nyoma", alt: "4,180 m" },
  hanle: { x: 890, y: 520, id: "hanle", label: "Hanle Reserve", alt: "4,300 m" },
  tsomoriri: { x: 710, y: 510, id: "tsomoriri", label: "Tso Moriri", alt: "4,522 m" }
};

// Route polylines connecting the stations for each itinerary
const routeVectors = {
  "all": [
    mapNodes.alchi,
    mapNodes.leh,
    mapNodes.diskit,
    mapNodes.pangong,
    mapNodes.nyoma,
    mapNodes.hanle,
    mapNodes.tsomoriri
  ],
  "first-light": [
    mapNodes.leh,
    mapNodes.alchi,
    mapNodes.diskit,
    mapNodes.pangong,
    mapNodes.leh
  ],
  "heartland": [
    mapNodes.leh,
    mapNodes.alchi,
    mapNodes.diskit,
    mapNodes.pangong,
    mapNodes.leh
  ],
  "beyond-the-blue": [
    mapNodes.leh,
    mapNodes.alchi,
    mapNodes.pangong,
    mapNodes.nyoma,
    mapNodes.leh
  ],
  "grand-traverse": [
    mapNodes.leh,
    mapNodes.alchi,
    mapNodes.pangong,
    mapNodes.nyoma,
    mapNodes.hanle,
    mapNodes.tsomoriri,
    mapNodes.leh
  ]
};

// Elevation profiles for each route
const elevationProfiles = {
  "first-light": [
    { stop: "Leh", elev: 3524, landmarkId: "leh" },
    { stop: "Alchi", elev: 3120, landmarkId: "alchi" },
    { stop: "Khardung La", elev: 5359, landmarkId: null, pass: true },
    { stop: "Nubra", elev: 3100, landmarkId: "diskit" },
    { stop: "Tangtse", elev: 3950, landmarkId: null },
    { stop: "Pangong", elev: 4250, landmarkId: "pangong" },
    { stop: "Chang La", elev: 5360, landmarkId: null, pass: true },
    { stop: "Leh", elev: 3524, landmarkId: "leh" }
  ],
  "heartland": [
    { stop: "Leh", elev: 3524, landmarkId: "leh" },
    { stop: "Alchi", elev: 3120, landmarkId: "alchi" },
    { stop: "Khardung La", elev: 5359, landmarkId: null, pass: true },
    { stop: "Diskit", elev: 3100, landmarkId: "diskit" },
    { stop: "Shyok", elev: 3600, landmarkId: null },
    { stop: "Pangong", elev: 4250, landmarkId: "pangong" },
    { stop: "Leh", elev: 3524, landmarkId: "leh" }
  ],
  "beyond-the-blue": [
    { stop: "Leh", elev: 3524, landmarkId: "leh" },
    { stop: "Alchi", elev: 3120, landmarkId: "alchi" },
    { stop: "Pangong", elev: 4250, landmarkId: "pangong" },
    { stop: "Nyoma", elev: 4180, landmarkId: "nyoma" },
    { stop: "Chumathang", elev: 3950, landmarkId: null },
    { stop: "Leh", elev: 3524, landmarkId: "leh" }
  ],
  "grand-traverse": [
    { stop: "Leh", elev: 3524, landmarkId: "leh" },
    { stop: "Alchi", elev: 3120, landmarkId: "alchi" },
    { stop: "Lamayuru", elev: 3510, landmarkId: null },
    { stop: "Pangong", elev: 4250, landmarkId: "pangong" },
    { stop: "Hanle", elev: 4300, landmarkId: "hanle" },
    { stop: "Tso Moriri", elev: 4522, landmarkId: "tsomoriri" },
    { stop: "Tso Kar", elev: 4530, landmarkId: null },
    { stop: "Leh", elev: 3524, landmarkId: "leh" }
  ]
};

// Natural pigment suggestions using authentic Himalayan minerals
const stationPigments = {
  leh: [
    { name: "Gold Ochre", color: "#B4963C", mineral: "Local siltstone & yellow ochre" },
    { name: "Muted Sage", color: "#80856E", mineral: "Willow ash & celadonite" },
    { name: "Apricot Sand", color: "#C49A72", mineral: "Sun-dried Sham clay" }
  ],
  alchi: [
    { name: "Tibetan Crimson", color: "#942E20", mineral: "Cinnabar & walnut husk" },
    { name: "Champagne Ochre", color: "#E3CD91", mineral: "Crushed apricot silt" },
    { name: "Mountain Indigo", color: "#60748D", mineral: "Lapis wash on mudbrick" }
  ],
  diskit: [
    { name: "Soft Linen", color: "#DEC3AE", mineral: "Bactrian sand dune dust" },
    { name: "Glacial Slate", color: "#8EA7AC", mineral: "Shyok riverbed pebble" },
    { name: "Himalayan Clay", color: "#814721", mineral: "Terra cotta kiln clay" }
  ],
  pangong: [
    { name: "Ultramarine Saline", color: "#4A6E82", mineral: "Pure Badakhshan Lapis Lazuli" },
    { name: "Mountain Indigo", color: "#60748D", mineral: "High-altitude lake gradient" },
    { name: "Glacial Sky", color: "#B2C0C9", mineral: "Changchenmo snowcap wash" }
  ],
  nyoma: [
    { name: "Roasted Umber", color: "#4D2712", mineral: "Burnt plateau shale" },
    { name: "Celadon Willow", color: "#BCC1AB", mineral: "Oasis willow leaf pigment" },
    { name: "Terracotta Rust", color: "#C86E3A", mineral: "Iron oxide sediment" }
  ],
  hanle: [
    { name: "Deep Slate Ink", color: "#2D3037", mineral: "Carbon soot & Tibetan ink" },
    { name: "Glacial Slate", color: "#8EA7AC", mineral: "Night sky nebula wash" },
    { name: "Gold Ochre", color: "#B4963C", mineral: "Monastery brass lamp reflection" }
  ],
  tsomoriri: [
    { name: "Forest Olive", color: "#54522C", mineral: "Korzok pasture moss" },
    { name: "Mountain Indigo", color: "#60748D", mineral: "Deep saltwater brine" },
    { name: "Tibetan Crimson", color: "#942E20", mineral: "Nomad tent wool dye" }
  ]
};

// Curated thumbnail images for each station
const stationImages = {
  leh: "/editorial/mountain-peaks.jpg",
  alchi: "/figma/manifesto-background.png",
  diskit: "/editorial/traveler-trail.png",
  pangong: "/figma/hero-bg-hd.png",
  nyoma: "/editorial/mountain-notes.jpg",
  hanle: "/editorial/oil-clouds.jpg",
  tsomoriri: "/editorial/eiger-path.jpg"
};

export default function ExpeditionMap({ selectedJourneyId, onSelectJourney, onOpenItinerary }) {
  const [activeNodeId, setActiveNodeId] = useState("leh");
  const [activeRouteId, setActiveRouteId] = useState(selectedJourneyId || "first-light");
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const activeLandmark = expeditionLandmarks.find(l => l.id === activeNodeId) || expeditionLandmarks[0];
  const activeJourney = journeyItineraries.find(j => j.slug === activeRouteId) || journeyItineraries[0];

  const currentPathNodes = routeVectors[activeRouteId] || routeVectors["first-light"];
  const svgPathData = currentPathNodes.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const currentElevProfile = elevationProfiles[activeRouteId] || elevationProfiles["first-light"];
  const pigments = stationPigments[activeNodeId] || stationPigments.leh;
  const currentImage = stationImages[activeNodeId] || "/editorial/topographic-relief.jpg";

  const handleRouteSelect = (slug) => {
    setActiveRouteId(slug);
    if (onSelectJourney) onSelectJourney(slug);
  };

  return (
    <div className="cartography-lake-como-shell" id="ladakh-map-explorer">
      {/* Top Bar: Route Selectors & Legend */}
      <div className="cartography-top-controls">
        <div className="cartography-route-tabs">
          <button
            type="button"
            className={`map-route-tab ${activeRouteId === "all" ? "active" : ""}`}
            onClick={() => handleRouteSelect("all")}
          >
            All Destinations Overview
          </button>
          {journeyItineraries.map((j) => (
            <button
              key={j.slug}
              type="button"
              className={`map-route-tab ${activeRouteId === j.slug ? "active" : ""}`}
              onClick={() => handleRouteSelect(j.slug)}
            >
              <span>{j.length}</span> · {j.title}
            </button>
          ))}
        </div>

        <div className="cartography-meta-badge">
          <Compass size={13} />
          <span>GEOGRAPHIC STORYTELLING · LADAKH TERRAIN</span>
        </div>
      </div>

      {/* Main Grid: Interactive Map Canvas + Geographic Storytelling Inspector */}
      <div className="cartography-dual-grid">
        {/* Left: Atmospheric Photographic / Relief Canvas Map */}
        <div className="cartography-canvas-container">
          {/* Background Topographic Texture Layer */}
          <div className="cartography-canvas-backdrop">
            <img
              src="/editorial/topographic-relief.jpg"
              alt="Ladakh Topographic Relief"
              className="cartography-backdrop-img"
            />
            <div className="cartography-backdrop-vignette" />
          </div>

          <svg
            viewBox="0 0 1000 620"
            className="cartography-svg-overlay"
            aria-label="Interactive Cartographic Map of Ladakh"
          >
            <defs>
              <pattern id="cartoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.8" />
              </pattern>

              {/* Glowing filter for active station nodes */}
              <filter id="stationHalo" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid overlay */}
            <rect width="1000" height="620" fill="url(#cartoGrid)" />

            {/* Natural Geographic Features: Mountain Ridges */}
            <g fill="none" stroke="rgba(227, 205, 145, 0.12)" strokeWidth="1.2">
              <path d="M 40 160 Q 240 100 420 130 T 780 100 T 960 140" />
              <path d="M 30 220 Q 220 170 410 200 T 760 180 T 940 200" />
              <path d="M 60 300 Q 260 250 460 290 T 770 270 T 950 310" />
              <path d="M 50 400 Q 250 360 450 390 T 750 370 T 940 420" />
              <path d="M 90 490 Q 290 450 510 480 T 810 460 T 950 520" />
            </g>

            {/* Waterways: Indus & Shyok Glacial Rivers */}
            <g fill="none" stroke="#8EA7AC" strokeWidth="2.4" opacity="0.65">
              <path d="M 120 300 Q 300 270 450 290 T 750 390 T 950 480" />
              <path d="M 320 100 Q 480 140 600 150 T 820 220" strokeDasharray="5 3" />
            </g>

            {/* High Mountain Range Watermarks */}
            <g fontFamily="var(--font-mono)" fontSize="10" fill="#BCC1AB" opacity="0.6" letterSpacing="3">
              <text x="360" y="70">KARAKORAM MASSIF</text>
              <text x="300" y="440">ZANSKAR VALLEYS</text>
              <text x="680" y="230">CHANGTHANG HIGH LAKES</text>
            </g>

            {/* Active Expedition Route Polyline */}
            <path
              d={svgPathData}
              fill="none"
              stroke="#B4963C"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="map-route-vector-active"
            />

            {/* Georeferenced Destination Stations */}
            {expeditionLandmarks.map((lm) => {
              const node = mapNodes[lm.id];
              if (!node) return null;
              const isSelected = activeNodeId === lm.id;
              const isHovered = hoveredNodeId === lm.id;
              const isOnActiveRoute = activeRouteId === "all" || lm.journeysCovered.includes(activeRouteId);

              return (
                <g
                  key={lm.id}
                  className="map-station-group"
                  onClick={() => setActiveNodeId(lm.id)}
                  onMouseEnter={() => setHoveredNodeId(lm.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Subtle pulsing beacon halo */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="22"
                      fill="none"
                      stroke="#B4963C"
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                      className="map-station-pulse"
                      opacity="0.8"
                    />
                  )}

                  {/* Outer protective disc */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? "11" : isHovered ? "9" : "7"}
                    fill={isSelected ? "rgba(180, 150, 60, 0.25)" : "rgba(20, 23, 28, 0.6)"}
                    stroke={isSelected ? "#B4963C" : isOnActiveRoute ? "rgba(227, 205, 145, 0.8)" : "rgba(142, 167, 172, 0.4)"}
                    strokeWidth="1.5"
                  />

                  {/* Core station center dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? "5.5" : "4"}
                    fill={isSelected ? "#942E20" : isOnActiveRoute ? "#B4963C" : "#60748D"}
                  />

                  {/* Minimal station label & elevation */}
                  <text
                    x={node.x + 14}
                    y={node.y - 2}
                    fontFamily="var(--font-display)"
                    fontSize="12"
                    fontWeight={isSelected ? "800" : "600"}
                    fill={isSelected ? "#FFFFFF" : isOnActiveRoute ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)"}
                    letterSpacing="0.04em"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + 14}
                    y={node.y + 12}
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill={isSelected ? "#E3CD91" : "rgba(180, 150, 60, 0.75)"}
                    letterSpacing="0.06em"
                  >
                    {node.alt}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Canvas Watermark & Instruction */}
          <div className="cartography-canvas-footnote">
            <span>Hover or tap any station marker to inspect cultural context, historic travelers & mineral pigments.</span>
          </div>
        </div>

        {/* Right: Integrated Geographic Storytelling Inspector (Editorial Panel) */}
        <aside className="cartography-dossier-card">
          <div className="dossier-header-strip">
            <span className="dossier-tag">DESTINATION DOSSIER</span>
            <span className="dossier-coord-label">{activeLandmark.coordinates}</span>
          </div>

          {/* Destination Photograph / Landscape Canvas Preview */}
          <div className="dossier-media-frame">
            <img
              src={currentImage}
              alt={activeLandmark.name}
              className="dossier-img"
            />
            <div className="dossier-media-gradient" />
            <div className="dossier-media-overlay-meta">
              <span className="dossier-region-pill">{activeLandmark.region}</span>
              <span className="dossier-altitude-pill">{activeLandmark.altitude}</span>
            </div>
          </div>

          <div className="dossier-body">
            <h3 className="dossier-name">{activeLandmark.name}</h3>
            <p className="dossier-character">{activeLandmark.character}</p>

            {/* Historical Chronicler / Traveler Link */}
            <div className="dossier-traveler-block">
              <div className="traveler-block-title">
                <User size={13} />
                <span>HISTORIC CHRONICLER · {activeLandmark.historicFigure}</span>
              </div>
              <p className="traveler-note">
                “{activeLandmark.historicNote}”
              </p>
            </div>

            {/* Daily Art Exercise Planned */}
            <div className="dossier-practice-block">
              <div className="practice-block-title">
                <Sparkles size={13} />
                <span>CREATIVE ATELIER EXERCISE</span>
              </div>
              <p className="practice-note">
                {activeLandmark.practiceFocus}
              </p>
            </div>

            {/* Natural Mineral Pigment Swatches for this Station */}
            <div className="dossier-pigments-block">
              <span className="pigments-title">LOCAL MINERAL PIGMENT PALETTE</span>
              <div className="pigment-chips-row">
                {pigments.map((pigment) => (
                  <div key={pigment.name} className="pigment-chip" title={`${pigment.name}: ${pigment.mineral}`}>
                    <span className="pigment-chip-color" style={{ backgroundColor: pigment.color }} />
                    <div className="pigment-chip-info">
                      <span className="pigment-chip-name">{pigment.name}</span>
                      <span className="pigment-chip-mineral">{pigment.mineral}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included in Which Expeditions */}
            <div className="dossier-journeys-coverage">
              <span className="coverage-label">INCLUDED IN EXPEDITIONS:</span>
              <div className="coverage-pills-row">
                {activeLandmark.journeysCovered.map((slug) => {
                  const j = journeyItineraries.find(it => it.slug === slug);
                  if (!j) return null;
                  return (
                    <button
                      key={slug}
                      type="button"
                      className={`coverage-pill ${activeRouteId === slug ? "active" : ""}`}
                      onClick={() => handleRouteSelect(slug)}
                    >
                      {j.length} · {j.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action button: inspect itinerary modal */}
            {onOpenItinerary && (
              <button
                type="button"
                className="btn-dossier-action"
                onClick={() => onOpenItinerary(activeJourney)}
              >
                <span>Examine Full {activeJourney.title} Dossier</span>
                <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Route Elevation Cross-Section */}
      <div className="cartography-elevation-section">
        <div className="elevation-section-header">
          <div>
            <span className="elevation-section-tag">TERRAIN ELEVATION PROFILE</span>
            <h4 className="elevation-section-title">
              {activeJourney.title} ({activeJourney.length}) · High Pass Traversal
            </h4>
          </div>
          <span className="elevation-max-tag">
            Peak Altitude: {activeJourney.maxAltitude}
          </span>
        </div>

        <div className="elevation-profile-bars">
          {currentElevProfile.map((pt, idx) => {
            const heightPercent = Math.max(25, Math.min(100, ((pt.elev - 2800) / (5400 - 2800)) * 100));
            const isStationSelected = pt.landmarkId && pt.landmarkId === activeNodeId;

            return (
              <div
                key={idx}
                className={`elevation-bar-col ${isStationSelected ? "active" : ""} ${pt.pass ? "high-pass" : ""}`}
                onClick={() => {
                  if (pt.landmarkId) setActiveNodeId(pt.landmarkId);
                }}
                style={{ cursor: pt.landmarkId ? "pointer" : "default" }}
              >
                <span className="elevation-bar-meters">{pt.elev}m</span>
                <div className="elevation-bar-track">
                  <div
                    className="elevation-bar-fill"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="elevation-bar-name">
                  {pt.stop}
                  {pt.pass && <span className="pass-marker">▲ PASS</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
