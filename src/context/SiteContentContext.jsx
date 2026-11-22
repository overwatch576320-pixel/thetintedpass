import { createContext, useContext, useState, useEffect } from "react";
import { journeyItineraries, expeditionLandmarks, artisticPractices, fieldNotesJournal } from "../data/siteData";
import { defaultAssetConfig } from "../data/assets";
import { defaultSketchbookConfig } from "../data/defaultSketchbook";
import { supabase } from "../lib";

const SiteContentContext = createContext(null);

const STORAGE_KEY = "the_tinted_pass_recreation_content_v3";
const ENQUIRIES_KEY = "the_tinted_pass_enquiries_v3";

const defaultContent = {
  // Global Header & Geo Strip
  seasonalLabel: "ATELIER SEASON 2026",
  geoStrip: "LADAKH, TRANS-HIMALAYAS · 34°09′09″ N, 77°34′30″ E · 3,500M - 5,360M",
  headerWordmark: "TTHE TINTED PASS",

  // Page 01 — Home
  heroHeading: "Beyond Generic Sightseeing",
  heroParagraph: "Curated, art-led expeditions across the mountain sanctuaries, ancient mural monasteries, and ultramarine salt lakes of Ladakh. We explore with sketchbooks, sable brushes, and pure Himalayan mineral pigments.",

  // Page 02 — Philosophy
  philosophyHeadline: "Art is the Antidote for Life",
  philosophyIntro: "We do not travel to conquer the passes; we travel to paint them, to listen to the silence of 1,000-year-old mud-brick monasteries, and to leave with a bound book of our own seeing.",
  manifestoHeading: "THE MANIFESTO",
  manifestoBody: "Most Himalayan travel is measured in kilometres rushed and summits counted. We measure it in hours spent sitting quietly with an open sketchbook, studying the geometry of prayer flags, and grinding natural mineral pigments beside ancient apricot groves.",

  // Page 03 — Journey
  journeyHeading: "Four Trans-Himalayan Journeys-",
  journeyIntro: "Carefully paced itineraries with authentic monastic access, low-altitude village stays, and dedicated daily creative hours. Capped at 6 to 10 participants per cohort.",

  // Page 04 — Explore Ladakh
  exploreHeading: "Topography of the Trans-Himalayas",
  exploreIntro: "An interactive cartographic exploration of Ladakh’s mountain sanctuaries, high passes, and endorheic lakes. Select a route to trace its path across the terrain, or inspect individual stations for their historical figures and mineral pigments.",

  // Page 05 — Art Experience
  artHeading: "The Art of Seeing: Himalayan Studio Practice",
  artIntro: "An expedition is not only a passage through landscapes. It is an opportunity to slow down, observe, interpret and create with mineral pigments and sable brushes.",

  // Page 06 — Journey Contact
  contactHeading: "Begin Your Journey",
  contactIntro: "Every journey begins with an open conversation. Cohorts are strictly limited to 6 to 10 participants to preserve monastic intimacy and individual studio mentoring.",
  contactEmail: "hello@thetintedpass.com",
  contactPhone: "+91 98765 43210",
  whatsappNumber: "+91 98765 43210",
  instagramHandle: "@thetintedpass",
  contactAddress: "Old Town Heritage Precinct, Leh, Ladakh 194101",

  // Core Structured Datasets
  expeditions: journeyItineraries,
  landmarks: expeditionLandmarks,
  artPractices: artisticPractices,
  journalEntries: fieldNotesJournal,

  // Image Asset Slots with Solid-Colour Defaults
  assets: defaultAssetConfig,

  // 3D Sketchbook Configuration
  sketchbook: defaultSketchbookConfig
};

const initialSampleEnquiries = [
  {
    id: "enq-sample-1",
    name: "Eleanor Vance",
    email: "eleanor.vance@atelier-london.org",
    country: "United Kingdom",
    phone: "+44 7700 900142",
    expedition: "The Heartland Passage (13 Days)",
    travelPeriod: "July 2026",
    participants: "2 Participants",
    artInterests: ["Watercolor", "Monastic Murals & History"],
    message: "Interested in the 11th-century Alchi mural studies and spending time in the apricot orchards with watercolor blocks.",
    status: "new",
    createdAt: "2026-11-10T14:32:00.000Z"
  },
  {
    id: "enq-sample-2",
    name: "Marcus Aurel",
    email: "m.aurel@zurich-studio.ch",
    country: "Switzerland",
    phone: "+41 79 123 4567",
    expedition: "The Grand Traverse (15 Days)",
    travelPeriod: "August 2026",
    participants: "1 Participant",
    artInterests: ["Field Sketching", "Mineral Pigments", "Photography"],
    message: "Seeking to study high-altitude light across Hanle Dark Sky Reserve and the salt flats of Tso Kar.",
    status: "contacted",
    createdAt: "2026-11-08T09:15:00.000Z"
  }
];

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultContent,
          ...parsed,
          sketchbook: {
            ...defaultSketchbookConfig,
            ...(parsed.sketchbook || {}),
            pages:
              parsed.sketchbook?.pages && parsed.sketchbook.pages.length >= defaultSketchbookConfig.pages.length
                ? parsed.sketchbook.pages
                : defaultSketchbookConfig.pages
          },
          assets: Object.fromEntries(
            Object.entries(defaultAssetConfig).map(([k, def]) => [
              k,
              { ...def, ...(parsed.assets?.[k] || {}), src: parsed.assets?.[k]?.src || def.src }
            ])
          )
        };
      }
    } catch (e) {
      console.warn("Could not load stored content from localStorage:", e);
    }
    return defaultContent;
  });

  const [enquiries, setEnquiries] = useState(() => {
    try {
      const saved = localStorage.getItem(ENQUIRIES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load stored enquiries from localStorage:", e);
    }
    return initialSampleEnquiries;
  });

  // Fetch Supabase data if configured
  useEffect(() => {
    if (!supabase) return;

    async function loadSupabaseContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("*")
          .eq("id", "main_content")
          .single();

        if (data && !error) {
          setContent((prev) => ({
            ...prev,
            ...data.content,
            assets: { ...defaultAssetConfig, ...(data.content?.assets || {}) }
          }));
        }
      } catch (err) {
        console.warn("Supabase fetch failed (offline mode):", err);
      }
    }

    async function loadSupabaseEnquiries() {
      try {
        const { data, error } = await supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && !error && data.length > 0) {
          setEnquiries(data);
        }
      } catch (err) {
        console.warn("Supabase enquiries fetch failed (offline mode):", err);
      }
    }

    loadSupabaseContent();
    loadSupabaseEnquiries();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.warn("Could not save content to localStorage:", e);
    }
  }, [content]);

  useEffect(() => {
    try {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));
    } catch (e) {
      console.warn("Could not save enquiries to localStorage:", e);
    }
  }, [enquiries]);

  // Methods
  const updateContentItem = (key, value) => {
    setContent((prev) => {
      const updated = { ...prev, [key]: value };
      if (supabase) {
        supabase
          .from("site_content")
          .upsert({ id: "main_content", content: updated, updated_at: new Date().toISOString() })
          .catch(console.error);
      }
      return updated;
    });
  };

  const updateAsset = (slotId, newConfig) => {
    setContent((prev) => {
      const currentAssets = prev.assets || defaultAssetConfig;
      const updatedSlot = { ...(currentAssets[slotId] || defaultAssetConfig[slotId] || {}), ...newConfig };
      const updated = {
        ...prev,
        assets: {
          ...currentAssets,
          [slotId]: updatedSlot
        }
      };
      if (supabase) {
        supabase
          .from("site_content")
          .upsert({ id: "main_content", content: updated, updated_at: new Date().toISOString() })
          .catch(console.error);
      }
      return updated;
    });
  };

  const resetAsset = (slotId) => {
    setContent((prev) => {
      const currentAssets = prev.assets || defaultAssetConfig;
      const defaultSlot = defaultAssetConfig[slotId];
      if (!defaultSlot) return prev;
      const updated = {
        ...prev,
        assets: {
          ...currentAssets,
          [slotId]: defaultSlot
        }
      };
      return updated;
    });
  };

  const updateFullContent = (newContent) => {
    setContent((prev) => {
      const updated = { ...prev, ...newContent };
      if (supabase) {
        supabase
          .from("site_content")
          .upsert({ id: "main_content", content: updated, updated_at: new Date().toISOString() })
          .catch(console.error);
      }
      return updated;
    });
  };

  const resetContent = () => {
    setContent(defaultContent);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const addEnquiry = async (enquiryData) => {
    const newEnquiry = {
      id: "enq-" + Date.now(),
      ...enquiryData,
      status: "new",
      createdAt: new Date().toISOString()
    };

    setEnquiries((prev) => [newEnquiry, ...prev]);

    if (supabase) {
      try {
        await supabase.from("enquiries").insert([
          {
            name: newEnquiry.name,
            email: newEnquiry.email,
            phone: newEnquiry.phone,
            country: newEnquiry.country,
            expedition: newEnquiry.expedition,
            travel_period: newEnquiry.travelPeriod,
            participants: newEnquiry.participants,
            art_interests: newEnquiry.artInterests,
            message: newEnquiry.message,
            status: "new",
            created_at: newEnquiry.createdAt
          }
        ]);
      } catch (err) {
        console.warn("Supabase insert enquiry failed:", err);
      }
    }

    return newEnquiry;
  };

  const updateEnquiryStatus = (id, newStatus) => {
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (supabase) {
      supabase.from("enquiries").update({ status: newStatus }).eq("id", id).catch(console.error);
    }
  };

  const deleteEnquiry = (id) => {
    setEnquiries((prev) => prev.filter((item) => item.id !== id));
    if (supabase) {
      supabase.from("enquiries").delete().eq("id", id).catch(console.error);
    }
  };

  const updateSketchbookSettings = (newSettings) => {
    setContent((prev) => {
      const currentBook = prev.sketchbook || defaultSketchbookConfig;
      const updated = {
        ...prev,
        sketchbook: {
          ...currentBook,
          ...newSettings
        }
      };
      if (supabase) {
        supabase
          .from("site_content")
          .upsert({ id: "main_content", content: updated, updated_at: new Date().toISOString() })
          .catch(console.error);
      }
      return updated;
    });
  };

  const updateSketchbookPages = (newPages) => {
    setContent((prev) => {
      const currentBook = prev.sketchbook || defaultSketchbookConfig;
      const updated = {
        ...prev,
        sketchbook: {
          ...currentBook,
          pages: newPages
        }
      };
      if (supabase) {
        supabase
          .from("site_content")
          .upsert({ id: "main_content", content: updated, updated_at: new Date().toISOString() })
          .catch(console.error);
      }
      return updated;
    });
  };

  const saveSketchbook = (newSketchbook) => {
    setContent((prev) => {
      const updated = {
        ...prev,
        sketchbook: {
          ...defaultSketchbookConfig,
          ...newSketchbook
        }
      };
      if (supabase) {
        supabase
          .from("site_content")
          .upsert({ id: "main_content", content: updated, updated_at: new Date().toISOString() })
          .catch(console.error);
      }
      return updated;
    });
  };

  return (
    <SiteContentContext.Provider
      value={{
        content,
        enquiries,
        updateContentItem,
        updateAsset,
        resetAsset,
        updateFullContent,
        resetContent,
        addEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,
        updateSketchbookSettings,
        updateSketchbookPages,
        saveSketchbook
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within a SiteContentProvider");
  }
  return context;
}
