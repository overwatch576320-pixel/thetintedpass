import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import SolidPlaceholder from "../components/SolidPlaceholder";

// Comprehensive Authentic Stations across Ladakh
const allStationsData = [
  {
    id: "leh",
    name: "Leh",
    region: "Central Ladakh",
    altitude: "3,524 m",
    subtitle: "Crossroads of high-mountain trade & ancient kingdom seat",
    chronicler: "William Simpson (1860 Victorian watercolorist)",
    quote: "Simpson traversed the passes with portable water tins, chronicling Leh's mudbrick towers and tiered stupas.",
    exercise: "Street sketching in the old alleys, architectural rhythm of Leh Palace, still life with hammered copperware.",
    x: 46,
    y: 48
  },
  {
    id: "sham",
    name: "Alchi & Sham Valley",
    region: "Sham Valley",
    altitude: "3,120 m",
    subtitle: "Ancient apricot groves & 11th-century Kashmiri-Buddhist temple murals",
    chronicler: "Lotsawa Rinchen Zangpo (10th-century translator)",
    quote: "Rinchen Zangpo summoned Master painters from Kashmir to fresco Alchi's assembly hall with natural lapis and malachite.",
    exercise: "Fresco tempera study: copy 11th-century floral draperies and lotus petal halo geometries on handmade wasli paper.",
    x: 28,
    y: 54
  },
  {
    id: "nubra",
    name: "Diskit & Hunder Dunes",
    region: "Nubra Valley",
    altitude: "3,100 m",
    subtitle: "Cold-desert sand waves beneath snowbound Karakoram peaks",
    chronicler: "Mirza Muhammad Haidar Dughlat (16th-century Mughal chronicler)",
    quote: "Dughlat chronicled the Silk Road caravans laden with silk and jade descending through the high Karakoram winds.",
    exercise: "Plein air gouache study: sweeping dune crest shadows against the afternoon ochre cliffs of Diskit monastery.",
    x: 52,
    y: 28
  },
  {
    id: "pangong",
    name: "Pangong Tso",
    region: "Changthang Frontier",
    altitude: "4,250 m",
    subtitle: "Endorheic salt lake with shifting cobalt, cerulean and emerald reflections",
    chronicler: "Sogdian Silk Road merchants (8th century)",
    quote: "Early merchants carved crosses and Sogdian runes into granite boulders beside the ancient high salt shore.",
    exercise: "Light and color journal: mix pure ultramarine, cobalt and titanium white to capture the shifting twilight water bands.",
    x: 74,
    y: 52
  },
  {
    id: "nyoma",
    name: "Nyoma & Chumathang",
    region: "Southern Changthang",
    altitude: "4,180 m",
    subtitle: "Nomadic plains, geothermal steam & wild upper Indus riverbanks",
    chronicler: "Sven Hedin (Swedish explorer, 1906)",
    quote: "Surveyed the uncharted Indus tributaries and recorded the customs of the nomadic Changpa herdsmen.",
    exercise: "Wide-plain horizons, steam studies at geothermal springs, raw wash sketching of weathered nomadic tents.",
    x: 76,
    y: 70
  },
  {
    id: "hanle",
    name: "Hanle & Dark Sky Reserve",
    region: "Remote Changthang",
    altitude: "4,300 m",
    subtitle: "World's highest observatory, 17th-c. monastery & pristine night skies",
    chronicler: "Father Ippolito Desideri (1715 Jesuit explorer)",
    quote: "Desideri crossed the vast high-altitude desert plateaus where the air was pure as crystal and stars burn without twinkle.",
    exercise: "Nocturne drawing with charcoal and lapis pigment; study nomadic woven yak-hair rebo tents under the Milky Way.",
    x: 84,
    y: 80
  },
  {
    id: "tsomoriri",
    name: "Tso Moriri & Korzok",
    region: "High Changthang Plateau",
    altitude: "4,522 m",
    subtitle: "Sacred high-altitude wetland surrounded by snow peaks and nomadic encampments",
    chronicler: "Léa Lafugie (French explorer & portraitist, 1920s)",
    quote: "One of the few Western women to document the Korzok nomads and paint their ceremonial dress in the field.",
    exercise: "Deep ultramarine lake watercolor washes, Changpa portrait studies, high alpine flora drawing.",
    x: 68,
    y: 82
  }
];

// Strict Mapping of Transit Stations per Itinerary
const routeDefinitions = {
  overview: {
    title: "All Destination Overview",
    tagline: "Comprehensive Master Overview of all 7 Trans-Himalayan Stations",
    stationIds: ["sham", "leh", "nubra", "pangong", "nyoma", "hanle", "tsomoriri"],
    svgPath: "M 28 54 L 46 48 L 52 28 L 74 52 L 76 70 L 84 80 L 68 82"
  },
  "route-10": {
    title: "The First Light (10 Days)",
    tagline: "Essential Itinerary · Monasteries, Sham Village, Nubra Dunes & Pangong Tso",
    stationIds: ["leh", "sham", "nubra", "pangong"],
    svgPath: "M 46 48 L 28 54 L 52 28 L 74 52"
  },
  "route-13": {
    title: "The Heartland Passage (13 Days)",
    tagline: "Heartland Itinerary · Leh, Sham Homestay, Nubra & Pangong Tso (No Changthang leg)",
    stationIds: ["leh", "sham", "nubra", "pangong"],
    svgPath: "M 46 48 L 28 54 L 52 28 L 74 52"
  },
  "route-14": {
    title: "Beyond The Blue (14 Days)",
    tagline: "Village & Remote Passage · Alchi Homestay, Pangong, Nyoma & Chumathang",
    stationIds: ["leh", "sham", "pangong", "nyoma"],
    svgPath: "M 46 48 L 28 54 L 74 52 L 76 70"
  },
  "route-15": {
    title: "The Grand Traverse (15 Days)",
    tagline: "Master Expedition · Monasteries, Pangong, Hanle Dark Sky & Tso Moriri High Lakes",
    stationIds: ["leh", "sham", "pangong", "hanle", "tsomoriri"],
    svgPath: "M 46 48 L 28 54 L 74 52 L 84 80 L 68 82"
  }
};

const routePills = [
  { id: "overview", label: "All Destination Overview", days: "" },
  { id: "route-10", label: "10 days / The First Light", days: "10 days" },
  { id: "route-13", label: "13 days / The Heartland Passage", days: "13 days" },
  { id: "route-14", label: "14 days / Beyond The Blue", days: "14 days" },
  { id: "route-15", label: "15 days / The Grand Traverse", days: "15 days" }
];

export default function ExploreLadakh() {
  const { content } = useSiteContent();
  const [searchParams] = useSearchParams();

  // State: "overview" | "detail"
  const [activeMode, setActiveMode] = useState(
    searchParams.get("mode") === "detail" ? "detail" : "overview"
  );
  
  // Default to 13 days Heartland Passage if opened in detail, otherwise overview
  const [activeRouteId, setActiveRouteId] = useState(
    searchParams.get("route") || (searchParams.get("mode") === "detail" ? "route-13" : "overview")
  );

  const currentRoute = routeDefinitions[activeRouteId] || routeDefinitions.overview;
  const currentStations = currentRoute.stationIds
    .map((id) => allStationsData.find((s) => s.id === id))
    .filter(Boolean);

  const [activeStationId, setActiveStationId] = useState(
    searchParams.get("station") || currentStations[0]?.id || "leh"
  );

  // Guarantee selected station belongs to the current route
  const currentStation =
    currentStations.find((s) => s.id === activeStationId) || currentStations[0] || allStationsData[0];

  const handleRouteSelect = (routeId) => {
    setActiveRouteId(routeId);
    const targetRoute = routeDefinitions[routeId] || routeDefinitions.overview;
    // Auto-select first station of the selected route if current station isn't on that route
    if (!targetRoute.stationIds.includes(activeStationId)) {
      setActiveStationId(targetRoute.stationIds[0]);
    }
    if (routeId === "overview") {
      setActiveMode("overview");
    } else {
      setActiveMode("detail");
    }
  };

  const handleStationClick = (stationId) => {
    setActiveStationId(stationId);
    setActiveMode("detail");
  };

  return (
    <div className="explore-container">
      {/* Subhead Header Banner */}
      <div className="explore-subhead-banner">
        GEOGRAPHIC STORYTELLING · LADAKH TERRAIN
      </div>

      {/* MODE 1: Topography Overview (explore ladakh animation.png) */}
      {activeMode === "overview" && (
        <div className="explore-overview-grid">
          {/* Left Column: Heading & Subtitle */}
          <div className="explore-overview-left">
            <h1 className="explore-title animate-enter-1">
              {content.exploreHeading || "Topography of the Trans-Himalayas"}
            </h1>
            <p className="explore-intro-text animate-enter-2">
              {content.exploreIntro ||
                "An interactive cartographic exploration of Ladakh’s mountain sanctuaries, high passes, and endorheic lakes. Select a route to trace its path across the terrain, or inspect individual stations for their historical figures and mineral pigments."}
            </p>
          </div>

          {/* Center Column: Cartographic Map Canvas Placeholder */}
          <div className="explore-map-card animate-enter-3">
            <div className="explore-map-grid-bg">
              {/* Solid Map Canvas Placeholder */}
              <div className="explore-map-inner-placeholder">
                <svg className="explore-map-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d={currentRoute.svgPath}
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.45)"
                    strokeWidth="0.8"
                    strokeDasharray="2.5 2.5"
                  />
                </svg>

                <div className="explore-map-header-tag">
                  <span className="explore-map-canvas-label">
                    {currentRoute.title.toUpperCase()} · {currentStations.length} STATIONS
                  </span>
                  <span className="explore-map-coord-chip">
                    {currentStation.altitude} · {currentStation.region.toUpperCase()}
                  </span>
                </div>

                {/* Interactive Station Markers on Map Canvas */}
                {currentStations.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`explore-map-marker ${st.id === currentStation.id ? "active" : ""}`}
                    style={{ left: `${st.x}%`, top: `${st.y}%` }}
                    onClick={() => handleStationClick(st.id)}
                    title={`${st.name} (${st.altitude})`}
                    aria-label={`Inspect ${st.name}`}
                  >
                    <span className="explore-marker-pin-label">{st.name.split(" ")[0]}</span>
                  </button>
                ))}

                {/* Map Legend Box */}
                <div className="explore-map-legend-box">
                  <div><span>□</span> Hanga Roa</div>
                  <div><span>◎</span> Volcán</div>
                  <div><span>—</span> Camino</div>
                  <div><span>✚</span> Sitio arqueológico</div>
                  <div><span>···</span> Límite Parque</div>
                  <div><span>▲</span> Mauya</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Destination & Chronicler Cards */}
          <div className="explore-overview-right-stack animate-enter-3">
            {/* Card 1: Visual Slot */}
            <SolidPlaceholder
              slotId="exploreStationCover1"
              className="explore-overview-thumb-card"
            >
              <div className="explore-thumb-header-badge">
                <span>STATION OVERVIEW</span>
                <span className="explore-overview-region-label">{currentStation.region}</span>
              </div>
              <div className="placeholder-footer-strip">
                <span className="placeholder-footer-left">{currentStation.name}</span>
                <span className="placeholder-footer-right">{currentStation.altitude}</span>
              </div>
            </SolidPlaceholder>

            {/* Card 2: Destination Card */}
            <div className="explore-overview-blue-card">
              <h2 className="explore-overview-dest-title">{currentStation.name}</h2>
              <p className="explore-overview-dest-subtitle">{currentStation.subtitle}</p>
            </div>

            {/* Card 3: Historic Chronicler Card */}
            <div className="explore-overview-cyan-card">
              <div className="explore-overview-cyan-title">
                HISTORIC CHRONICLER · {currentStation.chronicler}
              </div>
              <p className="explore-overview-cyan-desc">“{currentStation.quote}”</p>
            </div>

            {/* Card 4: Creative Atelier Exercise Card */}
            <div className="explore-overview-cyan-card">
              <div className="explore-overview-cyan-title">CREATIVE ATELIER EXERCISE</div>
              <p className="explore-overview-cyan-desc">{currentStation.exercise}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Station / Destination Detail Layout (explore ladakh.png) */}
      {activeMode === "detail" && (
        <div className="explore-detail-grid animate-enter-3">
          {/* Center-Left Map Canvas */}
          <div className="explore-map-card">
            <div className="explore-map-grid-bg">
              <div className="explore-map-inner-placeholder">
                <svg className="explore-map-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d={currentRoute.svgPath}
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.45)"
                    strokeWidth="0.8"
                    strokeDasharray="2.5 2.5"
                  />
                </svg>

                <div className="explore-map-header-tag">
                  <span className="explore-map-canvas-label">
                    {currentRoute.title.toUpperCase()} · {currentStations.length} STATIONS
                  </span>
                  <span className="explore-map-coord-chip">
                    {currentStation.altitude} · {currentStation.region.toUpperCase()}
                  </span>
                </div>

                {/* Interactive Station Markers */}
                {currentStations.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`explore-map-marker ${st.id === currentStation.id ? "active" : ""}`}
                    style={{ left: `${st.x}%`, top: `${st.y}%` }}
                    onClick={() => setActiveStationId(st.id)}
                    title={`${st.name} (${st.altitude})`}
                    aria-label={`Select ${st.name}`}
                  >
                    <span className="explore-marker-pin-label">{st.name.split(" ")[0]}</span>
                  </button>
                ))}

                <div className="explore-map-legend-box">
                  <div><span>□</span> Hanga Roa</div>
                  <div><span>◎</span> Volcán</div>
                  <div><span>—</span> Camino</div>
                  <div><span>✚</span> Sitio arqueológico</div>
                  <div><span>···</span> Límite Parque</div>
                  <div><span>▲</span> Mauya</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Station Visual & Chronicler Info */}
          <div className="explore-detail-station-card">
            <SolidPlaceholder
              slotId="exploreStationCover1"
              className="explore-detail-thumb-slot"
            >
              <div className="explore-thumb-header-badge">
                <span>STATION FIELD STUDY</span>
                <span className="explore-overview-region-label">{currentStation.region}</span>
              </div>
              <div className="placeholder-footer-strip">
                <span className="placeholder-footer-left">{currentStation.name}</span>
                <span className="placeholder-footer-right">{currentStation.altitude}</span>
              </div>
            </SolidPlaceholder>

            <div className="explore-detail-info-pane">
              <div>
                <h2 className="explore-detail-station-name">{currentStation.name}</h2>
                <p className="explore-detail-station-sub">{currentStation.subtitle}</p>
              </div>

              <div className="explore-chronicler-block">
                <div className="explore-chronicler-label">
                  HISTORIC CHRONICLER · {currentStation.chronicler}
                </div>
                <p className="explore-chronicler-quote">“{currentStation.quote}”</p>
              </div>

              <div className="explore-exercise-block">
                <div className="explore-exercise-label">CREATIVE ATELIER EXERCISE</div>
                <p className="explore-exercise-desc">{currentStation.exercise}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Upper Visual & Station Timeline Selector */}
          <div className="explore-timeline-col">
            <SolidPlaceholder
              slotId="exploreStationCover2"
              className="explore-detail-thumb-slot"
            >
              <div className="explore-thumb-header-badge">
                <span>HISTORIC ARCHIVE</span>
                <span className="explore-overview-region-label">ALT. {currentStation.altitude}</span>
              </div>
              <div className="placeholder-footer-strip">
                <span className="placeholder-footer-left">{currentStation.chronicler.split("(")[0].trim()}</span>
                <span className="placeholder-footer-right">ARCHIVE 02</span>
              </div>
            </SolidPlaceholder>

            <div className="explore-timeline-chart-card">
              <div className="explore-timeline-header">
                <span className="explore-timeline-label">Select Transit Station</span>
                <span className="explore-station-counter">
                  {currentStations.findIndex((s) => s.id === currentStation.id) + 1} of {currentStations.length}
                </span>
              </div>

              <div className="explore-timeline-station-selector">
                {currentStations.map((st) => (
                  <div
                    key={st.id}
                    className={`explore-timeline-stop-item ${st.id === currentStation.id ? "active" : ""}`}
                    onClick={() => setActiveStationId(st.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActiveStationId(st.id);
                    }}
                  >
                    <span className="explore-stop-name">{st.name}</span>
                    <span className="explore-stop-alt">{st.altitude}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="explore-overview-btn"
                onClick={() => handleRouteSelect("overview")}
              >
                ← Back to Topography Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom 5 Pill Filter Buttons */}
      <div className="explore-bottom-pills-row animate-enter-4" role="tablist" aria-label="Route Selectors">
        {routePills.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`explore-pill-btn ${activeRouteId === p.id ? "active" : ""}`}
            onClick={() => handleRouteSelect(p.id)}
            role="tab"
            aria-selected={activeRouteId === p.id}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
