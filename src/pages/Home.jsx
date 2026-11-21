import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext";

export default function Home() {
  const { content } = useSiteContent();

  return (
    <div className="home-page-container">
      {/* Hero Text Block */}
      <div className="home-hero-text-area">
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
  );
}
