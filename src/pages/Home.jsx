import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { whatsappLink } from "../lib";

const journeys = [
  {
    length: "10 DAYS · THE ESSENTIAL JOURNEY",
    name: "The First Light",
    route: "Leh · Sham · Nubra · Pangong",
    variant: "first",
  },
  {
    length: "14 DAYS · THE EXTENDED PASSAGE",
    name: "Beyond the Blue",
    route: "With a possible Changthang extension",
    variant: "second",
  },
];

export default function Home() {
  return <div className="home-page">
    <section className="home-hero">
      <img className="home-hero-image" src="/figma/hero-background.png" alt="A traveller walking through a high mountain landscape, with an artist’s easel in view" />
      <img className="home-hero-wash" src="/figma/hero-foreground.png" alt="" aria-hidden="true" />
      <div className="home-hero-copy">
        <h1>Travel with<br />an artist’s<br />eye.</h1>
        <p>Journeys shaped by art, landscape and the stories of those who came before us.</p>
      </div>
      <div className="home-hero-actions">
        <Link to="/journeys" className="home-hero-action">Explore the journeys <ArrowUpRight size={17} /></Link>
        <Link to="/about" className="home-hero-secondary">Discover the idea</Link>
      </div>
      <div className="home-hero-coordinates"><span>LADAKH, INDIA · 34°N / 77°E</span><a href="#home-manifesto">SCROLL TO EXPLORE ↓</a></div>
    </section>

    <section className="home-manifesto" id="home-manifesto">
      <div className="home-manifesto-copy">
        <h2>Not simply a place to visit.</h2>
        <p>The Tinted Pass creates small-group, art-led journeys through Ladakh. We follow the traces of artists, travellers and chroniclers, then make time for you to find your own way of seeing.</p>
        <p>There is room to pause, to notice the shifting light, to fill a page, and to let a landscape stay with you.</p>
        <Link className="underlined-link" to="/about">Read our approach <ArrowUpRight size={14} /></Link>
      </div>
    </section>

    <section className="home-landscape-band">
      <div className="home-band-caption"><span>01 / THE LANDSCAPE</span><span>LOOK LONGER. SEE MORE.</span></div>
    </section>

    <section className="home-journeys" id="home-journeys">
      <div className="home-journeys-heading">
        <div><div className="eyebrow">THE JOURNEYS</div><h2>Follow a route.<br /><em>Find your own story.</em></h2></div>
        <Link to="/journeys" className="underlined-link">View all journeys <ArrowUpRight size={14} /></Link>
      </div>
      <div className="home-journey-grid">
        {journeys.map(journey => <Link key={journey.name} to="/journeys" className={`home-journey-card ${journey.variant}`}>
          <div className="home-journey-art"><div className="home-journey-terrain" /></div>
          <div className="home-journey-label">{journey.length}</div>
          <h3>{journey.name}</h3>
          <p>{journey.route}</p>
        </Link>)}
      </div>
    </section>

    <section className="home-book-section">
      <div className="home-book-art"><div className="home-book-shadow" /><div className="home-book-cover">
        <span>THE TINTED PASS</span><strong>FIELD<br />NOTES</strong><small>LADAKH · A TRAVEL BOOK</small>
      </div></div>
      <div className="home-book-copy">
        <div className="eyebrow">A COMPANION FOR THE ROAD</div>
        <h2>A book that becomes<br /><em>your own record.</em></h2>
        <p>Each participant receives a thoughtfully designed A5 travel book — part guide, part sketchbook, part journal. A place for quick drawings, field notes, photographs and the small details that make a journey yours.</p>
        <Link to="/art-practice" className="underlined-link">Explore the art practice <ArrowUpRight size={14} /></Link>
      </div>
    </section>

    <section className="home-closing">
      <div className="eyebrow light">LET THE JOURNEY BEGIN</div>
      <h2>Come with curiosity.<br /><em>Leave with a point of view.</em></h2>
      <a className="button button-light" href={whatsappLink()} target="_blank" rel="noreferrer">Start a conversation <ArrowUpRight size={14} /></a>
    </section>
  </div>;
}
