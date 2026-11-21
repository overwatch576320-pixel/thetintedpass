// Central Image Asset Configuration
// Defines solid-colour placeholders and image slots across all pages.
// Per instruction: Strictly no random/stock/AI images. Use solid-colour placeholders with exact proportions.
// When actual client assets are provided later, they can be uploaded or specified in Admin CMS.

import manifestoImage from "../assets/manifesto-ladakh-easel.jpg";

export const defaultAssetConfig = {
  // Page 01 — Home: Landscape Placeholder
  homeLandscape: {
    id: "homeLandscape",
    title: "Home Mountain Landscape",
    page: "Home",
    placeholderColor: "#b8e6ee",
    placeholderBorder: "none",
    borderRadius: "0px",
    aspectRatio: "16 / 9",
    src: null,
    alt: "Trans-Himalayan mountain landscape slot"
  },

  // Page 02 — Philosophy: Chapter Visual Slots
  philosophyManifesto: {
    id: "philosophyManifesto",
    title: "Philosophy Chapter 01 — The Manifesto",
    page: "Philosophy",
    placeholderColor: "#adefea",
    placeholderBorder: "none",
    borderRadius: "14px",
    aspectRatio: "473 / 248",
    src: manifestoImage,
    alt: "Plein air easel and watercolor study before Ladakh monastery"
  },
  philosophyPleinAir: {
    id: "philosophyPleinAir",
    title: "Philosophy Chapter 02 — Plein Air Stillness",
    page: "Philosophy",
    placeholderColor: "#9ee6de",
    placeholderBorder: "none",
    borderRadius: "14px",
    aspectRatio: "473 / 248",
    src: null,
    alt: "Plein air high-altitude painting slot"
  },
  philosophyPigments: {
    id: "philosophyPigments",
    title: "Philosophy Chapter 03 — Mineral Pigments",
    page: "Philosophy",
    placeholderColor: "#93ded6",
    placeholderBorder: "none",
    borderRadius: "14px",
    aspectRatio: "473 / 248",
    src: null,
    alt: "Himalayan mineral pigment mulling slot"
  },
  philosophyJournal: {
    id: "philosophyJournal",
    title: "Philosophy Chapter 04 — The Bound Journal",
    page: "Philosophy",
    placeholderColor: "#89d6cd",
    placeholderBorder: "none",
    borderRadius: "14px",
    aspectRatio: "473 / 248",
    src: null,
    alt: "Accordion travel journal binding slot"
  },

  // Page 03 — Journey: Expedition Cards
  journeyExp1: {
    id: "journeyExp1",
    title: "Expedition 01 — The First Light",
    page: "Journey",
    placeholderColor: "#93ded6",
    placeholderBorder: "none",
    borderRadius: "10px",
    aspectRatio: "219 / 213",
    src: null,
    alt: "The First Light card preview"
  },
  journeyExp2: {
    id: "journeyExp2",
    title: "Expedition 02 — The Heartland Passage",
    page: "Journey",
    placeholderColor: "#adefea",
    placeholderBorder: "none",
    borderRadius: "10px",
    aspectRatio: "219 / 213",
    src: null,
    alt: "The Heartland Passage card preview"
  },
  journeyExp3: {
    id: "journeyExp3",
    title: "Expedition 03 — Beyond the Blue",
    page: "Journey",
    placeholderColor: "#97e1df",
    placeholderBorder: "none",
    borderRadius: "10px",
    aspectRatio: "219 / 213",
    src: null,
    alt: "Beyond the Blue card preview"
  },
  journeyExp4: {
    id: "journeyExp4",
    title: "Expedition 04 — The Grand Traverse",
    page: "Journey",
    placeholderColor: "#7ed6cf",
    placeholderBorder: "none",
    borderRadius: "10px",
    aspectRatio: "219 / 213",
    src: null,
    alt: "The Grand Traverse card preview"
  },

  // Page 03 — Journey Detail: Main Visual Slot
  journeyDetailCover: {
    id: "journeyDetailCover",
    title: "Journey Detail Selected View Visual",
    page: "Journey Detail",
    placeholderColor: "#adefea",
    placeholderBorder: "none",
    borderRadius: "10px",
    aspectRatio: "471 / 291",
    src: null,
    alt: "Selected expedition landscape slot"
  },

  // Page 04 — Explore Ladakh: Map Artwork Slot
  exploreMapArea: {
    id: "exploreMapArea",
    title: "Topographic Map Canvas",
    page: "Explore Ladakh",
    placeholderColor: "#ffffff",
    placeholderBorder: "1px solid rgba(226, 232, 240, 0.85)",
    borderRadius: "12px",
    aspectRatio: "446 / 307",
    src: null,
    alt: "Ladakh cartographic map slot"
  },

  // Page 04 — Explore Ladakh: Station Visuals
  exploreStationCover1: {
    id: "exploreStationCover1",
    title: "Station Feature Visual 1 (Leh / Central)",
    page: "Explore Ladakh",
    placeholderColor: "#adefea",
    placeholderBorder: "none",
    borderRadius: "14px",
    aspectRatio: "230 / 145",
    src: null,
    alt: "Station landscape visual 1"
  },
  exploreStationCover2: {
    id: "exploreStationCover2",
    title: "Station Feature Visual 2 (Atelier / Timeline)",
    page: "Explore Ladakh",
    placeholderColor: "#adefea",
    placeholderBorder: "none",
    borderRadius: "14px",
    aspectRatio: "230 / 145",
    src: null,
    alt: "Station landscape visual 2"
  },

  // Page 05 — Art Experience
  artExperienceHero: {
    id: "artExperienceHero",
    title: "Art Experience Studio Visual",
    page: "Art Experience",
    placeholderColor: "#adefea",
    placeholderBorder: "none",
    borderRadius: "14px",
    aspectRatio: "470 / 240",
    src: null,
    alt: "Art practice visual slot"
  },

  // Page 06 — Journey Contact
  contactAtelierBanner: {
    id: "contactAtelierBanner",
    title: "Atelier Studio Badge Visual",
    page: "Contact",
    placeholderColor: "#adefea",
    placeholderBorder: "none",
    borderRadius: "12px",
    aspectRatio: "320 / 160",
    src: null,
    alt: "Atelier contact visual slot"
  }
};
