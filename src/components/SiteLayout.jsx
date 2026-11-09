import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { whatsappLink, contactEmail } from "../lib";

const links = [
  ["/about", "The idea"],
  ["/journeys", "Journeys"],
  ["/art-practice", "The practice"],
  ["/journal", "Field notes"],
  ["/pricing", "Enquire"],
];

export default function SiteLayout({ children }) {
  const [open, setOpen] = useState(false);
  const isHome = useLocation().pathname === "/";
  return (
    <>
      <header className={isHome ? "site-header home-header" : "site-header"}>
        <Link to="/" className="wordmark" onClick={() => setOpen(false)}>
          <span className="wordmark-symbol">{isHome ? <img src="/figma/tp-monogram.png" alt="" /> : "TP"}</span>
          <span>THE TINTED PASS<small>JOURNEYS IN ART & LANDSCAPE</small></span>
        </Link>
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "main-nav open" : "main-nav"}>
          {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <a className="nav-contact" href={whatsappLink("Hello, I would like to enquire about The Tinted Pass.")} target="_blank" rel="noreferrer">
            Start a conversation <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div>
          <div className="footer-brand">THE TINTED PASS</div>
          <p>To travel slowly. To look closely. To make something of what you see.</p>
        </div>
        <div className="footer-links">
          <Link to="/journeys">Journeys</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link>
          <a href={`mailto:${contactEmail}`}>Email</a><Link to="/admin">Admin</Link>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} The Tinted Pass</span><span>Ladakh, India</span></div>
      </footer>
    </>
  );
}
