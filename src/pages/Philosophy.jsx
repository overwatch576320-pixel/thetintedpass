import { useState } from "react";
import { useSiteContent } from "../context/SiteContentContext";
import SolidPlaceholder from "../components/SolidPlaceholder";
import HorizontalScrollStrip from "../components/HorizontalScrollStrip";
import useTouchSwipe from "../hooks/useTouchSwipe";
import manifestoImage from "../assets/manifesto-ladakh-easel.jpg";

const PHILOSOPHY_CHAPTERS = [
  {
    id: "manifesto",
    number: "01",
    tabLabel: "The Manifesto",
    badge: "FOUNDATIONAL THESIS",
    title: "T  H  E    M  A  N  I  F  E  S  T  O",
    slotId: "philosophyManifesto",
    slotLabel: "01 / MANIFESTO ARTWORK",
    image: manifestoImage,
    excerpt:
      "Most Himalayan travel is measured in kilometres rushed and summits counted. We measure it in hours spent sitting quietly with an open sketchbook, studying the geometry of prayer flags, and grinding natural mineral pigments beside ancient apricot groves.",
    essay:
      "In a world calibrated to speed and superficial consumption, we propose a radical deceleration. The Trans-Himalayas are not a backdrop for conquest, but an altar of timeless quietude. By replacing cameras with sketchbooks and synthetic pigments with earth and mineral stone, we forge an intimate, indelible dialogue with this sacred terrain.",
    tenets: [
      "Slowness over speed: Hours in one valley rather than rushed passes.",
      "Tactile engagement: Observing with sable brush, pen, and hand-ground color.",
      "Monastic reverence: Respecting local Buddhist architecture and ritual silence."
    ]
  },
  {
    id: "pleinair",
    number: "02",
    tabLabel: "Plein Air Stillness",
    badge: "HIGH-ALTITUDE PRACTICE",
    title: "P  L  E  I  N    A  I  R    S  T  I  L  L  N  E  S  S",
    slotId: "philosophyPleinAir",
    slotLabel: "02 / PLEIN AIR STUDY",
    excerpt:
      "At 4,000 metres, watercolour behaves with immediate urgency. The rapid evaporation in arid winds, the sharp solar ultraviolet light, and the freezing twilight demand intuitive, fearless brushwork.",
    essay:
      "Plein air in Ladakh forces radical presence. You cannot hesitate when mineral washes dry within seconds on 300gsm cold-pressed cotton rag. Every wash captures the instantaneous temperature of the mountain air, the passing shadow of a thunderhead across the salt flats, and the physical breath of the artist.",
    tenets: [
      "Ultra-rapid drying: Exploiting the arid desert atmosphere for crisp wet-on-dry layers.",
      "Direct sunlight: Working with unshielded high-altitude lumens and deep cobalt shadows.",
      "Compact kit: Portable brass water tins, travel sable brushes, and slate palettes."
    ]
  },
  {
    id: "pigments",
    number: "03",
    tabLabel: "Mineral Pigments",
    badge: "EARTH & TRADITION",
    title: "M  I  N  E  R  A  L    P  I  G  M  E  N  T  S",
    slotId: "philosophyPigments",
    slotLabel: "03 / PIGMENT MULLING",
    excerpt:
      "Grinding natural lapis lazuli from Badakhshan, cinnabar red from mountain clefts, and malachite copper greens using traditional stone mullers and organic binders.",
    essay:
      "The ancient murals of Alchi, Mangyu, and Hemis have endured for a millennium because they were painted with the very earth they inhabit. We source raw mineral chunks from historic Himalayan deposits, grinding them on slate with natural tree gums and pure glacier water to create living pigments that shimmer under changing sunlight.",
    tenets: [
      "Authentic raw materials: Lapis lazuli, cinnabar, orpiment yellow, and terra verte.",
      "Stone mulling: Hand-grinding on porphyry slabs to achieve varied crystal refraction.",
      "Timeless permanence: Mineral paints that do not fade over centuries."
    ]
  },
  {
    id: "journal",
    number: "04",
    tabLabel: "The Bound Journal",
    badge: "TACTILE CARTOGRAPHY",
    title: "T  H  E    B  O  U  N  D    J  O  U  R  N  A  L",
    slotId: "philosophyJournal",
    slotLabel: "04 / ACCORDION JOURNAL",
    excerpt:
      "Leaving the passes not with digital gigabytes, but with a hand-bound, accordion-folded linen volume filled with your personal sketches, dried flora, and Himalayan mineral wash.",
    essay:
      "The ultimate souvenir of an expedition is tactile. Each participant binds their personal travel volume at our base camp. Unfolded on a monastery sill or over a mountain fire, the accordion journal presents a continuous, flowing landscape — a tangible record of human transformation across the passes.",
    tenets: [
      "Handmade binding: Heavy Belgian linen covers and Japanese bookbinding thread.",
      "Accordion panoramic format: Allowing sketches to flow across pages as an unbroken horizon.",
      "Personal artifact: A one-of-a-kind physical heirloom of your inner and outer journey."
    ]
  }
];

export default function Philosophy() {
  const { content } = useSiteContent();
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const activeChapter = PHILOSOPHY_CHAPTERS[activeChapterIndex];

  const handleNext = () => {
    setActiveChapterIndex((prev) => (prev + 1) % PHILOSOPHY_CHAPTERS.length);
  };

  const handlePrev = () => {
    setActiveChapterIndex((prev) => (prev - 1 + PHILOSOPHY_CHAPTERS.length) % PHILOSOPHY_CHAPTERS.length);
  };

  // High-precision horizontal touch swipe navigation between chapters
  const { swipeHandlers } = useTouchSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrev,
  });

  return (
    <div className="philosophy-container">
      {/* Left Column: Heading and Description */}
      <div className="philosophy-left-col">
        <div className="philosophy-eyebrow">THE ATELIER THESIS</div>
        <h1 className="philosophy-heading animate-enter-1">
          {content.philosophyHeadline || "Art is the Antidote for Life"}
        </h1>
        <p className="philosophy-body animate-enter-2">
          {content.philosophyIntro ||
            "We do not travel to conquer the passes; we travel to paint them, to listen to the silence of 1,000-year-old mud-brick monasteries, and to leave with a bound book of our own seeing."}
        </p>
      </div>

      {/* Right Column: Enlarged White Card with Interactive Chapters */}
      <div className="philosophy-right-col">
        <div className="philosophy-white-card animate-enter-3">
          {/* Top Chapter Tabs Strip with Dynamic Edge Fade */}
          <HorizontalScrollStrip
            className="philosophy-tabs-strip"
            role="tablist"
            aria-label="Philosophy Chapters"
            activeKey={activeChapterIndex}
          >
            {PHILOSOPHY_CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                type="button"
                className={`philosophy-tab-btn ${idx === activeChapterIndex ? "active" : ""}`}
                onClick={() => {
                  setActiveChapterIndex(idx);
                  setIsDossierOpen(false);
                }}
                role="tab"
                aria-selected={idx === activeChapterIndex}
              >
                <span className="tab-num">{ch.number}</span>
                <span>{ch.tabLabel}</span>
              </button>
            ))}
          </HorizontalScrollStrip>

          {/* Main Card Content (Artwork + Manifesto Excerpt with Touch Swipe) */}
          <div
            key={activeChapter.id}
            className="philosophy-card-content discipline-crossfade"
            {...swipeHandlers}
          >
            <SolidPlaceholder
              slotId={activeChapter.slotId}
              src={activeChapter.image}
              className="philosophy-image-slot"
            >
              <span className="philosophy-slot-tag">{activeChapter.slotLabel}</span>
            </SolidPlaceholder>

            <div className="philosophy-manifesto-content">
              <div>
                <div className="philosophy-badge-row">
                  <span className="philosophy-badge">{activeChapter.badge}</span>
                  <span className="philosophy-stepper">
                    {activeChapter.number} / 0{PHILOSOPHY_CHAPTERS.length}
                  </span>
                </div>
                <h2 className="philosophy-manifesto-heading">
                  {activeChapterIndex === 0 && content.manifestoHeading
                    ? content.manifestoHeading
                    : activeChapter.title}
                </h2>
                <p className="philosophy-manifesto-text">
                  {activeChapterIndex === 0 && content.manifestoBody
                    ? content.manifestoBody
                    : activeChapter.excerpt}
                </p>
              </div>

              {/* Mobile In-Place Progressive Disclosure Accordion */}
              <div className="philosophy-mobile-accordion">
                <button
                  type="button"
                  className="philosophy-mobile-expand-btn"
                  onClick={() => setIsDossierOpen(!isDossierOpen)}
                  aria-expanded={isDossierOpen}
                  aria-label={isDossierOpen ? "Close Atelier Essay" : "Read Full Atelier Essay & Tenets"}
                >
                  <span>{isDossierOpen ? "Close Atelier Essay" : "Read Full Atelier Essay & Tenets"}</span>
                  <span className="expand-chevron" aria-hidden="true">{isDossierOpen ? "↑" : "↓"}</span>
                </button>
                {isDossierOpen && (
                  <div className="philosophy-mobile-essay-content">
                    <p className="philosophy-mobile-essay-p">{activeChapter.essay}</p>
                    <div className="philosophy-tenets-box">
                      <div className="philosophy-tenets-heading">Atelier Core Tenets</div>
                      {activeChapter.tenets.map((tenet, i) => (
                        <div key={i} className="philosophy-mobile-tenet">
                          <span className="tenet-bullet">•</span>
                          <span>{tenet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Bottom Actions Row */}
              <div className="philosophy-bottom-actions desktop-only-actions">
                <button
                  type="button"
                  className="philosophy-read-btn"
                  onClick={() => setIsDossierOpen(true)}
                  aria-label="Read complete chapter essay"
                >
                  <span>Read Full Atelier Essay</span>
                  <span aria-hidden="true">→</span>
                </button>

                <div className="philosophy-nav-arrows">
                  <button
                    type="button"
                    className="philosophy-arrow-btn"
                    onClick={handlePrev}
                    aria-label="Previous Chapter"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="philosophy-arrow-btn"
                    onClick={handleNext}
                    aria-label="Next Chapter"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Full In-Card Reading Dossier Overlay */}
          {isDossierOpen && (
            <div className="philosophy-dossier-view desktop-only-dossier" role="dialog" aria-modal="true">
              <div className="philosophy-dossier-header">
                <div>
                  <span className="philosophy-badge">{activeChapter.badge}</span>
                  <h3 className="philosophy-dossier-title">{activeChapter.title}</h3>
                </div>
                <button
                  type="button"
                  className="philosophy-dossier-close"
                  onClick={() => setIsDossierOpen(false)}
                >
                  ✕ Close Essay
                </button>
              </div>

              <div className="philosophy-dossier-body">
                <p className="philosophy-dossier-essay">{activeChapter.essay}</p>

                <div className="philosophy-tenets-list">
                  <div className="philosophy-tenet-title">Atelier Core Tenets</div>
                  {activeChapter.tenets.map((tenet, i) => (
                    <div key={i} className="philosophy-tenet-item">
                      <span style={{ color: "#0284c7", fontWeight: 800 }}>•</span>
                      <span>{tenet}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="philosophy-bottom-actions" style={{ marginTop: "auto", borderTop: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  className="philosophy-read-btn"
                  onClick={() => setIsDossierOpen(false)}
                >
                  ← Back to Artwork &amp; Overview
                </button>
                <div className="philosophy-nav-arrows">
                  <button
                    type="button"
                    className="philosophy-arrow-btn"
                    onClick={handlePrev}
                    aria-label="Previous Chapter"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="philosophy-arrow-btn"
                    onClick={handleNext}
                    aria-label="Next Chapter"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
