import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSiteContent } from "../context/SiteContentContext";

const navLinks = [
  { label: "home", path: "/" },
  { label: "philosophy", path: "/philosophy" },
  { label: "journey", path: "/journey" },
  { label: "explore ladakh", path: "/explore-ladakh" },
  { label: "art experience", path: "/art-experience" },
  { label: "contact", path: "/contact" }
];

export default function SiteLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { content } = useSiteContent();

  // Coordinated, zero-flash page crossfade state
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prevChildren, setPrevChildren] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("mobile-menu-active");
    } else {
      document.body.classList.remove("mobile-menu-active");
    }
    return () => {
      document.body.classList.remove("mobile-menu-active");
    };
  }, [mobileMenuOpen]);

  // Handle route change transitions smoothly
  useEffect(() => {
    if (children !== displayChildren) {
      setPrevChildren(displayChildren);
      setDisplayChildren(children);
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setPrevChildren(null);
        setIsTransitioning(false);
      }, 480);

      return () => clearTimeout(timer);
    }
  }, [children, displayChildren]);

  const isCurrentActive = (path) => {
    if (path === "/" && (location.pathname === "/" || location.pathname === "")) return true;
    if (path === "/journey") {
      return location.pathname === "/journey" || location.pathname.startsWith("/journey/") || location.pathname.startsWith("/journeys");
    }
    if (path === "/contact" || path === "/journey-contact") {
      return location.pathname.startsWith("/contact") || location.pathname.startsWith("/journey-contact");
    }
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // If on admin route, render admin workspace without public header/footer
  if (location.pathname === "/admin") {
    return <div className="admin-app-root">{children}</div>;
  }

  return (
    <div className="viewport-app">
      {/* Subtle Atmospheric Living Canvas (Zero jump across routes) */}
      <div className="site-background-canvas" aria-hidden="true" />

      {/* Global Header */}
      <header className="site-header">
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="site-brand" aria-label="The Tinted Pass Home">
          <img
            src="./figma/tp-easel-white.png"
            alt="The Tinted Pass Easel Emblem"
            className="site-brand-logo"
          />
          <div className="site-brand-wordmark">
            <span>TTHE</span>
            <span>TINTED</span>
            <span>PASS</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="site-nav" aria-label="Main Navigation">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`site-nav-link ${isCurrentActive(item.path) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Seasonal Atelier Label */}
        <div className="site-season-badge">
          {content.seasonalLabel || "ATELIER SEASON 2026"}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile Navigation Drawer with Smooth Backdrop & Slide */}
        <div
          className={`mobile-drawer ${mobileMenuOpen ? "is-open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-season">
              {content.seasonalLabel || "ATELIER SEASON 2026"}
            </span>
            <button
              type="button"
              className="mobile-drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="mobile-drawer-nav" aria-label="Mobile Menu Links">
            {navLinks.map((item, idx) => {
              const active = isCurrentActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-drawer-link ${active ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-drawer-link-num">0{idx + 1}</span>
                  <span className="mobile-drawer-link-text">{item.label}</span>
                  {active && <span className="mobile-drawer-link-badge">ACTIVE</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mobile-drawer-footer">
            <div className="mobile-drawer-geo">
              {content.geoStrip || "LADAKH, TRANS-HIMALAYAS · 3,500M - 5,360M"}
            </div>
            <div className="mobile-drawer-credit">THE TINTED PASS · ATELIER COHORTS</div>
          </div>
        </div>
      </header>

      {/* Main Single-Viewport Page Body with Seamless Stage Transitions */}
      <main className="site-main-viewport">
        <div className="page-transition-stage">
          {prevChildren && (
            <div className="page-stage-layer page-stage-exiting" aria-hidden="true">
              {prevChildren}
            </div>
          )}
          <div
            key={location.pathname}
            className={`page-stage-layer ${isTransitioning ? "page-stage-entering" : ""}`}
          >
            {displayChildren}
          </div>
        </div>
      </main>

      {/* Geographical Information Strip */}
      <div className="site-geo-strip">
        <div className="site-geo-text">
          {content.geoStrip || "LADAKH, TRANS-HIMALAYAS · 34°09′09″ N, 77°34′30″ E · 3,500M - 5,360M"}
        </div>
      </div>
    </div>
  );
}
