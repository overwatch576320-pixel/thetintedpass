import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { trackPageView } from "./analytics";
import { SiteContentProvider } from "./context/SiteContentContext";
import SiteLayout from "./components/SiteLayout";
import Home from "./pages/Home";
import Philosophy from "./pages/Philosophy";
import Journey from "./pages/Journey";
import ExpeditionDetail from "./pages/ExpeditionDetail";
import ExploreLadakh from "./pages/ExploreLadakh";
import ArtExperience from "./pages/ArtExperience";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Stage1Prototype from "./components/sketchbook/v2/Stage1Prototype";
import Stage2Carousel from "./components/sketchbook/v2/Stage2Carousel";
import Stage3Prototype from "./components/sketchbook/v2/Stage3Prototype";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname).catch(console.error);
    // Guarantee no unwanted scroll offset
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <SiteContentProvider>
      <SiteLayout>
        <Routes>
          {/* Main 6 Pages Rebuilt Strictly from Photoshop References & Specifications */}
          <Route path="/" element={<Home />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/journeys" element={<Journey />} />

          {/* Individual Single-Viewport Expedition Pages */}
          <Route path="/journey/:slug" element={<ExpeditionDetail />} />
          <Route path="/journeys/:slug" element={<ExpeditionDetail />} />

          <Route path="/explore-ladakh" element={<ExploreLadakh />} />
          <Route path="/art-experience" element={<ArtExperience />} />
          <Route path="/journey-contact" element={<Contact />} />
          <Route path="/contact" element={<Contact />} />

          {/* Secure Admin CMS Dashboard */}
          <Route path="/admin" element={<Admin />} />

          {/* Clean Architecture Staged Prototypes */}
          <Route path="/stage1" element={<Stage1Prototype />} />
          <Route path="/stage2" element={<Stage2Carousel />} />
          <Route path="/stage3" element={<Stage3Prototype />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SiteLayout>
    </SiteContentProvider>
  );
}
