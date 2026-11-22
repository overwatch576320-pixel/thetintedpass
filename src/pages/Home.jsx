import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";

export default function Home() {
  const { content } = useSiteContent();

  return (
    <div className="home-page-container">
      {/* =========================================================================
          DESKTOP HERO & NAVIGATION (>= 1024px, Exact Original bc6a98a Layout)
          ========================================================================= */}
      <div className="home-desktop-only">
        {/* Hero Text Block */}
        <div className="home-hero-text-area">
          <h1 className="home-hero-title animate-enter-1">
            {content.heroHeading ? (
              content.heroHeading.includes("\n") ? (
                content.heroHeading.split("\n").map((line, i) => (
                  <span key={i} className="title-line">
                    {line}
                  </span>
                ))
              ) : (
                content.heroHeading
              )
            ) : (
              <>
                <span className="title-line">THE ATELIER</span>
                <span className="title-line">OF THE SKY</span>
              </>
            )}
          </h1>
          <p className="home-hero-desc animate-enter-2">
            {content.heroParagraph ||
              "Curated, art-led expeditions across the mountain sanctuaries, ancient mural monasteries, and ultramarine salt lakes of Ladakh. We explore with sketchbooks, sable brushes, and pure Himalayan mineral pigments."}
          </p>
        </div>

        {/* Three Bottom Navigation Options */}
        <div className="home-bottom-nav-row animate-enter-3" role="navigation" aria-label="Expedition Quick Links">
          <Link to="/journey" className="home-bottom-nav-link">
            CURATED EXPEDITIONS
          </Link>
          <Link to="/explore-ladakh" className="home-bottom-nav-link">
            INTERACTIVE LADAKH MAP
          </Link>
          <Link to="/contact" className="home-bottom-nav-link">
            RESERVE ATELIER
          </Link>
        </div>
      </div>

      {/* =========================================================================
          MOBILE HERO & NAVIGATION (<= 1023px, Mobile-First Editorial Layout)
          ========================================================================= */}
      <div className="home-mobile-only">
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

          <div className="home-hero-cohort-pill animate-enter-2">
            <span className="cohort-dot" aria-hidden="true">●</span>
            <span>Atelier Cohorts 2026 · Capped at 6–10 Artists</span>
          </div>
        </div>

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
    </div>
  );
}
