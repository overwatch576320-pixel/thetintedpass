import { useState } from "react";
import { Sparkles, Calendar, BookOpen, Feather, ArrowRight, User } from "lucide-react";
import HorizontalScrollStrip from "./HorizontalScrollStrip";

const timelineEvents = [
  {
    year: "c. 996 CE",
    era: "The Golden Age of Translation",
    figure: "Lotsawa Rinchen Zangpo",
    title: "Kashmiri Murals & The Frescoes of Alchi",
    location: "Alchi & Lamayuru Monastic Groves",
    quote: "Thirty-two master painters brought from the Kashmir valley, grinding riverbed ochres and imported Badakhshan lapis onto primed mud walls.",
    exercise: "Mineral pigment grinding & line rhythm studies in ancient apricot orchards.",
    image: "/figma/manifesto-background.png"
  },
  {
    year: "1860",
    era: "Victorian Plein-Air Pioneer",
    figure: "William Simpson",
    title: "Water Tins Over High Trans-Himalayan Passes",
    location: "Leh Old Town & Palace Tier",
    quote: "Simpson traversed the passes with portable water tins and rag paper, capturing the blinding morning sun against whitewashed stupas and Tibetan prayer flags.",
    exercise: "Rapid architectural street sketches and still life with hammered brass.",
    image: "/editorial/mountain-peaks.jpg"
  },
  {
    year: "1925",
    era: "The Mystic Modernist",
    figure: "Nicholas Roerich",
    title: "Sacred Geometry of the High Granite Needles",
    location: "Hemis, Stok & Indus Valley",
    quote: "Nowhere else does light achieve such transcendental purity. The peaks are not stone; they are crystal prisms reflecting cosmic cobalt and vermilion.",
    exercise: "Plein-air mountain geometry & high-contrast gouache color blocks.",
    image: "/editorial/oil-clouds.jpg"
  },
  {
    year: "1927",
    era: "Intimate High-Plains Portraiture",
    figure: "Léa Lafugie",
    title: "Nomad Life in the Changpa Highlands",
    location: "Changthang, Nyoma & Korzok",
    quote: "Living in yak-hair tents by the turquoise shores of Tso Moriri, Lafugie painted the silver-stitched turquoise Perak headdresses of nomadic matriarchs.",
    exercise: "Portrait studies with local community members and panoramic lake accords.",
    image: "/editorial/traveler-trail.png"
  },
  {
    year: "Present",
    era: "The Living Atelier",
    figure: "The Tinted Pass",
    title: "The Hand-Bound Travel Heirloom",
    location: "Leh Valley & 4 Curated Expeditions",
    quote: "We do not rush past the peaks. We sit quietly with sable brushes, grinding earth pigments, and returning home with a custom-bound book of our own seeing.",
    exercise: "Daily guided creative sessions and archival hand-bound folio curation.",
    image: "/figma/hero-bg-hd.png"
  }
];

export default function ExpeditionTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentEvent = timelineEvents[activeIndex];

  return (
    <div className="timeline-cinematic-shell">
      {/* Top Section Intro */}
      <div className="timeline-masthead">
        <div className="section-kicker-badge">
          <BookOpen size={13} /> (04) The Lineage of Travellers
        </div>
        <h2 className="section-headline">
          Mapped With Pigment, Not Just Compasses
        </h2>
        <p className="section-subline">
          The Tinted Pass is not an invention; it is the continuation of a thousand-year tradition of
          painters, chroniclers, and translators who crossed these passes to record what could not be spoken.
        </p>
      </div>

      {/* Cinematic Horizontal Station Selector with Dynamic Edge Fade */}
      <HorizontalScrollStrip
        className="timeline-selector-track"
        role="tablist"
        aria-label="Historical Milestones"
        activeKey={activeIndex}
      >
        {timelineEvents.map((evt, idx) => (
          <button
            key={evt.year}
            type="button"
            className={`timeline-milestone-btn ${activeIndex === idx ? "active" : ""}`}
            onClick={() => setActiveIndex(idx)}
            role="tab"
            aria-selected={activeIndex === idx}
          >
            <span className="milestone-year">{evt.year}</span>
            <span className="milestone-figure">{evt.figure}</span>
            <span className="milestone-era">{evt.era}</span>
          </button>
        ))}
      </HorizontalScrollStrip>

      {/* Active Milestone Cinematic Card */}
      <div className="timeline-active-stage">
        <div className="timeline-stage-media">
          <img
            src={currentEvent.image}
            alt={currentEvent.title}
            className="timeline-stage-img"
          />
          <div className="timeline-stage-gradient" />
          <div className="timeline-media-badge">
            <Calendar size={12} />
            <span>{currentEvent.year} · {currentEvent.location}</span>
          </div>
        </div>

        <div className="timeline-stage-content">
          <div className="timeline-content-kicker">
            <User size={13} /> {currentEvent.era}
          </div>
          <h3 className="timeline-content-title">
            {currentEvent.title}
          </h3>
          <span className="timeline-figure-tag">
            CHRONICLER: {currentEvent.figure}
          </span>

          <blockquote className="timeline-quote">
            “{currentEvent.quote}”
          </blockquote>

          <div className="timeline-exercise-box">
            <span className="exercise-box-label">
              <Sparkles size={12} /> CONTINUED IN OUR ATELIER
            </span>
            <p className="exercise-box-desc">
              {currentEvent.exercise}
            </p>
          </div>

          <div className="timeline-nav-buttons">
            <button
              type="button"
              className="timeline-nav-arrow"
              onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : timelineEvents.length - 1))}
              aria-label="Previous milestone"
            >
              ← Previous Era
            </button>
            <span className="timeline-counter">
              0{activeIndex + 1} / 0{timelineEvents.length}
            </span>
            <button
              type="button"
              className="timeline-nav-arrow"
              onClick={() => setActiveIndex((prev) => (prev < timelineEvents.length - 1 ? prev + 1 : 0))}
              aria-label="Next milestone"
            >
              Next Era →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
