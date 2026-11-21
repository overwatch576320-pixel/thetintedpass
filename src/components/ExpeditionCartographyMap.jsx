import { useState, useRef, useEffect, useCallback } from "react";
import { Compass, Eye, Mountain, MapPin, ZoomIn, ZoomOut, RotateCcw, Layers, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";

/**
 * ExpeditionCartographyMap
 * 
 * An archival, topographic expedition map inspired by scientific field surveys
 * and architectural cartography.
 * 
 * Features:
 * - Off-white paper background with fine Cartesian survey grid and coordinate crosshairs.
 * - Topographic terrain relief with muted olive, sage, and sepia contours of Ladakh.
 * - Indus, Shyok, Nubra, and Zanskar river systems + Pangong Tso & Tso Moriri lakes.
 * - Muted crimson route system with solid active transit lines & dashed high-pass trails.
 * - Concentric pass symbols (◎), monastery crosses (+), base atelier squares (□), and pass triangles (▲).
 * - Monastic sightline corridors (Relación visual) radiating from Leh.
 * - Authentic cartographic technical legend box.
 * - Interactive pan & zoom with touch pinch/drag support.
 * - Seamless desktop and mobile adaptation.
 */

// Master geographic database of Ladakh stations, passes, and landmarks
export const CARTOGRAPHY_STATIONS = [
  {
    id: "leh",
    name: "Leh Central Atelier",
    localName: "Gle / གླེ",
    alt: "3,524 m",
    altNum: 3524,
    x: 460,
    y: 350,
    type: "base", // [□] Base
    region: "Central Indus Valley",
    coords: "34°09′ N, 77°34′ E",
    desc: "Ancient crossroads of Silk Road and trans-Himalayan salt caravans. Seat of the 17th-century nine-storey Leh Palace.",
    chronicler: "William Simpson (1860 Victorian watercolorist)",
    quote: "Simpson traversed the passes with portable brass water tins, painting Leh's tiered stupas beside the Namgyal crag.",
    exercise: "Street sketching in the mud-brick alleyways; architectural rhythms of palace timberwork; brass and apricot still-life."
  },
  {
    id: "sham",
    name: "Alchi & Basgo",
    localName: "A-lchi / ཨ་ལྕི",
    alt: "3,120 m",
    altNum: 3120,
    x: 290,
    y: 368,
    type: "monastery", // [+] Cross
    region: "Lower Indus / Sham",
    coords: "34°13′ N, 77°10′ E",
    desc: "11th-century Kashmiri-Buddhist wall fresco archives founded by Lotsawa Rinchen Zangpo amidst ancient apricot groves.",
    chronicler: "Lotsawa Rinchen Zangpo (c. 996 CE)",
    quote: "Master Kashmiri painters ground lapis lazuli and riverbed red ochre onto mud-plaster walls to record the sacred mandalas.",
    exercise: "Mural tonal drawing; hand-mulling natural lapis and cinnabar; village homestay courtyard studies."
  },
  {
    id: "lamayuru",
    name: "Lamayuru Gompa",
    localName: "G-yung-drung",
    alt: "3,510 m",
    altNum: 3510,
    x: 180,
    y: 350,
    type: "monastery",
    region: "Western Sham Gateway",
    coords: "34°17′ N, 76°46′ E",
    desc: "Perched high above the surreal, eroded lacustrine sediment formations known as 'Moonland'.",
    chronicler: "Naropa (11th c. Mahasiddha)",
    quote: "Tradition holds that a dried glacial lake gave rise to the monastery's dramatic sandstone pinnacles.",
    exercise: "Plein air geological washes; fast-drying gouache studies of eroded cliff strata."
  },
  {
    id: "khardungla",
    name: "Khardung La",
    localName: "Khar-rdzong La",
    alt: "5,359 m",
    altNum: 5359,
    x: 470,
    y: 260,
    type: "pass", // [◎] Concentric circle
    region: "Ladakh Range Crest",
    coords: "34°16′ N, 77°36′ E",
    desc: "One of the highest motorable mountain passes in the world, linking the Indus valley to the remote Nubra and Shyok valleys.",
    chronicler: "Silk Road Caravaners",
    quote: "A perilous gateway across glaciated granite where prayer flags whip violently in thin, freezing air.",
    exercise: "Quick charcoal line study from vehicle; rapid temperature perception notes."
  },
  {
    id: "nubra",
    name: "Diskit & Hunder",
    localName: "Lde-skyid / ལྡེ་སྐྱིད",
    alt: "3,100 m",
    altNum: 3100,
    x: 480,
    y: 175,
    type: "station", // [▲] Triangle
    region: "Nubra & Shyok Valleys",
    coords: "34°34′ N, 77°33′ E",
    desc: "Cold-desert sand dunes, silver buckthorn groves, and double-humped Bactrian camel corridors under the 14th-century cliff monastery.",
    chronicler: "Mirza Muhammad Haidar Dughlat (16th c.)",
    quote: "Wrote in the Tarikh-i-Rashidi of entering a sunlit river oasis between jagged snowy horns.",
    exercise: "Shadow angles across wind-sculpted dunes; Diskit cliff monastery silhouette at golden hour."
  },
  {
    id: "changla",
    name: "Chang La",
    localName: "Lchang La",
    alt: "5,360 m",
    altNum: 5360,
    x: 610,
    y: 315,
    type: "pass",
    region: "Changthang Gateway",
    coords: "34°02′ N, 77°55′ E",
    desc: "The formidable high-altitude pass spanning the Ladakh Range toward the vast eastern plateau of Tibet.",
    chronicler: "Father Ippolito Desideri (1715)",
    quote: "Noted the intense ultraviolet light and sheer silence at the high pass summit.",
    exercise: "High-contrast ink washes of snowy cirques and scree ridges."
  },
  {
    id: "pangong",
    name: "Pangong Tso",
    localName: "Spang-gong Mtsho",
    alt: "4,250 m",
    altNum: 4250,
    x: 770,
    y: 285,
    type: "station",
    region: "Changthang Frontier",
    coords: "33°45′ N, 78°40′ E",
    desc: "134-km endorheic saltwater lake with dramatic optical gradient washes shifting from pale aquamarine to midnight cobalt.",
    chronicler: "Sogdian Silk Road Merchants (8th c.)",
    quote: "Carved ancient rock petroglyphs at Tangtse marking their safe arrival at the salt water shores.",
    exercise: "Ultramarine and cobalt mineral gradient studies; dawn reflection washes on Arches 300gsm cold-press paper."
  },
  {
    id: "chumathang",
    name: "Chumathang",
    localName: "Chu-ma-thang",
    alt: "4,050 m",
    altNum: 4050,
    x: 660,
    y: 440,
    type: "waypoint", // [●] Dot
    region: "Upper Indus Valley",
    coords: "33°21′ N, 78°20′ E",
    desc: "Geothermal hot springs steaming directly beside the crystal waters of the upper Indus river canyon.",
    chronicler: "Sven Hedin (1906 Swedish geographer)",
    quote: "Surveyed the mineral steam vents and documented the temperature differentials of the high river.",
    exercise: "Atmospheric steam studies against sharp dark granite cliff faces."
  },
  {
    id: "nyoma",
    name: "Nyoma & Mudh",
    localName: "Nyo-ma",
    alt: "4,180 m",
    altNum: 4180,
    x: 760,
    y: 480,
    type: "station",
    region: "Southern Changthang",
    coords: "33°11′ N, 78°39′ E",
    desc: "Open nomadic grassland plateau beside the meandering Indus; seasonal grazing territories of the Changpa pastoralists.",
    chronicler: "Changpa Pastoral Traditions",
    quote: "A landscape measured by the seasonal migrations of pashmina goat herds and black yak-wool tents (Rebo).",
    exercise: "Expansive wide-angle horizon sketches; drybrush texture studies of nomadic yak hair tents."
  },
  {
    id: "hanle",
    name: "Hanle Dark Sky Reserve",
    localName: "An-le / ཝཱན་ལེ",
    alt: "4,300 m",
    altNum: 4300,
    x: 880,
    y: 535,
    type: "station",
    region: "Remote Changthang",
    coords: "32°46′ N, 78°58′ E",
    desc: "Remote historical monastery perched on a lone crag amidst a vast desert valley, now home to India's premier Dark Sky Sanctuary.",
    chronicler: "King Sengge Namgyal (1624)",
    quote: "Established the Hanle Gompa under the guidance of master Lama Stag-tsang-ras-pa.",
    exercise: "Nocturne painting with charcoal and white gouache; deep indigo washes of the celestial Milky Way core."
  },
  {
    id: "tsomoriri",
    name: "Tso Moriri (Korzok)",
    localName: "Mtsho Mo-ri-ri",
    alt: "4,522 m",
    altNum: 4522,
    x: 695,
    y: 585,
    type: "station",
    region: "Rupshu Plateau",
    coords: "32°54′ N, 78°18′ E",
    desc: "Sacred high-altitude saline wetland sanctuary cradled between 6,000-metre glaciated peaks; ancient Korzok monastery on the northern bluff.",
    chronicler: "Léa Lafugie (1920s French portraitist)",
    quote: "Painted portraits of the Korzok nomads wearing heavy turquoise Perak headdresses and wool chubas.",
    exercise: "Intense cobalt watercolor wash; portrait sketch of Changpa elders in natural side-light."
  },
  {
    id: "tsokar",
    name: "Tso Kar Salt Basin",
    localName: "Mtsho Dkar",
    alt: "4,530 m",
    altNum: 4530,
    x: 590,
    y: 530,
    type: "pass",
    region: "Rupshu Mineral Plains",
    coords: "33°18′ N, 78°00′ E",
    desc: "Brackish salt lake surrounded by glistening white saline mineral crusts and breeding grounds for the endangered black-necked crane.",
    chronicler: "Traditional Salt Caravans",
    quote: "Centuries-old salt trade trail connecting Changthang salt miners to the lower valleys of Ladakh and Spiti.",
    exercise: "Dry mineral gouache on unprimed rough paper; capturing white salt crust refraction."
  },
  {
    id: "tanglangla",
    name: "Tanglang La",
    localName: "Thang-lang La",
    alt: "5,328 m",
    altNum: 5328,
    x: 545,
    y: 485,
    type: "pass",
    region: "Manali-Leh Meridian",
    coords: "33°30′ N, 77°45′ E",
    desc: "High Himalayan mountain pass linking the Indus valley to the high Changthang plains and Spiti.",
    chronicler: "High Pass Expeditions",
    quote: "The final crest of the southern plateau before descending into the fertile willow groves of Upshi.",
    exercise: "Fast brush ink sketch of hairpin switchbacks descending through scree slopes."
  },
  {
    id: "stok",
    name: "Stok Kangri & Palace",
    localName: "Stok / སྟོག",
    alt: "6,153 m / 3,650 m",
    altNum: 6153,
    x: 445,
    y: 425,
    type: "monastery",
    region: "Indus Southern Bank",
    coords: "34°00′ N, 77°32′ E",
    desc: "The royal seat of the Namgyal dynasty and the soaring pyramidal summit dominating the southern skyline of Leh.",
    chronicler: "Royal Chronicles of Ladakh",
    quote: "The permanent snow-mantled beacon guiding travelers across the high Trans-Himalayan horizons.",
    exercise: "Mountain geometry studies; planar analysis of peak illumination at dawn."
  },
  {
    id: "thiksey",
    name: "Thiksey & Hemis Gompas",
    localName: "Khrig-tse / ཁྲིག་ཙེ",
    alt: "3,650 m",
    altNum: 3650,
    x: 520,
    y: 395,
    type: "monastery",
    region: "Central Indus Valley",
    coords: "34°03′ N, 77°40′ E",
    desc: "12-tiered monastery rising grandly above the Indus floodplain, and the hidden gorge sanctuary of Hemis.",
    chronicler: "Andrew Harvey & Nicholas Roerich",
    quote: "A monumental tiered pyramid of whitewashed stone resembling Tibet's Potala Palace.",
    exercise: "Courtyard architecture drawing; golden-hour light across whitewashed monastery tiers."
  }
];

// Verified transit routes connecting the stations
export const CARTOGRAPHY_ROUTES = {
  overview: {
    id: "overview",
    title: "Master Trans-Himalayan Survey",
    tagline: "Comprehensive Master Overview of all 4 Expeditions across Ladakh",
    color: "#b91c1c",
    dashedColor: "#991b1b",
    segments: [
      // Primary trunk lines
      "M 290 368 L 460 350 L 520 395 L 660 440 L 760 480 L 880 535", // Indus valley highway
      "M 460 350 L 470 260 L 480 175", // Khardung La to Nubra
      "M 520 395 L 610 315 L 770 285", // Chang La to Pangong
      "M 760 480 L 695 585", // Nyoma to Tso Moriri
      "M 695 585 L 590 530 L 545 485 L 520 395", // Tso Moriri to Tso Kar to Upshi
      "M 290 368 L 180 350" // Alchi to Lamayuru
    ],
    highPassSegments: [
      "M 470 260 L 480 175", // Khardung La crest
      "M 610 315 L 770 285", // Chang La crest
      "M 590 530 L 545 485"  // Tanglang La crest
    ],
    stationIds: ["leh", "sham", "lamayuru", "khardungla", "nubra", "changla", "pangong", "chumathang", "nyoma", "hanle", "tsomoriri", "tsokar", "tanglangla", "stok", "thiksey"]
  },
  "first-light": {
    id: "first-light",
    title: "The First Light (10 Days)",
    tagline: "Essential Itinerary · Monasteries, Sham Village, Nubra Dunes & Pangong Tso",
    color: "#b91c1c",
    segments: [
      "M 460 350 L 290 368", // Leh to Alchi
      "M 290 368 L 460 350 L 470 260 L 480 175", // Alchi back to Leh then over Khardung La to Diskit
      "M 480 175 Q 600 230 610 315 L 770 285", // Nubra-Shyok transit to Chang La and Pangong
      "M 770 285 L 610 315 L 520 395 L 460 350" // Pangong to Leh via Thiksey
    ],
    highPassSegments: [
      "M 460 350 L 470 260 L 480 175",
      "M 610 315 L 770 285"
    ],
    stationIds: ["leh", "sham", "khardungla", "nubra", "changla", "pangong", "thiksey"]
  },
  "heartland": {
    id: "heartland",
    title: "The Heartland Passage (13 Days)",
    tagline: "Heartland Itinerary · Leh, Sham Homestay, Nubra & Pangong (No Changthang leg)",
    color: "#b91c1c",
    segments: [
      "M 460 350 L 520 395", // Leh to Thiksey
      "M 460 350 L 290 368", // Leh to Alchi
      "M 290 368 L 460 350 L 470 260 L 480 175", // To Nubra
      "M 480 175 Q 600 230 610 315 L 770 285", // To Pangong
      "M 770 285 L 610 315 L 460 350" // Back to Leh
    ],
    highPassSegments: [
      "M 470 260 L 480 175",
      "M 610 315 L 770 285"
    ],
    stationIds: ["leh", "thiksey", "sham", "khardungla", "nubra", "changla", "pangong"]
  },
  "beyond-the-blue": {
    id: "beyond-the-blue",
    title: "Beyond the Blue Horizon (14 Days)",
    tagline: "Village & Remote Passage · Alchi Homestay, Pangong, Nyoma & Chumathang",
    color: "#b91c1c",
    segments: [
      "M 460 350 L 290 368",
      "M 290 368 L 460 350 L 610 315 L 770 285", // Leh to Pangong
      "M 770 285 Q 730 380 660 440 L 760 480", // Pangong south to Chumathang & Nyoma
      "M 760 480 L 660 440 L 520 395 L 460 350" // Upper Indus return to Leh
    ],
    highPassSegments: [
      "M 610 315 L 770 285",
      "M 770 285 Q 730 380 660 440"
    ],
    stationIds: ["leh", "sham", "changla", "pangong", "chumathang", "nyoma", "thiksey"]
  },
  "grand-traverse": {
    id: "grand-traverse",
    title: "Grand Trans-Himalayan Traverse (15 Days)",
    tagline: "Master Expedition · Monasteries, Pangong, Hanle Dark Sky & Tso Moriri High Lakes",
    color: "#b91c1c",
    segments: [
      "M 460 350 L 290 368 L 180 350", // Leh to Alchi & Lamayuru
      "M 180 350 L 460 350 L 610 315 L 770 285", // To Pangong
      "M 770 285 Q 740 370 660 440 L 760 480 L 880 535", // Pangong to Chumathang, Nyoma & Hanle
      "M 880 535 L 760 480 L 695 585", // Hanle to Tso Moriri
      "M 695 585 L 590 530 L 545 485 L 520 395 L 460 350" // Tso Moriri to Tso Kar & Tanglang La to Leh
    ],
    highPassSegments: [
      "M 610 315 L 770 285",
      "M 590 530 L 545 485"
    ],
    stationIds: ["leh", "sham", "lamayuru", "changla", "pangong", "chumathang", "nyoma", "hanle", "tsomoriri", "tsokar", "tanglangla", "thiksey", "stok"]
  }
};

export default function ExpeditionCartographyMap({
  activeRouteId = "overview",
  selectedStationId = "leh",
  onSelectStation,
  onSelectRoute,
  className = ""
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return false;
    return true;
  });
  const [hoveredStation, setHoveredStation] = useState(null);

  const routeKeyMap = {
    "overview": "overview",
    "route-10": "first-light",
    "first-light": "first-light",
    "route-13": "heartland",
    "heartland": "heartland",
    "route-14": "beyond-the-blue",
    "beyond-the-blue": "beyond-the-blue",
    "route-15": "grand-traverse",
    "grand-traverse": "grand-traverse"
  };
  const resolvedRouteKey = routeKeyMap[activeRouteId] || "overview";

  // Active route & current stations
  const route = CARTOGRAPHY_ROUTES[resolvedRouteKey] || CARTOGRAPHY_ROUTES.overview;
  const isAllOverview = resolvedRouteKey === "overview";
  const selectedStation =
    CARTOGRAPHY_STATIONS.find((s) => s.id === selectedStationId) ||
    CARTOGRAPHY_STATIONS[0];

  // Pan & Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2.4, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.85, z - 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    // Only drag on map surface, not buttons
    if (e.target.closest("button") || e.target.closest(".carto-legend-panel")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.12 : -0.12;
      setZoom((z) => Math.max(0.85, Math.min(2.4, z + delta)));
    }
  };

  // Touch handlers for mobile
  const touchStartRef = useRef({ x: 0, y: 0, dist: 0 });
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
        dist: 0
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - touchStartRef.current.x,
        y: e.touches[0].clientY - touchStartRef.current.y
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartRef.current.dist;
      touchStartRef.current.dist = dist;
      setZoom((z) => Math.max(0.85, Math.min(2.4, z * factor)));
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Center on station when clicked
  const handleStationClick = (st) => {
    if (onSelectStation) {
      onSelectStation(st.id);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`cartography-map-container ${className} ${isDragging ? "is-panning" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Ladakh Expedition Topographic Cartography Map"
    >
      {/* Floating Viewport Controls (Top Right) */}
      <div className="carto-toolbar">
        <button
          type="button"
          className="carto-tool-btn"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          className="carto-tool-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          type="button"
          className="carto-tool-btn"
          onClick={handleResetView}
          title="Reset Survey Alignment"
          aria-label="Reset map view"
        >
          <RotateCcw size={14} />
        </button>
        <button
          type="button"
          className={`carto-tool-btn legend-toggle ${showLegend ? "active" : ""}`}
          onClick={() => setShowLegend(!showLegend)}
          title="Toggle Cartographic Legend"
          aria-label="Toggle legend"
        >
          <Layers size={14} />
          <span className="carto-btn-label">Legend</span>
        </button>
      </div>

      {/* Main Topographic Map Canvas */}
      <div
        className="carto-canvas-transform-wrapper"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center"
        }}
      >
        <svg
          className="carto-svg-map"
          viewBox="0 0 1000 680"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Archival Parchment Texture Pattern */}
            <radialGradient id="cartoPaperWash" cx="50%" cy="48%" r="62%">
              <stop offset="0%" stopColor="#fdfbf7" />
              <stop offset="65%" stopColor="#f8f5ee" />
              <stop offset="100%" stopColor="#f2eee4" />
            </radialGradient>

            {/* Topographic Shaded Relief Gradients (Muted Olive & Earth Tones) */}
            <linearGradient id="indusValleyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e3dfd3" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ece7dc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#dad5c6" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="ridgeShadeOlive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#768370" stopOpacity="0.28" />
              <stop offset="40%" stopColor="#96a390" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#55614f" stopOpacity="0.35" />
            </linearGradient>

            <linearGradient id="lakePangongWash" x1="0%" y1="0%" x2="100%" y2="30%">
              <stop offset="0%" stopColor="#5b8694" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#3d6c7d" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#244d5e" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="lakeMoririWash" x1="0%" y1="0%" x2="40%" y2="100%">
              <stop offset="0%" stopColor="#2c556b" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#1a3b4e" stopOpacity="0.96" />
            </linearGradient>

            {/* Soft terracotta wash for Hemis Sanctuary */}
            <radialGradient id="sanctuaryWash" cx="48%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#c23b38" stopOpacity="0.08" />
              <stop offset="80%" stopColor="#c23b38" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#c23b38" stopOpacity="0" />
            </radialGradient>

            {/* Subtle glow filter for active route */}
            <filter id="routeCrimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#b91c1c" floodOpacity="0.35" />
            </filter>

            {/* Fine Cartographic Grid Pattern */}
            <pattern id="cartoGridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(120, 113, 100, 0.15)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* 1. Archival Paper Ground */}
          <rect width="1000" height="680" fill="url(#cartoPaperWash)" />

          {/* 2. Technical Cartesian Coordinate Survey Grid */}
          <rect width="1000" height="680" fill="url(#cartoGridPattern)" />

          {/* 3. Major Coordinate Crosshairs (+) at Grid Intersections */}
          <g stroke="rgba(100, 95, 85, 0.35)" strokeWidth="0.75" fill="none">
            {[150, 350, 550, 750, 900].map((gx) =>
              [140, 290, 440, 590].map((gy) => (
                <path
                  key={`${gx}-${gy}`}
                  d={`M ${gx - 4} ${gy} L ${gx + 4} ${gy} M ${gx} ${gy - 4} L ${gx} ${gy + 4}`}
                />
              ))
            )}
          </g>

          {/* 4. Large Circular Boundary Reference Ring (Inspired by Reference Image) */}
          <circle
            cx="480"
            cy="360"
            r="320"
            fill="none"
            stroke="#c23b38"
            strokeWidth="0.8"
            strokeDasharray="6 6"
            opacity="0.55"
          />
          <circle
            cx="480"
            cy="360"
            r="160"
            fill="none"
            stroke="rgba(194, 59, 56, 0.25)"
            strokeWidth="0.6"
            strokeDasharray="4 4"
          />

          {/* 5. TOPOGRAPHIC TERRAIN RELIEF (Mountains, Ridges & Shading) */}
          <g className="carto-terrain-relief">
            {/* Ladakh Mountain Massif (Northern Ridge) */}
            <path
              d="M 280 280 C 350 240, 420 220, 470 240 C 530 220, 600 240, 680 270 C 650 310, 580 300, 520 310 C 450 320, 360 320, 280 280 Z"
              fill="url(#ridgeShadeOlive)"
              stroke="#6b7764"
              strokeWidth="0.5"
            />
            {/* Zanskar Mountain Massif (Southern Ridge) */}
            <path
              d="M 220 440 C 300 420, 390 410, 460 430 C 520 450, 580 440, 630 470 C 580 540, 480 550, 400 530 C 320 520, 240 500, 220 440 Z"
              fill="url(#ridgeShadeOlive)"
              stroke="#6b7764"
              strokeWidth="0.5"
            />
            {/* Karakoram / Shyok Northern Foothills */}
            <path
              d="M 380 140 C 440 120, 510 100, 580 120 C 660 140, 750 160, 800 180 C 740 210, 620 200, 520 180 C 440 170, 390 160, 380 140 Z"
              fill="url(#ridgeShadeOlive)"
              stroke="#6b7764"
              strokeWidth="0.5"
            />
            {/* Changthang Undulating Plateau Base */}
            <path
              d="M 640 380 C 720 340, 810 360, 920 420 C 950 510, 870 580, 780 590 C 700 580, 650 510, 640 450 Z"
              fill="#ece8dc"
              stroke="#7c8874"
              strokeWidth="0.5"
              opacity="0.6"
            />

            {/* Hemis National Park Protected Sanctuary Zone */}
            <path
              d="M 390 380 Q 450 490 540 490 Q 600 460 590 400 Q 530 370 450 370 Z"
              fill="url(#sanctuaryWash)"
              stroke="#c23b38"
              strokeWidth="0.75"
              strokeDasharray="4 3"
            />
            <text
              x="475"
              y="445"
              fill="#b91c1c"
              fontFamily="var(--font-mono, monospace)"
              fontSize="7"
              letterSpacing="0.1em"
              opacity="0.65"
              textAnchor="middle"
            >
              HEMIS HIGH-ALTITUDE SANCTUARY (WILDLIFE RESERVE)
            </text>
          </g>

          {/* 6. DELICATE TOPOGRAPHIC CONTOUR LINES (Elevation Curves) */}
          <g stroke="rgba(110, 118, 105, 0.42)" strokeWidth="0.5" fill="none" className="carto-contours">
            {/* Stok Kangri Summit Contour Rings */}
            <ellipse cx="445" cy="425" rx="38" ry="24" />
            <ellipse cx="445" cy="425" rx="26" ry="16" />
            <ellipse cx="445" cy="425" rx="14" ry="9" strokeWidth="0.7" />
            <ellipse cx="445" cy="425" rx="5" ry="3.5" stroke="#b91c1c" strokeWidth="0.8" />
            <text x="445" y="416" fill="#78716c" fontSize="5.5" fontFamily="var(--font-mono)" textAnchor="middle">6,000m</text>

            {/* Khardung La Pass Contour Rings */}
            <ellipse cx="470" cy="260" rx="42" ry="22" />
            <ellipse cx="470" cy="260" rx="28" ry="14" />
            <ellipse cx="470" cy="260" rx="15" ry="8" strokeWidth="0.7" />
            <ellipse cx="470" cy="260" rx="6" ry="3.5" stroke="#b91c1c" strokeWidth="0.8" />
            <text x="470" y="252" fill="#78716c" fontSize="5.5" fontFamily="var(--font-mono)" textAnchor="middle">5,359m</text>

            {/* Chang La Pass Contour Rings */}
            <ellipse cx="610" cy="315" rx="36" ry="20" />
            <ellipse cx="610" cy="315" rx="22" ry="12" />
            <ellipse cx="610" cy="315" rx="10" ry="6" stroke="#b91c1c" strokeWidth="0.8" />
            <text x="610" y="306" fill="#78716c" fontSize="5.5" fontFamily="var(--font-mono)" textAnchor="middle">5,360m</text>

            {/* Tanglang La Pass Contour Rings */}
            <ellipse cx="545" cy="485" rx="34" ry="18" />
            <ellipse cx="545" cy="485" rx="20" ry="11" />
            <ellipse cx="545" cy="485" rx="8" ry="5" stroke="#b91c1c" strokeWidth="0.8" />
            <text x="545" y="477" fill="#78716c" fontSize="5.5" fontFamily="var(--font-mono)" textAnchor="middle">5,328m</text>

            {/* Meandering Landscape Elevation Contours */}
            <path d="M 220 320 Q 320 330 400 300 T 560 280 T 720 250" />
            <path d="M 200 300 Q 300 310 390 280 T 550 260 T 700 230" strokeWidth="0.65" />
            <path d="M 240 340 Q 340 350 420 330 T 580 320 T 740 300" />
            <path d="M 250 420 Q 330 450 420 450 T 560 420 T 680 410" />
            <path d="M 230 450 Q 310 480 400 480 T 540 450 T 670 440" strokeWidth="0.65" />
            <path d="M 210 480 Q 290 510 380 510 T 520 480 T 650 470" />
            <path d="M 370 180 Q 450 195 530 180 T 690 190 T 820 220" />
            <path d="M 350 160 Q 440 175 520 160 T 680 170 T 800 200" strokeWidth="0.65" />
            <path d="M 640 490 Q 720 520 810 520 T 920 540" />
            <path d="M 620 520 Q 700 550 790 550 T 900 570" strokeWidth="0.65" />
          </g>

          {/* 7. WATER BODIES (Indus River, Shyok, Zanskar & High Lakes) */}
          <g className="carto-water-systems">
            {/* Pangong Tso Lake Body */}
            <path
              d="M 720 305 C 750 285, 790 280, 840 270 C 890 260, 940 255, 980 250 C 970 262, 920 275, 870 282 C 810 295, 760 305, 730 315 Z"
              fill="url(#lakePangongWash)"
              stroke="#2c5a6b"
              strokeWidth="0.75"
            />
            {/* Pangong Depth Ripples */}
            <path d="M 770 285 Q 820 275 880 268" stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" strokeDasharray="3 2" fill="none" />
            <text x="830" y="295" fill="#1e3a47" fontSize="7" fontStyle="italic" fontFamily="var(--font-display)" fontWeight="600">
              Pangong Tso · 4,250 m
            </text>

            {/* Tso Moriri Lake Body */}
            <ellipse
              cx="695"
              cy="585"
              rx="16"
              ry="32"
              transform="rotate(-15 695 585)"
              fill="url(#lakeMoririWash)"
              stroke="#1a3b4e"
              strokeWidth="0.75"
            />
            <text x="695" y="628" fill="#1e3a47" fontSize="6.5" fontStyle="italic" fontFamily="var(--font-display)" fontWeight="600" textAnchor="middle">
              Tso Moriri · 4,522 m
            </text>

            {/* Tso Kar White Salt Crust Basin */}
            <ellipse
              cx="590"
              cy="530"
              rx="18"
              ry="11"
              fill="#faf6ee"
              stroke="#b5ad9e"
              strokeWidth="0.75"
              strokeDasharray="2 2"
            />
            <text x="590" y="533" fill="#78716c" fontSize="5.5" fontStyle="italic" fontFamily="var(--font-mono)" textAnchor="middle">
              Tso Kar (Saline Basin)
            </text>

            {/* Indus River (Main Valley Furrow) */}
            <path
              d="M 940 500 Q 850 490 760 480 T 660 440 T 560 395 T 460 365 T 360 370 T 290 372 T 140 330"
              fill="none"
              stroke="#588599"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Shyok River */}
            <path
              d="M 860 160 Q 750 200 660 210 T 540 185 T 480 180 T 360 150"
              fill="none"
              stroke="#588599"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            {/* Nubra River */}
            <path
              d="M 540 90 Q 510 140 480 180"
              fill="none"
              stroke="#588599"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            {/* Zanskar River Canyon */}
            <path
              d="M 360 370 Q 330 450 310 530 T 230 630"
              fill="none"
              stroke="#588599"
              strokeWidth="1.0"
              strokeLinecap="round"
            />

            {/* River annotations */}
            <text x="380" y="362" fill="#486f80" fontSize="5.5" fontStyle="italic" fontFamily="var(--font-mono)">
              Indus River (Sengge Zangpo) →
            </text>
            <text x="600" y="200" fill="#486f80" fontSize="5" fontStyle="italic" fontFamily="var(--font-mono)">
              Shyok River →
            </text>
            <text x="340" y="460" fill="#486f80" fontSize="5" fontStyle="italic" fontFamily="var(--font-mono)">
              Zanskar Gorge ↓
            </text>
          </g>

          {/* 8. VISUAL SIGHTLINE RAYS (Relación visual / Sightline of Seeing) */}
          <g className="carto-sightlines" stroke="#c23b38" strokeWidth="0.65" fill="none">
            {/* Sightline 1: Leh Base to Khardung La Pass */}
            <path d="M 460 350 L 470 260" strokeDasharray="3 3" opacity="0.65" />
            <polygon points="460,350 464,260 476,260" fill="rgba(194, 59, 56, 0.04)" stroke="none" />
            
            {/* Sightline 2: Leh Base to Chang La & Pangong Gateway */}
            <path d="M 460 350 L 610 315" strokeDasharray="3 3" opacity="0.65" />
            <polygon points="460,350 605,308 615,322" fill="rgba(194, 59, 56, 0.04)" stroke="none" />

            {/* Sightline 3: Leh Base to Stok Kangri Summit */}
            <path d="M 460 350 L 445 425" strokeDasharray="3 3" opacity="0.65" />
            <polygon points="460,350 440,422 450,428" fill="rgba(194, 59, 56, 0.04)" stroke="none" />

            {/* Sightline labels with eye icons */}
            <g transform="translate(525, 326)">
              <Eye size={9} color="#b91c1c" />
              <text x="13" y="7" fill="#b91c1c" fontSize="5" fontFamily="var(--font-mono)" letterSpacing="0.06em">
                Visual Corridor: Chang La Gateway
              </text>
            </g>
            <g transform="translate(470, 305)">
              <Eye size={8} color="#b91c1c" />
              <text x="11" y="6.5" fill="#b91c1c" fontSize="5" fontFamily="var(--font-mono)" letterSpacing="0.06em">
                Pass Sightline
              </text>
            </g>
          </g>

          {/* 9. EXPEDITION TRANSIT ROUTES IN MUTED CRIMSON */}
          <g className="carto-routes">
            {/* A. Inactive/Overview routes (dimmed or subtle) */}
            {Object.entries(CARTOGRAPHY_ROUTES).map(([key, r]) => {
              if (key === activeRouteId) return null;
              return (
                <g key={`inactive-${key}`} opacity="0.22" stroke="#b91c1c" fill="none">
                  {r.segments.map((seg, i) => (
                    <path key={i} d={seg} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                </g>
              );
            })}

            {/* B. Active Route Lines (Highlighted Muted Crimson) */}
            <g
              stroke={route.color || "#b91c1c"}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#routeCrimsonGlow)"
            >
              {route.segments.map((seg, i) => (
                <path
                  key={`act-${i}`}
                  d={seg}
                  strokeWidth="2.0"
                  className="carto-active-route-path"
                />
              ))}

              {/* Dashed High-Pass Segments */}
              {route.highPassSegments &&
                route.highPassSegments.map((seg, i) => (
                  <path
                    key={`pass-${i}`}
                    d={seg}
                    strokeWidth="2.2"
                    strokeDasharray="4 3"
                    stroke={route.dashedColor || "#991b1b"}
                  />
                ))}
            </g>

            {/* Route Name Annotations along path */}
            <text
              x="360"
              y="384"
              fill="#b91c1c"
              fontSize="5.5"
              fontFamily="var(--font-mono)"
              letterSpacing="0.08em"
              fontWeight="700"
            >
              Camino Indus - Sham →
            </text>
            <text
              x="535"
              y="235"
              fill="#b91c1c"
              fontSize="5"
              fontFamily="var(--font-mono)"
              letterSpacing="0.08em"
              fontWeight="700"
              transform="rotate(-25 535 235)"
            >
              Passage Khardung La →
            </text>
            <text
              x="675"
              y="320"
              fill="#b91c1c"
              fontSize="5"
              fontFamily="var(--font-mono)"
              letterSpacing="0.08em"
              fontWeight="700"
              transform="rotate(-10 675 320)"
            >
              Camino Chang La - Pangong →
            </text>
          </g>

          {/* 10. CARTOGRAPHIC DESTINATION & PASS MARKERS */}
          <g className="carto-markers">
            {CARTOGRAPHY_STATIONS.map((st) => {
              const isSelected = st.id === selectedStation.id;
              const isHovered = hoveredStation === st.id;
              const isIncludedInRoute = isAllOverview || route.stationIds.includes(st.id);

              return (
                <g
                  key={st.id}
                  transform={`translate(${st.x}, ${st.y})`}
                  className={`carto-station-node ${isSelected ? "selected" : ""} ${isIncludedInRoute ? "active-route-station" : "dimmed"}`}
                  onClick={() => handleStationClick(st)}
                  onMouseEnter={() => setHoveredStation(st.id)}
                  onMouseLeave={() => setHoveredStation(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Selection Aura */}
                  {isSelected && (
                    <circle
                      r="16"
                      fill="rgba(185, 28, 28, 0.12)"
                      stroke="#b91c1c"
                      strokeWidth="0.75"
                      strokeDasharray="2 2"
                      className="carto-marker-aura"
                    />
                  )}

                  {/* Custom Cartographic Symbols matching reference image */}
                  {/* TYPE 1: Central Atelier Base -> Outlined Red Square [□] */}
                  {st.type === "base" && (
                    <g>
                      <rect
                        x="-7"
                        y="-7"
                        width="14"
                        height="14"
                        fill="#fdfbf7"
                        stroke="#b91c1c"
                        strokeWidth="1.6"
                      />
                      <rect x="-3" y="-3" width="6" height="6" fill="#b91c1c" />
                    </g>
                  )}

                  {/* TYPE 2: High Passes & Summits -> Concentric Red Double-Circles [◎] */}
                  {st.type === "pass" && (
                    <g>
                      <circle r="7.5" fill="#fdfbf7" stroke="#b91c1c" strokeWidth="1.4" />
                      <circle r="4.2" fill="none" stroke="#b91c1c" strokeWidth="1.2" />
                      <circle r="1.6" fill="#b91c1c" />
                    </g>
                  )}

                  {/* TYPE 3: Ancient Monasteries & Murals -> Red Cross Markers [+] */}
                  {st.type === "monastery" && (
                    <g>
                      <circle r="6" fill="#fdfbf7" stroke="#b91c1c" strokeWidth="0.6" opacity="0.6" />
                      <path
                        d="M -4 0 L 4 0 M 0 -4 L 0 4"
                        stroke="#b91c1c"
                        strokeWidth="1.8"
                        strokeLinecap="square"
                      />
                    </g>
                  )}

                  {/* TYPE 4: Stations & Lakes -> Outlined Red Triangles [▲] */}
                  {st.type === "station" && (
                    <g>
                      <polygon
                        points="0,-7 6.5,4.5 -6.5,4.5"
                        fill="#fdfbf7"
                        stroke="#b91c1c"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <circle cx="0" cy="0.5" r="1.5" fill="#b91c1c" />
                    </g>
                  )}

                  {/* TYPE 5: Waypoints -> Subtle Red Dot */}
                  {st.type === "waypoint" && (
                    <g>
                      <circle r="4.5" fill="#fdfbf7" stroke="#b91c1c" strokeWidth="1.2" />
                      <circle r="2" fill="#b91c1c" />
                    </g>
                  )}

                  {/* Elegant Cartographic Labels & Leader Lines */}
                  <g className="carto-station-label-group">
                    {/* Small Leader Line when needed */}
                    <line x1="8" y1="-8" x2="16" y2="-12" stroke="#b91c1c" strokeWidth="0.5" opacity="0.6" />

                    <text
                      x="18"
                      y="-10"
                      className="carto-station-title-text"
                      fill={isSelected ? "#7f1d1d" : "#1c1917"}
                      fontFamily="var(--font-display, serif)"
                      fontSize={isSelected ? "9.5" : "8"}
                      fontWeight={isSelected ? "700" : "600"}
                      letterSpacing="0.02em"
                    >
                      {st.name}
                    </text>
                    <text
                      x="18"
                      y="-2"
                      fill="#78716c"
                      fontFamily="var(--font-mono, monospace)"
                      fontSize="6.2"
                      fontWeight="500"
                    >
                      {st.alt}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 11. Scale Indicator & North Cross Arrow */}
          <g transform="translate(60, 615)" className="carto-metadata-scale">
            {/* North Compass Arrow */}
            <g transform="translate(15, 0)">
              <circle r="12" fill="none" stroke="rgba(120, 113, 100, 0.4)" strokeWidth="0.6" />
              <path d="M 0 -10 L 3 3 L 0 0 L -3 3 Z" fill="#b91c1c" />
              <path d="M 0 10 L 3 -3 L 0 0 L -3 -3 Z" fill="rgba(120, 113, 100, 0.4)" />
              <text x="0" y="-13" fill="#b91c1c" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">
                N
              </text>
            </g>

            {/* Scientific Scale Bar */}
            <g transform="translate(50, -4)">
              <text x="0" y="-4" fill="#78716c" fontSize="6" fontFamily="var(--font-mono)">
                SCALE 1 : 250,000
              </text>
              <line x1="0" y1="4" x2="80" y2="4" stroke="#44403c" strokeWidth="1.2" />
              <line x1="0" y1="1" x2="0" y2="7" stroke="#44403c" strokeWidth="1.2" />
              <line x1="40" y1="2" x2="40" y2="6" stroke="#44403c" strokeWidth="1" />
              <line x1="80" y1="1" x2="80" y2="7" stroke="#44403c" strokeWidth="1.2" />
              <text x="0" y="14" fill="#57534e" fontSize="5.5" fontFamily="var(--font-mono)">0</text>
              <text x="40" y="14" fill="#57534e" fontSize="5.5" fontFamily="var(--font-mono)" textAnchor="middle">25 km</text>
              <text x="80" y="14" fill="#57534e" fontSize="5.5" fontFamily="var(--font-mono)" textAnchor="middle">50 km</text>
            </g>
          </g>

          {/* Coordinate Border Annotations */}
          <g fill="rgba(120, 113, 100, 0.65)" fontSize="5.5" fontFamily="var(--font-mono)">
            <text x="50" y="25">34°30′ N</text>
            <text x="50" y="340">34°00′ N</text>
            <text x="50" y="650">33°00′ N</text>
            <text x="180" y="670">77°00′ E</text>
            <text x="480" y="670">77°45′ E</text>
            <text x="780" y="670">78°30′ E</text>
            <text x="940" y="670">79°00′ E</text>
          </g>
        </svg>
      </div>

      {/* 12. TECHNICAL CARTOGRAPHIC LEGEND (Inspired by Reference) */}
      {showLegend && (
        <aside className="carto-legend-panel animate-enter-3" aria-label="Map Legend">
          <div className="carto-legend-header">
            <span className="legend-title">CARTOGRAPHIC KEY</span>
            <button
              type="button"
              className="legend-close-btn"
              onClick={() => setShowLegend(false)}
              aria-label="Close legend"
            >
              <X size={13} />
            </button>
          </div>

          <div className="carto-legend-grid">
            <div className="legend-item">
              <span className="legend-symbol symbol-base">□</span>
              <span className="legend-text">Central Base / Atelier (Leh)</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol symbol-pass">◎</span>
              <span className="legend-text">High Mountain Pass (5,000m+)</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol symbol-route-solid">—</span>
              <span className="legend-text">Primary Expedition Route</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol symbol-monastery">✚</span>
              <span className="legend-text">1,000-Yr Monastic Sanctuary</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol symbol-route-pass">- -</span>
              <span className="legend-text">High-Pass Traverse</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol symbol-lake">▲</span>
              <span className="legend-text">Endorheic Lake / Station</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol symbol-boundary">···</span>
              <span className="legend-text">Protected Sanctuary Reserve</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol symbol-sightline">👁</span>
              <span className="legend-text">Pilgrim Sightline Corridor</span>
            </div>
          </div>
        </aside>
      )}

      {/* 13. Mobile Bottom Sheet / Compact Station Card Preview */}
      <div className="carto-station-sheet">
        <div className="sheet-top-row">
          <div className="sheet-station-meta">
            <span className="sheet-station-type-tag">{selectedStation.type.toUpperCase()}</span>
            <span className="sheet-station-alt">{selectedStation.alt}</span>
            <span className="sheet-station-region">{selectedStation.region}</span>
          </div>
        </div>

        <h3 className="sheet-station-title">
          {selectedStation.name} <span className="sheet-local-name">{selectedStation.localName}</span>
        </h3>
        <p className="sheet-station-desc">{selectedStation.desc}</p>
      </div>
    </div>
  );
}
