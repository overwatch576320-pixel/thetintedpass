import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { trackPageView } from "./analytics";
import SiteLayout from "./components/SiteLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Journeys from "./pages/Journeys";
import ArtPractice from "./pages/ArtPractice";
import Pricing from "./pages/Pricing";
import Journal from "./pages/Journal";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export default function App() {
  const location = useLocation();
  useEffect(() => { trackPageView(location.pathname).catch(console.error); }, [location.pathname]);

  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/journeys" element={<Journeys />} />
        <Route path="/art-practice" element={<ArtPractice />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SiteLayout>
  );
}
