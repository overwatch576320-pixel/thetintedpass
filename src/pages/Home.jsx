import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";
import Sketchbook from "../components/sketchbook/Sketchbook";

export default function Home() {
  const { content } = useSiteContent();
  const sketchbook = content.sketchbook || {};
  const isSketchbookEnabled = sketchbook.enabled !== false;

  return (
    <div className="home-page-container">
      {/* Hero Text Block */}
      <div className="home-hero-text-area">
        <div className="home-hero-eyebrow animate-enter-1">
          <span>THE TINTED PASS · TRANS-HIMALAYAS</span>
        </div>

        <h1 className="home-hero-title animate-enter-1">
          {content.heroHeading ? (
            content.heroHeading.includes("\n") ? (
              content.heroHeading.split("\n").map((line, i) => (
                <span key={i} style={{ display: "block" }}>
                  {line}
                </span>
              ))
            ) : (
              <>
                <span>Beyond Generic</span>
                <span style={{ display: "block" }}>Sightseeing</span>
              </>
            )
          ) : (
            <>
              <span>Beyond Generic</span>
              <span style={{ display: "block" }}>Sightseeing</span>
            </>
          )}
        </h1>

        <p className="home-hero-desc animate-enter-2">
          {content.heroParagraph ||
            "Curated, art-led expeditions across the mountain sanctuaries, ancient mural monasteries, and ultramarine salt lakes of Ladakh. We explore with sketchbooks, sable brushes, and pure Himalayan mineral pigments."}
        </p>

        {/* Mobile-First Cohort Specification Pill */}
        <div className="home-hero-cohort-pill animate-enter-2">
          <span className="cohort-dot" aria-hidden="true">●</span>
          <span>Atelier Cohorts 2026 · Capped at 6–10 Artists</span>
        </div>
      </div>

      {/* Interactive 3D Artist's Sketchbook Editorial Feature */}
      {isSketchbookEnabled && (
        <section
          className="home-sketchbook-stage animate-enter-2"
          aria-label="Expedition Field Journal"
        >
          <div className="home-sketchbook-editorial-header">
            <span className="home-sketchbook-eyebrow">
              {sketchbook.sectionEyebrow || "FIELD NOTES FROM THE HIMALAYAS"}
            </span>
            <h2 className="home-sketchbook-title">
              {sketchbook.sectionHeading || "A Journal of Seeing"}
            </h2>
            {sketchbook.sectionIntro && (
              <p className="home-sketchbook-intro">{sketchbook.sectionIntro}</p>
            )}
          </div>

          <div className="home-sketchbook-canvas-wrap">
            <Sketchbook bookSettings={sketchbook} pages={sketchbook.pages} />
          </div>
        </section>
      )}

      {/* Action Navigation Options */}
      <div className="home-bottom-nav-row animate-enter-3" role="navigation" aria-label="Expedition Quick Links">
        <Link to="/journey" className="home-bottom-nav-link home-primary-link">
          <span>CURATED EXPEDITIONS</span>
          <span className="home-link-icon" aria-hidden="true">↗</span>
        </Link>
        <Link to="/explore-ladakh" className="home-bottom-nav-link">
          <span>INTERACTIVE MAP</span>
        </Link>
        <Link to="/contact" className="home-bottom-nav-link">
          <span>RESERVE ATELIER</span>
        </Link>
      </div>
    </div>
  );
}
